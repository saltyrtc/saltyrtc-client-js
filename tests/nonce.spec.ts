// tslint:disable:file-header
// tslint:disable:no-reference
/// <reference path='jasmine.d.ts' />

import { Cookie } from '../src/cookie';
import { Nonce } from '../src/nonce';

export default () => { describe('nonce', function() {

    describe('Nonce', function() {

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
            const nonce = Nonce.fromArrayBuffer(this.array.buffer);
            expect(nonce.cookie.bytes).toEqual(Uint8Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16));
            expect(nonce.source).toEqual(17);
            expect(nonce.destination).toEqual(18);
            expect(nonce.overflow).toEqual((1 * 2 ** 8) + 2);
            expect(nonce.sequenceNumber).toEqual((3 * 2 ** 24) + (4 * 2 ** 16) + (5 * 2 ** 8) + 6);
        });

        it('serializes correctly', () => {
            const cookie = new Cookie(Uint8Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16));
            const source = 17;
            const destination = 18;
            const overflow = 258;
            const sequenceNumber = 50595078;
            const nonce = new Nonce(cookie, overflow, sequenceNumber, source, destination);
            const buf = nonce.toArrayBuffer();
            expect(new Uint8Array(buf)).toEqual(this.array);
        });

        it('returns the correct combined sequence number', () => {
            const nonce = Nonce.fromArrayBuffer(this.array.buffer);
            expect(nonce.combinedSequenceNumber).toEqual((258 * 2 ** 32) + 50595078);
        });

    });

}); };
