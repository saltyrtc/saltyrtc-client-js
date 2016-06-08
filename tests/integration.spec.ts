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
            this.initiator.on('connected', callback);
            this.responder.on('connected', callback);
            t1 = new Date();
            this.initiator.connect();
            this.responder.connect();
        });

        /**
         * Send round-trip custom data.
         */
        it('sending data', async (done) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');
            function connectBoth(a, b) {
                let ready = 0;
                return new Promise((resolve) => {
                    a.once('connected', () => { ready += 1; if (ready == 2) resolve(); });
                    b.once('connected', () => { ready += 1; if (ready == 2) resolve(); });
                    a.connect();
                    b.connect();
                });
            }
            await connectBoth(this.initiator, this.responder);
            this.responder.on('data:fondue', (msg) => {
                expect(msg.type).toBe('data:fondue');
                expect(msg.data).toBe('Your fondue is ready!');
                this.responder.sendData('thanks', ['merci', 'danke', 'grazie'])
            });
            this.initiator.on('data:thanks', (msg) => {
                expect(msg.type).toBe('data:thanks');
                expect(msg.data[0]).toBe('merci');
                expect(msg.data[1]).toBe('danke');
                expect(msg.data[2]).toBe('grazie');
                done();
            });
            this.initiator.sendData('fondue', 'Your fondue is ready!');
        });

    });

}); }
