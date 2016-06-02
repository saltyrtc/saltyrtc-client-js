/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path='types/tweetnacl.d.ts' />

export class Cookie {

    public static COOKIE_LENGTH = 16;

    public bytes: Uint8Array;

    /**
     * Create a new cookie.
     *
     * If no bytes are provided, generate a random cookie.
     */
    constructor(bytes?: Uint8Array) {
        if (typeof bytes !== 'undefined') {
            if (bytes.length !== 16) {
                throw 'bad-cookie-length';
            }
            this.bytes = bytes;
        } else {
            this.bytes = nacl.randomBytes(Cookie.COOKIE_LENGTH);
        }
    }

    /**
     * Create a Cookie from an array.
     */
    public static from(bytes: number[]): Cookie {
        return new Cookie(Uint8Array.from(bytes));
    }

    /**
     * Return the cookie bytes as array.
     */
    public asArray(): number[] {
        return Array.from(this.bytes);
    }

    /**
     * Return the cookie bytes as Uint8Array.
     */
    public asUint8Array(): Uint8Array {
        return this.bytes;
    }

    /**
     * Return whether or not the two cookies are equal.
     */
    public equals(otherCookie: Cookie) {
        if (otherCookie.bytes === this.bytes) return true;
        if (otherCookie.bytes == null || this.bytes == null) return false;
        if (otherCookie.bytes.byteLength != this.bytes.byteLength) return false;
        for (var i = 0; i < this.bytes.byteLength; i++) {
            if (otherCookie.bytes[i] != this.bytes[i]) return false;
        }
        return true;
    }

}

/**
 * A cookie pair.
 */
export class CookiePair {
    public ours: Cookie;
    public theirs: Cookie;

    constructor(ours: Cookie, theirs: Cookie) {
        this.ours = ours;
        this.theirs = theirs;
    }
}
