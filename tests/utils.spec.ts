/// <reference path="jasmine.d.ts" />

import { u8aToHex, hexToU8a, randomString } from "../saltyrtc/utils";

export default () => {

    describe('Uint8Array / Hex conversion', () => {

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

    describe('randomString()', () => {

        it('generates a 32 character random string', () => {
            let random1 = randomString();
            let random2 = randomString();
            expect(random1 !== random2).toBe(true);
            expect(random1.length).toEqual(random2.length);
            expect(random1.length).toEqual(32);
        });

    });

}
