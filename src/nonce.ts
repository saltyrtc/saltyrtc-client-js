/**
 * Copyright (C) 2016-2022 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import { Cookie } from './cookie';
import { ValidationError } from './exceptions';

/**
 * A SaltyRTC signaling channel nonce.
 *
 * This is very similar to the regular nonce, but also contains a source and
 * destination byte. That reduces the length of the overflow number to 2 bytes.
 *
 * Nonce structure:
 *
 * |CCCCCCCCCCCCCCCC|S|D|OO|QQQQ|
 *
 * - C: Cookie (16 byte)
 * - S: Source byte (1 byte)
 * - D: Destination byte (1 byte)
 * - O: Overflow number (2 bytes)
 * - Q: Sequence number (4 bytes)
 */
export class Nonce {
    public static TOTAL_LENGTH = 24;

    private _cookie: Cookie;
    private _overflow: number;
    private _sequenceNumber: number;
    private _source: number;
    private _destination: number;

    constructor(cookie: Cookie, overflow: number, sequenceNumber: number,
                source: number, destination: number) {
        this._cookie = cookie;
        this._overflow = overflow;
        this._sequenceNumber = sequenceNumber;
        this._source = source;
        this._destination = destination;
    }

    get cookie() {
        return this._cookie;
    }
    get overflow() {
        return this._overflow;
    }
    get sequenceNumber() {
        return this._sequenceNumber;
    }
    get combinedSequenceNumber() {
        return (this._overflow * (2 ** 32)) + this._sequenceNumber;
    }
    get source() {
        return this._source;
    }
    get destination() {
        return this._destination;
    }

    /**
     * Create a signaling nonce from a Uint8Array.
     *
     * If packet is not exactly 24 bytes long, throw a `ValidationError`.
     */
    public static fromUint8Array(packet: Uint8Array): Nonce {
        if (packet.byteLength !== this.TOTAL_LENGTH) {
            throw new ValidationError('bad-packet-length');
        }

        // Get view to buffer
        const view = new DataView(
            packet.buffer, packet.byteOffset + Cookie.COOKIE_LENGTH, 8);

        // Parse and return nonce
        const cookie = new Cookie(packet.slice(0, Cookie.COOKIE_LENGTH));
        const source = view.getUint8(0);
        const destination = view.getUint8(1);
        const overflow = view.getUint16(2);
        const sequenceNumber = view.getUint32(4);

        return new Nonce(cookie, overflow, sequenceNumber, source, destination);
    }

    /**
     * Return a Uint8Array containing the signaling nonce data.
     */
    public toUint8Array(): Uint8Array {
        const buffer = new ArrayBuffer(Nonce.TOTAL_LENGTH);

        const array = new Uint8Array(buffer);
        array.set(this._cookie.bytes);

        const view = new DataView(buffer, Cookie.COOKIE_LENGTH, 8);
        view.setUint8(0, this._source);
        view.setUint8(1, this._destination);
        view.setUint16(2, this._overflow);
        view.setUint32(4, this._sequenceNumber);

        return array;
    }
}
