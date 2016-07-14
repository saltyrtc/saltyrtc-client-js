/// <reference path="jasmine.d.ts" />

import { DataChannelNonce, SignalingChannelNonce } from "../saltyrtc/nonce";
import { Cookie } from "../saltyrtc/cookie";

export default () => { describe('nonce', function() {

    describe('DataChannelNonce', function() {

        beforeEach(() => {
            this.array = new Uint8Array([
                // Cookie
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                // Data channel: 4370
                17, 18,
                // Overflow: 4884
                19, 20,
                // Sequence number: 84281096 big endian
                5, 6, 7, 8,
            ]);
        });

        it('parses correctly', () => {
            let nonce = DataChannelNonce.fromArrayBuffer(this.array.buffer);
            expect(nonce.cookie.bytes).toEqual(
                Uint8Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16));
            expect(nonce.channelId).toEqual((17 << 8) + 18);
            expect(nonce.overflow).toEqual((19 << 8) + 20);
            expect(nonce.sequenceNumber).toEqual((5 << 24) + (6 << 16) + (7 << 8) + 8);
        });

        it('serializes correctly', () => {
            let cookie = new Cookie(Uint8Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16));
            let channel = 4370;
            let overflow = 4884;
            let sequenceNumber = 84281096;
            let nonce = new DataChannelNonce(cookie, channel, overflow, sequenceNumber);
            let buf = nonce.toArrayBuffer();
            expect(new Uint8Array(buf)).toEqual(this.array);
        });

    });

    describe('SignalingChannelNonce', function() {

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
            let nonce = SignalingChannelNonce.fromArrayBuffer(this.array.buffer);
            expect(nonce.cookie.bytes).toEqual(
                Uint8Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16));
            expect(nonce.source).toEqual(17);
            expect(nonce.destination).toEqual(18);
            expect(nonce.overflow).toEqual((1 << 8) + 2);
            expect(nonce.sequenceNumber).toEqual((3 << 24) + (4 << 16) + (5 << 8) + 6);
        });

        it('serializes correctly', () => {
            let cookie = new Cookie(Uint8Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16));
            let source = 17;
            let destination = 18;
            let overflow = 258;
            let sequenceNumber = 50595078;
            let nonce = new SignalingChannelNonce(cookie, overflow, sequenceNumber, source, destination);
            let buf = nonce.toArrayBuffer();
            expect(new Uint8Array(buf)).toEqual(this.array);
        });

        it('returns the correct combined sequence number', () => {
            let nonce = SignalingChannelNonce.fromArrayBuffer(this.array.buffer);
            expect(nonce.combinedSequenceNumber).toEqual((258 << 32) + 50595078);
        });

    });

}); };
