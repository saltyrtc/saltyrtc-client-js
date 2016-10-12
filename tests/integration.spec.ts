// Integration tests
//
// Note that these tests require a running SaltyRTC server instance.
// Configure the server in `tests/config.ts`.

/// <reference path="jasmine.d.ts" />
/// <reference path="../saltyrtc/saltyrtc.d.ts" />
/// <reference path="../saltyrtc/types/RTCPeerConnection.d.ts" />

import { Config } from "./config";
import { sleep } from "./utils";
import { SaltyRTCBuilder, KeyStore } from "../saltyrtc/main";
import { DummyTask, PingPongTask } from "./testtasks";

export default () => { describe('Integration Tests', function() {

    beforeEach(() => {
        this.initiator = new SaltyRTCBuilder()
            .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
            .withKeyStore(new KeyStore())
            .usingTasks([new DummyTask()])
            .asInitiator() as saltyrtc.SaltyRTC;

        let pubKey = this.initiator.permanentKeyBytes;
        let authToken = this.initiator.authTokenBytes;
        this.responder = new SaltyRTCBuilder()
            .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
            .withKeyStore(new KeyStore())
            .initiatorInfo(pubKey, authToken)
            .usingTasks([new DummyTask()])
            .asResponder() as saltyrtc.SaltyRTC;

        // Helper function. Connect both clients and resolve once they both finished the peer handshake.
        this.connectBoth = (a, b) => {
            let ready = 0;
            return new Promise((resolve) => {
                const handler = () => { if (++ready == 2) resolve() };
                a.once('state-change:task', handler);
                b.once('state-change:task', handler);
                a.connect();
                b.connect();
            });
        }
    });

    describe('SaltyRTC', () => {

        it('connect (initiator first)', async (done) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');
            this.initiator.connect();
            expect(this.initiator.state).toEqual('ws-connecting');
            await sleep(1000);
            expect(this.initiator.state === 'server-handshake' ||
                   this.initiator.state === 'peer-handshake').toBe(true);
            this.responder.connect();
            expect(this.responder.state).toEqual('ws-connecting');
            await sleep(1000);
            expect(this.initiator.state).toBe('task');
            expect(this.responder.state).toBe('task');
            done();
        });

        it('connect (responder first)', async (done) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');
            this.responder.connect();
            expect(this.responder.state).toEqual('ws-connecting');
            await sleep(1000);
            expect(this.responder.state === 'server-handshake' ||
                   this.responder.state === 'peer-handshake').toBe(true);
            this.initiator.connect();
            expect(this.initiator.state).toEqual('ws-connecting');
            await sleep(1000);
            expect(this.initiator.state).toBe('task');
            expect(this.responder.state).toBe('task');
            done();
        });

        it('connect speed', async (done) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');
            let t1, t2;
            let ready = 0;
            let callback = () => {
                ready += 1;
                if (ready == 2) {
                    t2 = new Date();
                    let diffMs = t2 - t1;
                    console.info('Full handshake took', diffMs, 'milliseconds');
                    expect(diffMs).toBeLessThan(1000);
                    done();
                }
            };
            this.initiator.on('state-change:task', callback);
            this.responder.on('state-change:task', callback);
            t1 = new Date();
            this.initiator.connect();
            this.responder.connect();
        });

        it('disconnect before peer handshake', async (done) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');
            this.initiator.connect();
            await sleep(1000);
            expect(this.initiator.state).toEqual('peer-handshake');
            expect(this.responder.state).toEqual('new');
            this.initiator.once('connection-closed', (ev) => {
                expect(this.initiator.state).toEqual('closed');
                done();
            });
            this.initiator.disconnect();
        });

        it('disconnect after peer handshake', async (done) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');
            await this.connectBoth(this.initiator, this.responder);
            this.initiator.once('connection-closed', (ev) => {
                expect(this.initiator.state).toEqual('closed');
                done();
            });
            this.initiator.disconnect();
        });

        it('new-responder event (responder first)', async (done) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');

            // Create two responders
            const pubKey = this.initiator.permanentKeyBytes;
            const authToken = this.initiator.authTokenBytes;
            let responder1 = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withKeyStore(new KeyStore())
                .initiatorInfo(pubKey, authToken)
                .usingTasks([new DummyTask()])
                .asResponder();
            let responder2 = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withKeyStore(new KeyStore())
                .initiatorInfo(pubKey, authToken)
                .usingTasks([new DummyTask()])
                .asResponder();
            expect(responder1.state).toEqual('new');
            expect(responder2.state).toEqual('new');

            // Register event handler
            let eventCounter = 0;
            this.initiator.on('new-responder', (ev) => eventCounter += 1);
            responder1.on('new-responder', (id) => expect(true).toBe(false));
            responder2.on('new-responder', (id) => expect(true).toBe(false));

            // Connect responders
            responder1.connect();
            responder2.connect();
            await sleep(1000);
            expect(eventCounter).toBe(0);

            // Connect initiator
            this.initiator.connect();
            await sleep(1000);
            expect(eventCounter).toBe(2);

            done();
        });

        it('new-responder event (initiator first)', async (done) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');

            // Register event handler
            let eventCounter = 0;
            this.initiator.on('new-responder', (ev) => eventCounter += 1);
            this.responder.on('new-responder', (id) => expect(true).toBe(false));

            // Connect initiator
            this.initiator.connect();
            await sleep(1000);
            expect(eventCounter).toBe(0);

            // Connect responder
            this.responder.connect();
            await sleep(1000);
            expect(eventCounter).toBe(1);

            done();
        });

        it('getting peer permanent key', async (done) => {
            await this.connectBoth(this.initiator, this.responder);
            expect(this.initiator.peerPermanentKeyBytes).toEqual(this.responder.permanentKeyBytes);
            expect(this.responder.peerPermanentKeyBytes).toEqual(this.initiator.permanentKeyBytes);
            expect(this.initiator.peerPermanentKeyHex).toEqual(this.responder.permanentKeyHex);
            expect(this.responder.peerPermanentKeyHex).toEqual(this.initiator.permanentKeyHex);
            done();
        });

        it('using trusted keys to connect', async (done) => {
            // Generate keys
            const oldInitiator = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withKeyStore(new KeyStore())
                .usingTasks([new DummyTask()])
                .asInitiator();
            const oldResponder = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withKeyStore(new KeyStore())
                .initiatorInfo(oldInitiator.permanentKeyBytes, oldInitiator.authTokenBytes)
                .usingTasks([new DummyTask()])
                .asResponder();
            const initiatorPublicKey = oldInitiator.permanentKeyBytes;
            const responderPublicKey = oldResponder.permanentKeyBytes;

            // Use trusted keys to connect
            const initiator = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withKeyStore(oldInitiator.keyStore)
                .withTrustedPeerKey(responderPublicKey)
                .usingTasks([new DummyTask()])
                .asInitiator();
            const responder = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withKeyStore(oldResponder.keyStore)
                .withTrustedPeerKey(initiatorPublicKey)
                .usingTasks([new DummyTask()])
                .asResponder();

            expect(initiator.state).toEqual('new');
            expect(responder.state).toEqual('new');

            await this.connectBoth(initiator, responder);

            expect(initiator.state).toEqual('task');
            expect(responder.state).toEqual('task');
            done();
        });

    });

}); }
