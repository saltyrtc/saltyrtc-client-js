/// <reference path="jasmine.d.ts" />

import { Nonce, SignalingNonce } from "../saltyrtc/nonce";

export default () => { describe('nonce', () => {

    describe('Nonce', () => {

        beforeEach(() => {
            this.array = new Uint8Array([
                // Cookie
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                // Overflow: 16909060 big endian
                1, 2, 3, 4,
                // Sequence number: 84281096 big endian
                5, 6, 7, 8,
            ]);
        });

        it('parses correctly', () => {
            let nonce = Nonce.fromArrayBuffer(this.array.buffer);
            expect(nonce.cookie).toEqual(
                new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]));
            expect(nonce.overflow).toEqual((1 << 24) + (2 << 16) + (3 << 8) + 4);
            expect(nonce.sequenceNumber).toEqual((5 << 24) + (6 << 16) + (7 << 8) + 8);
        });

        it('serializes correctly', () => {
            let cookie = Uint8Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
            let overflow = 16909060;
            let sequenceNumber = 84281096;
            let nonce = new Nonce(cookie, overflow, sequenceNumber);
            let buf = nonce.toArrayBuffer();
            expect(new Uint8Array(buf)).toEqual(this.array);
        });

    });

    describe('SignalingNonce', () => {

        beforeEach(() => {
            this.array = new Uint8Array([
                // Cookie
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                // Source: 17
                17,
                // Destination: 18
                18,
                // Overflow: 258 big endian
                1, 2,
                // Sequence number: 50595078 big endian
                3, 4, 5, 6,
            ]);
        });

        it('parses correctly', () => {
            let nonce = SignalingNonce.fromArrayBuffer(this.array.buffer);
            expect(nonce.cookie).toEqual(
                new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]));
            expect(nonce.source).toEqual(17);
            expect(nonce.destination).toEqual(18);
            expect(nonce.overflow).toEqual((1 << 8) + 2);
            expect(nonce.sequenceNumber).toEqual((3 << 24) + (4 << 16) + (5 << 8) + 6);
        });

        it('serializes correctly', () => {
            let cookie = Uint8Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
            let source = 17;
            let destination = 18;
            let overflow = 258;
            let sequenceNumber = 50595078;
            let nonce = new SignalingNonce(cookie, overflow, sequenceNumber, source, destination);
            let buf = nonce.toArrayBuffer();
            expect(new Uint8Array(buf)).toEqual(this.array);
        });

    });

}); };
