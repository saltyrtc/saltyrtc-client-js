/// <reference path="jasmine.d.ts" />

import { Signaling, InitiatorSignaling } from "../saltyrtc/signaling";
import { SaltyRTC } from "../saltyrtc/client";
import { KeyStore } from "../saltyrtc/keystore";

class FakeSaltyRTC {
    events = [];

    onConnected(ev) {}
    onConnectionError(ev) {}
    onConnectionClosed(ev) {}
    emit(ev) {
        this.events.push(ev);
    }
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

export default () => { describe('signaling', function() {

    describe('Signaling', function() {

        beforeEach(() => {
            this.fakeSaltyRTC = new FakeSaltyRTC() as any as SaltyRTC;
            this.keyStore = new KeyStore();
            this.sig = new InitiatorSignaling(this.fakeSaltyRTC, '127.0.0.1', 8765, this.keyStore);
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
                expect((this.sig as any).ws.eventListeners['open']).toEqual([(this.sig as any).onOpen]);
                expect((this.sig as any).ws.eventListeners['error']).toEqual([(this.sig as any).onError]);
                expect((this.sig as any).ws.eventListeners['close']).toEqual([(this.sig as any).onClose]);
                expect((this.sig as any).ws.eventListeners['message']).toEqual([(this.sig as any).onMessage]);
            });

            it('sets the correct state', () => {
                expect((this.sig as any).state).toEqual('new');
                this.sig.connect();
                expect((this.sig as any).state).toEqual('ws-connecting');
            });

            it('emits state-change events', () => {
                expect(this.fakeSaltyRTC.events.length).toEqual(0);
                this.sig.connect();
                expect(this.fakeSaltyRTC.events).toEqual([
                    {type: 'state-change', data: 'new'},
                    {type: 'state-change', data: 'ws-connecting'},
                ]);
            });

        });

        describe('decrypt data', () => {

            it('will decrypt data encrypted with the session key', () => {
                const ourSessionKey = new KeyStore();
                const peerSessionKey = new KeyStore();
                (this.sig as any).sessionKey = ourSessionKey;
                (this.sig as any).getPeerSessionKey = () => peerSessionKey.publicKeyBytes;

                // Encrypt
                const plain = new Uint8Array([1, 3, 3, 7]);
                const box: saltyrtc.Box = peerSessionKey.encrypt(plain, nacl.randomBytes(24), ourSessionKey.publicKeyBytes);

                // Decrypt
                const decrypted = this.sig.decryptData(box);
                expect(new Uint8Array(decrypted)).toEqual(plain);
            });

        });

    });

}); }
