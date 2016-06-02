/// <reference path="jasmine.d.ts" />

import { u8aToHex, hexToU8a, randomString, concat, randomUint32 } from "../saltyrtc/utils";

export default () => { describe('utils', () => {

    describe('hexToU8a / u8aToHex', () => {

        it('conversion from Uint8Array to hex works', () => {
            let source = new Uint8Array([0x01, 0x10, 0xde, 0xad, 0xbe, 0xef]);
            expect(u8aToHex(source)).toEqual('0110deadbeef');
        });

        it('conversion from hex to Uint8Array works', () => {
            let expected = new Uint8Array([0x01, 0x10, 0xde, 0xad, 0xbe, 0xef]);
            expect(hexToU8a('0110deadbeef')).toEqual(expected);
        });

        it('u8a -> hex -> ua8 works properly', () => {
            let source = new Uint8Array([0x01, 0x10, 0xde, 0xad, 0xbe, 0xef]);
            expect(hexToU8a(u8aToHex(source))).toEqual(source);
        });

        it('hex -> u8a -> hex works properly', () => {
            let source = 'f00baa';
            expect(u8aToHex(hexToU8a(source))).toEqual(source);
        });

        it('single-character conversion from hex to Uint8Array works', () => {
            expect(hexToU8a('a')).toEqual(new Uint8Array([0x0a]));
        });

    });

    describe('randomString', () => {

        it('generates a 32 character random string', () => {
            let random1 = randomString();
            let random2 = randomString();
            expect(random1 !== random2).toBe(true);
            expect(random1.length).toEqual(random2.length);
            expect(random1.length).toEqual(32);
        });

    });

    describe('concat', () => {

        it('does not change a single array', () => {
            let src = Uint8Array.of(1, 2, 3, 4);
            expect(concat(src)).toEqual(src);
        });

        it('concatenates two arrays', () => {
            let src1 = Uint8Array.of(1, 2, 3, 4);
            let src2 = Uint8Array.of(5, 6);
            expect(concat(src1, src2))
                .toEqual(Uint8Array.of(1, 2, 3, 4, 5, 6));
        });

        it('concatenates multiple arrays', () => {
            let src1 = Uint8Array.of(1, 2, 3, 4);
            let src2 = Uint8Array.of(5, 6);
            let src3 = Uint8Array.of(7);
            let src4 = Uint8Array.of(7, 8, 9);
            expect(concat(src1, src2, src3, src4))
                .toEqual(Uint8Array.of(1, 2, 3, 4, 5, 6, 7, 7, 8, 9));
        });

    });

    describe('randomUint32', () => {

        it('generates a random number between 0 and 2**32', () => {
            let lastNum: number = null;
            for (let i = 0; i < 50; i++) {
                let num = randomUint32();
                expect(num).not.toEqual(lastNum);
                expect(num).toBeGreaterThan(-1);
                expect(num).toBeLessThan(0x100000000 + 1);
                lastNum = num;
            }
        });

    });

}); }
