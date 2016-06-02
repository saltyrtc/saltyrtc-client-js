// Integration tests
//
// Note that these tests require a running SaltyRTC server instance.
// Configure the server in `tests/config.ts`.

/// <reference path="jasmine.d.ts" />

import { Config } from "./config";
import { SaltyRTC, KeyStore, State } from "../saltyrtc/main";

function sleep(milliseconds: number): Promise<{}> {
    return new Promise(function(resolve) {
        window.setTimeout(resolve, milliseconds);
    });
}

export default () => { describe('Integration Tests', () => {

    describe('SaltyRTC', () => {

        beforeEach(() => {
            this.initiator = new SaltyRTC(new KeyStore(),
                                          Config.SALTYRTC_HOST,
                                          Config.SALTYRTC_PORT).asInitiator();

            let path = this.initiator.publicKeyHex;
            let authToken = this.initiator.authTokenBytes;
            this.responder = new SaltyRTC(new KeyStore(),
                                          Config.SALTYRTC_HOST,
                                          Config.SALTYRTC_PORT).asResponder(path, authToken);
        });

        it('connect (initiator first)', async (done) => {
            expect(this.initiator.state).toEqual('unknown');
            expect(this.responder.state).toEqual('unknown');
            this.initiator.connect();
            expect(this.initiator.state).toEqual('ws-connecting');
            await sleep(1500);
            this.responder.connect();
            expect(this.responder.state).toEqual('ws-connecting');
            done();
        });

        it('connect (responder first)', async (done) => {
            expect(this.initiator.state).toEqual('unknown');
            expect(this.responder.state).toEqual('unknown');
            this.responder.connect();
            expect(this.responder.state).toEqual('ws-connecting');
            await sleep(1500);
            this.initiator.connect();
            expect(this.initiator.state).toEqual('ws-connecting');
            done();
        });

    });

}); }
