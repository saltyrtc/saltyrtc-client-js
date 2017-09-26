/**
 * Copyright (C) 2016-2017 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import * as nacl from "tweetnacl";
import {ProtocolError} from "./exceptions";

export class Cookie implements saltyrtc.Cookie {

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
    public static fromArrayBuffer(buffer: ArrayBuffer): Cookie {
        return new Cookie(new Uint8Array(buffer));
    }

    /**
     * Return the underlying ArrayBuffer.
     */
    public asArrayBuffer(): ArrayBuffer {
        return this.bytes.buffer.slice(this.bytes.byteOffset, this.bytes.byteLength);
    }

    /**
     * Return whether or not the two cookies are equal.
     */
    public equals(otherCookie: Cookie) {
        if (otherCookie.bytes === this.bytes) return true;
        if (otherCookie.bytes == null || this.bytes == null) return false;
        if (otherCookie.bytes.byteLength != this.bytes.byteLength) return false;
        for (let i = 0; i < this.bytes.byteLength; i++) {
            if (otherCookie.bytes[i] != this.bytes[i]) return false;
        }
        return true;
    }

}

/**
 * A cookie pair.
 *
 * The implementation ensures that the two cookies cannot be equal.
 */
export class CookiePair implements saltyrtc.CookiePair {
    private _ours: Cookie = null;
    private _theirs: Cookie = null;

    /**
     * Create a new cookie pair with a predefined peer cookie.
     */
    public static fromTheirs(theirs: Cookie): saltyrtc.CookiePair {
        let ours: Cookie;
        do {
            ours = new Cookie();
        } while (ours.equals(theirs));
        return new CookiePair(ours, theirs);
    }

    /**
     * Create a new cookie pair. Either both or no cookies must be specified.
     *
     * If you want to create a cookie pair from a predefined peer cookie,
     * use the static `fromTheirs` method instead.
     *
     * @throws SignalingError if both cookies are defined and equal.
     */
    constructor(ours?: Cookie, theirs?: Cookie) {
        if (typeof ours !== 'undefined' && typeof theirs !== 'undefined') {
            if (theirs.equals(ours)) {
                throw new ProtocolError("Their cookie matches our cookie");
            }
            this._ours = ours;
            this._theirs = theirs;
        } else if (typeof ours === 'undefined' && typeof theirs === 'undefined') {
            this._ours = new Cookie();
        } else {
            throw new Error('Either both or no cookies must be specified');
        }
    }

    /**
     * Get our own cookie.
     */
    public get ours(): saltyrtc.Cookie {
        return this._ours;
    }

    /**
     * Get the peer cookie.
     */
    public get theirs(): saltyrtc.Cookie {
        return this._theirs;
    }

    /**
     * Set the peer cookie.
     *
     * @throws SignalingError if cookie matches our cookie.
     */
    public set theirs(cookie: saltyrtc.Cookie) {
        if (cookie.equals(this._ours)) {
            throw new ProtocolError("Their cookie matches our cookie");
        }
        this._theirs = cookie;
    }
}
