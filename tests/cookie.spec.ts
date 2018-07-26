// tslint:disable:file-header
// tslint:disable:no-reference
/// <reference path="jasmine.d.ts" />

import { Cookie, CookiePair } from '../src/cookie';
import { ProtocolError } from '../src/exceptions';

export default () => { describe('cookie', function() {

    describe('Cookie', function() {

        it('generates a cookie of the correct length', () => {
            const c = new Cookie();
            expect(Cookie.COOKIE_LENGTH).toEqual(16);
            expect(c.bytes.byteLength).toEqual(Cookie.COOKIE_LENGTH);
        });

        it('can compare two cookies', () => {
            const c1 = new Cookie();
            const c2 = new Cookie();

            // Ensure cookies are different
            c1.bytes[0] = 1;
            c2.bytes[0] = 2;

            expect(c1.equals(c2)).toEqual(false);

            // Make cookies equal
            c2.bytes = c1.bytes;

            expect(c1.equals(c2)).toEqual(true);
        });

        it('generates a random cookie', () => {
            const c1 = new Cookie();
            const c2 = new Cookie();
            const c3 = new Cookie();
            const c4 = new Cookie();
            expect(c1.equals(c2)).toBe(false);
            expect(c1.equals(c3)).toBe(false);
            expect(c1.equals(c4)).toBe(false);
            expect(c2.equals(c3)).toBe(false);
            expect(c2.equals(c4)).toBe(false);
            expect(c3.equals(c4)).toBe(false);
        });

    });

    describe('CookiePair', function() {
        it('cannot be instantiated from two equal cookies', () => {
            const c = new Cookie();
            const construct = () => new CookiePair(c, c);
            expect(construct).toThrow(new ProtocolError('Their cookie matches our cookie'));
        });

        it('cannot set their cookie to our cookie', () => {
            const pair = new CookiePair();
            const setDifferent = () => pair.theirs = new Cookie();
            const setSame = () => pair.theirs = pair.ours;
            expect(setDifferent).not.toThrow();
            expect(setSame).toThrow(new ProtocolError('Their cookie matches our cookie'));
        });
    });

}); };
