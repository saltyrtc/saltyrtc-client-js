// tslint:disable:file-header
// tslint:disable:no-reference

// Integration tests
//
// Note that these tests require a running SaltyRTC server instance.
// Configure the server in `tests/config.ts`.

/// <reference path='jasmine.d.ts' />
/// <reference path='../saltyrtc-client.d.ts' />

import * as nacl from 'tweetnacl';
import { explainCloseCode } from '../src/closecode';
import { KeyStore, SaltyRTCBuilder } from '../src/main';
import { Config } from './config';
import { DummyTask, PingPongTask } from './testtasks';
import { sleep } from './utils';

export default () => { describe('Integration Tests', function() {

    beforeEach(() => {
        this.initiator = new SaltyRTCBuilder()
            .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
            .withLoggingLevel('warn')
            .withKeyStore(new KeyStore())
            .usingTasks([new DummyTask()])
            .asInitiator() as saltyrtc.SaltyRTC;

        const pubKey = this.initiator.permanentKeyBytes;
        const authToken = this.initiator.authTokenBytes;
        this.responder = new SaltyRTCBuilder()
            .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
            .withLoggingLevel('warn')
            .withKeyStore(new KeyStore())
            .initiatorInfo(pubKey, authToken)
            .usingTasks([new DummyTask()])
            .asResponder() as saltyrtc.SaltyRTC;

        // Helper function. Connect both clients and resolve once they both finished the peer handshake.
        this.connectBoth = (a: saltyrtc.SaltyRTC, b: saltyrtc.SaltyRTC) => {
            let ready = 0;
            return new Promise((resolve) => {
                const handler = () => { if (++ready == 2) resolve() };
                a.once('state-change:task', handler);
                b.once('state-change:task', handler);
                a.connect();
                b.connect();
            });
        };
    });

    describe('SaltyRTC', () => {

        it('connect (initiator first)', async () => {
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
        });

        it('connect (responder first)', async () => {
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
        });

        it('connect speed', (done: any) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');
            let t1: Date;
            let t2;
            let ready = 0;
            const callback = () => {
                ready += 1;
                if (ready === 2) {
                    t2 = new Date();
                    const diffMs = t2.valueOf() - t1.valueOf();
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

        it('disconnect before peer handshake', async (done: any) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');
            this.initiator.connect();
            await sleep(1000);
            expect(this.initiator.state).toEqual('peer-handshake');
            expect(this.responder.state).toEqual('new');
            this.initiator.once('connection-closed', (ev: saltyrtc.SaltyRTCEvent) => {
                expect(ev.data).toEqual(1000);
                expect(this.initiator.state).toEqual('closed');
                done();
            });
            this.initiator.disconnect();
        });

        it('disconnect after peer handshake', async (done: any) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');
            await this.connectBoth(this.initiator, this.responder);
            this.initiator.once('connection-closed', (ev: saltyrtc.SaltyRTCEvent) => {
                expect(ev.data).toEqual(1000);
                expect(this.initiator.state).toEqual('closed');
                done();
            });
            this.initiator.disconnect();
        });

        it('new-responder event (responders first, parallel)', async (done: any) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');

            // Create two responders
            const pubKey = this.initiator.permanentKeyBytes;
            const authToken = this.initiator.authTokenBytes;
            const responder1 = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withLoggingLevel('warn')
                .withKeyStore(new KeyStore())
                .initiatorInfo(pubKey, authToken)
                .usingTasks([new DummyTask()])
                .asResponder();
            const responder2 = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withLoggingLevel('warn')
                .withKeyStore(new KeyStore())
                .initiatorInfo(pubKey, authToken)
                .usingTasks([new DummyTask()])
                .asResponder();
            expect(responder1.state).toEqual('new');
            expect(responder2.state).toEqual('new');

            // Register event handler
            let eventCounter = 0;
            this.initiator.on('new-responder', () => eventCounter += 1);
            responder1.on('new-responder', () => done.fail());
            responder2.on('new-responder', () => done.fail());

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

        it('new-responder event (initiator first, single responder)', async (done: any) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');

            // Register event handler
            let eventCounter = 0;
            this.initiator.on('new-responder', () => eventCounter += 1);
            this.responder.on('new-responder', () => done.fail());

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

        it('new-responder event (initiator first, multiple responders)', async (done: any) => {
            // Create two responders
            const pubKey = this.initiator.permanentKeyBytes;
            const authToken = this.initiator.authTokenBytes;
            const responder1 = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withLoggingLevel('warn')
                .withKeyStore(new KeyStore())
                .initiatorInfo(pubKey, authToken)
                .usingTasks([new DummyTask()])
                .asResponder();
            const responder2 = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withLoggingLevel('warn')
                .withKeyStore(new KeyStore())
                .initiatorInfo(pubKey, authToken)
                .usingTasks([new DummyTask()])
                .asResponder();
            expect(responder1.state).toEqual('new');
            expect(responder2.state).toEqual('new');

            // Register event handler
            const firstResponderConnectedPromise = new Promise((resolve) => {
                this.initiator.on('new-responder', resolve);
            });

            // Connect initiator
            this.initiator.on('connection-closed', () =>
                done.fail('Connection closed before all responders have been connected'));
            await new Promise((resolve) => {
                this.initiator.on('state-change:peer-handshake', resolve);
                this.initiator.connect();
            });

            // Connect responders
            // Note: We wait until the task kicked in as that has resulted in
            //       an exception in the past.
            await new Promise((resolve) => {
                responder1.on('state-change:task', resolve);
                responder1.connect();
            });
            const secondResponderDroppedPromise = new Promise((resolve) => {
                responder2.on('state-change:closed', resolve);
                responder2.connect();
            });

            // Ensure the first responder has been connected and the second
            // responder has been dropped.
            await Promise.all([firstResponderConnectedPromise, secondResponderDroppedPromise]);
            expect(responder1.state).toEqual('task');
            expect(responder2.state).toEqual('closed');
            done();
        });

        it('getting peer permanent key', async () => {
            await this.connectBoth(this.initiator, this.responder);
            expect(this.initiator.peerPermanentKeyBytes).toEqual(this.responder.permanentKeyBytes);
            expect(this.responder.peerPermanentKeyBytes).toEqual(this.initiator.permanentKeyBytes);
            expect(this.initiator.peerPermanentKeyHex).toEqual(this.responder.permanentKeyHex);
            expect(this.responder.peerPermanentKeyHex).toEqual(this.initiator.permanentKeyHex);
        });

        it('using trusted keys to connect', async () => {
            // Generate keys
            const oldInitiator = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withLoggingLevel('warn')
                .withKeyStore(new KeyStore())
                .usingTasks([new DummyTask()])
                .asInitiator();
            const oldResponder = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withLoggingLevel('warn')
                .withKeyStore(new KeyStore())
                .initiatorInfo(oldInitiator.permanentKeyBytes, oldInitiator.authTokenBytes)
                .usingTasks([new DummyTask()])
                .asResponder();
            const initiatorPublicKey = oldInitiator.permanentKeyBytes;
            const responderPublicKey = oldResponder.permanentKeyBytes;

            // Use trusted keys to connect
            const initiator = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withLoggingLevel('warn')
                .withKeyStore(oldInitiator.keyStore)
                .withTrustedPeerKey(responderPublicKey)
                .usingTasks([new DummyTask()])
                .asInitiator();
            const responder = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withLoggingLevel('warn')
                .withKeyStore(oldResponder.keyStore)
                .withTrustedPeerKey(initiatorPublicKey)
                .usingTasks([new DummyTask()])
                .asResponder();

            expect(initiator.state).toEqual('new');
            expect(responder.state).toEqual('new');

            await this.connectBoth(initiator, responder);

            expect(initiator.state).toEqual('task');
            expect(responder.state).toEqual('task');
        });

        it('validate server auth success (initiator)', (done: any) => {
            const initiator = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withLoggingLevel('warn')
                .withKeyStore(new KeyStore())
                .usingTasks([new DummyTask()])
                .withServerKey(Config.SALTYRTC_SERVER_PUBLIC_KEY)
                .asInitiator();
            expect(initiator.state).toEqual('new');
            initiator.connect();
            initiator.once('state-change:peer-handshake', done);
        });

        it('validate server auth validation fail (initiator)', (done: any) => {
            const initiator = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withLoggingLevel('warn')
                .withKeyStore(new KeyStore())
                .usingTasks([new DummyTask()])
                .withServerKey('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
                .asInitiator();
            initiator.connect();
            initiator.once('state-change:peer-handshake', () => {
                done.fail('Invalid server public key was not detected');
            });
            initiator.once('state-change:closed', () => {
                expect(initiator.state).toEqual('closed');
                done();
            });
        });

        it('validate server auth success (responder)', (done: any) => {
            const responder = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withLoggingLevel('warn')
                .withKeyStore(new KeyStore())
                .usingTasks([new DummyTask()])
                .withServerKey(Config.SALTYRTC_SERVER_PUBLIC_KEY)
                .initiatorInfo(nacl.randomBytes(32), nacl.randomBytes(32))
                .asResponder();
            expect(responder.state).toEqual('new');
            responder.connect();
            responder.once('state-change:peer-handshake', done);
        });

        it('connect dynamically using factory function', (done: any) => {
            const responder = new SaltyRTCBuilder()
                .connectWith(() => {
                    return {
                        host: Config.SALTYRTC_HOST,
                        port: Config.SALTYRTC_PORT,
                    };
                })
                .withLoggingLevel('warn')
                .withKeyStore(new KeyStore())
                .usingTasks([new DummyTask()])
                .withServerKey(Config.SALTYRTC_SERVER_PUBLIC_KEY)
                .initiatorInfo(nacl.randomBytes(32), nacl.randomBytes(32))
                .asResponder();
            expect(responder.state).toEqual('new');
            responder.connect();
            responder.once('state-change:peer-handshake', done);
        });

        it('validate server auth validation fail (responder)', (done: any) => {
            const responder = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withLoggingLevel('warn')
                .withKeyStore(new KeyStore())
                .usingTasks([new DummyTask()])
                .withServerKey('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
                .initiatorInfo(nacl.randomBytes(32), nacl.randomBytes(32))
                .asResponder();
            responder.connect();
            responder.once('state-change:peer-handshake', () => {
                done.fail('Invalid server public key was not detected');
            });
            responder.once('state-change:closed', () => {
                expect(responder.state).toEqual('closed');
                done();
            });
        });

        it('send connection-closed event only once', async () => {
            const initiator = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withLoggingLevel('warn')
                .withKeyStore(new KeyStore())
                .usingTasks([new DummyTask()])
                .withServerKey(Config.SALTYRTC_SERVER_PUBLIC_KEY)
                .asInitiator();
            let count = 0;
            initiator.on('connection-closed', () => {
                count += 1
            });
            initiator.connect();
            await sleep(100);
            (initiator as any).signaling.closeWebsocket(3001);
            await sleep(100);
            expect(count).toEqual(1);
        });

        it('can send application messages', async (done: any) => {
            await this.connectBoth(this.initiator, this.responder);
            expect(this.initiator.state).toEqual('task');
            expect(this.responder.state).toEqual('task');
            this.initiator.once('application', (ev: saltyrtc.SaltyRTCEvent) => {
                expect(ev.data).toEqual('bonan tagon.');
                this.initiator.sendApplicationMessage('saluton!');
            });
            this.responder.once('application', (ev: saltyrtc.SaltyRTCEvent) => {
                expect(ev.data).toEqual('saluton!');
                done();
            });
            this.responder.sendApplicationMessage('bonan tagon.');
        });

        const slowdescribe = Config.RUN_LOAD_TESTS ? describe : xdescribe;
        slowdescribe('slow load tests', () => {
            let originalTimeout: number;
            beforeEach(function() {
                originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
                jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
            });
            afterEach(function() {
                jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
            });

            /**
             * Note: For this test to work, the WebSocket connection limit needs to be increased to at least 260.
             *
             * - Firefox: about:config -> network.websocket.max-connections
             * - Chrome: Not possible.
             */
            it('drops inactive responders when the path gets full', async (done: any) => {
                this.initiator.connect();
                await new Promise((resolve) => this.initiator.once('state-change:peer-handshake', resolve));

                // Create 254 responders to fill all available slots
                let connected = 0;
                await new Promise((resolve) => {
                    const responders = [];
                    for (let i = 0x02; i <= 0xff; i++) {
                        const r = new SaltyRTCBuilder()
                            .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                            .withLoggingLevel('warn')
                            .withKeyStore(new KeyStore())
                            .usingTasks([new DummyTask()])
                            .initiatorInfo(this.initiator.permanentKeyBytes, this.initiator.authTokenBytes)
                            .asResponder();

                        // Make sure that these responders don't initiate the peer handshake
                        (r as any).signaling.initPeerHandshake = function() {
                            console.debug(this.logTag, 'Not starting peer handshake');
                        };

                        // Wait for all responders to connect
                        r.once('state-change:peer-handshake', () => {
                            if (++connected === 254) {
                                resolve();
                            }
                        });

                        r.connect();
                        responders.push(r);
                    }
                });
                expect(connected).toEqual(254);

                // Connect with the real responder
                console.debug('====== Connecting real responder ======');
                const responder = new SaltyRTCBuilder()
                    .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                    .withLoggingLevel('warn')
                    .withKeyStore(new KeyStore())
                    .usingTasks([new DummyTask()])
                    .initiatorInfo(this.initiator.permanentKeyBytes, this.initiator.authTokenBytes)
                    .asResponder();
                responder.once('state-change:task', () => {
                    done();
                });
                responder.once('connection-closed', (ev) => {
                    done.fail('Real responder could not connect: ' + explainCloseCode(ev.data));
                });
                responder.connect();
            });

        });

    });

    describe('Tasks', () => {
        it('can send a ping pong task message', async () => {
            // Create peers
            const initiator = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withLoggingLevel('warn')
                .withKeyStore(new KeyStore())
                .usingTasks([new PingPongTask()])
                .asInitiator();
            const responder = new SaltyRTCBuilder()
                .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
                .withLoggingLevel('warn')
                .withKeyStore(new KeyStore())
                .initiatorInfo(initiator.permanentKeyBytes, initiator.authTokenBytes)
                .usingTasks([new PingPongTask()])
                .asResponder();

            // Chosen task should be null
            expect(initiator.getTask()).toBeNull();
            expect(responder.getTask()).toBeNull();

            // Connect
            expect(initiator.state).toEqual('new');
            expect(responder.state).toEqual('new');
            await this.connectBoth(initiator, responder);
            expect(initiator.state).toEqual('task');
            expect(responder.state).toEqual('task');

            // Chosen task should be PingPongTask
            expect(initiator.getTask() instanceof PingPongTask).toEqual(true);
            expect(responder.getTask() instanceof PingPongTask).toEqual(true);

            // Wait for ping-pong messages
            await sleep(500);

            // Check whether ping-pong has happened
            expect((responder.getTask() as PingPongTask).sentPong).toBeTruthy();
            expect((initiator.getTask() as PingPongTask).receivedPong).toBeTruthy();
            expect((responder.getTask() as PingPongTask).receivedPong).toBeFalsy();
            expect((initiator.getTask() as PingPongTask).sentPong).toBeFalsy();

            // Disconnect
            initiator.disconnect();
            responder.disconnect();

            // Await close events
            await sleep(300);
            expect(initiator.state).toEqual('closed');
            expect(responder.state).toEqual('closed');
        })
    });

}); };
