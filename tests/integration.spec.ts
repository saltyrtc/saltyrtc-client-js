// Integration tests
//
// Note that these tests require a running SaltyRTC server instance.
// Configure the server in `tests/config.ts`.

/// <reference path="jasmine.d.ts" />

import { Config } from "./config";
import { sleep } from "./utils";
import { SaltyRTC, KeyStore, State } from "../saltyrtc/main";

export default () => { describe('Integration Tests', () => {

    describe('SaltyRTC', () => {

        beforeEach(() => {
            this.initiator = new SaltyRTC(new KeyStore(),
                                          Config.SALTYRTC_HOST,
                                          Config.SALTYRTC_PORT).asInitiator();

            let pubKey = this.initiator.permanentKeyBytes;
            let authToken = this.initiator.authTokenBytes;
            this.responder = new SaltyRTC(new KeyStore(),
                                          Config.SALTYRTC_HOST,
                                          Config.SALTYRTC_PORT).asResponder(pubKey, authToken);
        });

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
            expect(this.initiator.state).toBe('open');
            expect(this.responder.state).toBe('open');
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
            expect(this.initiator.state).toBe('open');
            expect(this.responder.state).toBe('open');
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
            this.initiator.onConnected = callback;
            this.responder.onConnected = callback;
            t1 = new Date();
            this.initiator.connect();
            this.responder.connect();
        });

    });

}); }
