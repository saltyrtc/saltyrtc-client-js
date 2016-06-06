/// <reference path="jasmine.d.ts" />

import { Signaling, State } from "../saltyrtc/signaling";
import { SaltyRTC } from "../saltyrtc/client";
import { KeyStore } from "../saltyrtc/keystore";

class FakeSaltyRTC {
    onConnected(ev) {}
    onConnectionError(ev) {}
    onConnectionClosed(ev) {}
}

class FakeWebSocket {
    url: string;
    subprotocols: string | string[];
    eventListeners: Object = {};
    binaryType: string = 'blob';

    constructor(url: string, subprotocols: string | string[]) {
        this.url = url;
        this.subprotocols = subprotocols;
    }

    addEventListener(event: string, func) {
        if (typeof this.eventListeners[event] === 'undefined') {
            this.eventListeners[event] = [func];
        } else {
            this.eventListeners[event].push(func);
        }
    } 
}

export default () => { describe('signaling', () => {

    describe('Signaling', () => {

        beforeEach(() => {
            this.fakeSaltyRTC = new FakeSaltyRTC() as SaltyRTC;
            this.keyStore = new KeyStore();
            this.sig = new Signaling(this.fakeSaltyRTC, '127.0.0.1', 8765, this.keyStore);
        });

        describe('connect', () => {

            beforeEach(() => {
                spyOn(window, 'WebSocket').and.callFake((url, subprotocols) => new FakeWebSocket(url, subprotocols));
            });

            it('initially sets the ws attribute to null', () => {
                expect((this.sig as any).ws).toEqual(null);
            });

            it('uses the correct websocket url', () => {
                this.sig.connect();
                expect((this.sig as any).ws.url).toEqual('wss://127.0.0.1:8765/' + this.keyStore.publicKeyHex);
                expect((this.sig as any).ws.subprotocols).toEqual(Signaling.SALTYRTC_WS_SUBPROTOCOL);
            });

            it('sets the websocket binary type to "arraybuffer"', () => {
                this.sig.connect();
                expect((this.sig as any).ws.binaryType).toEqual('arraybuffer');
            });

            it('registers error handlers', () => {
                this.sig.connect();
                expect((this.sig as any).ws.eventListeners['open']).toEqual([this.sig.onOpen]);
                expect((this.sig as any).ws.eventListeners['error']).toEqual([this.sig.onError]);
                expect((this.sig as any).ws.eventListeners['close']).toEqual([this.sig.onClose]);
                expect((this.sig as any).ws.eventListeners['message']).toEqual([this.sig.onInitServerHandshake]);
            });

            it('sets the correct state', () => {
                expect((this.sig as any).state).toEqual('new');
                this.sig.connect();
                expect((this.sig as any).state).toEqual('ws-connecting');
            });

        });

    });

}); }
