/// <reference path="jasmine.d.ts" />

import { Cookie } from "../saltyrtc/cookie";

export default () => { describe('cookie', function() {

    describe('Cookie', function() {

        it('generates a cookie of the correct length', () => {
            let c = new Cookie();
            expect(Cookie.COOKIE_LENGTH).toEqual(16);
            expect(c.bytes.byteLength).toEqual(Cookie.COOKIE_LENGTH);
        });

        it('can compare two cookies', () => {
            let c1 = new Cookie();
            let c2 = new Cookie();

            // Ensure cookies are different
            c1.bytes[0] = 1;
            c2.bytes[0] = 2;

            expect(c1.equals(c2)).toEqual(false);

            // Make cookies equal
            c2.bytes = c1.bytes;

            expect(c1.equals(c2)).toEqual(true);
        });

        it('generates a random cookie', () => {
            let c1 = new Cookie();
            let c2 = new Cookie();
            let c3 = new Cookie();
            let c4 = new Cookie();
            expect(c1.equals(c2)).toBe(false);
            expect(c1.equals(c3)).toBe(false);
            expect(c1.equals(c4)).toBe(false);
            expect(c2.equals(c3)).toBe(false);
            expect(c2.equals(c4)).toBe(false);
            expect(c3.equals(c4)).toBe(false);
        });

    });

}); }
