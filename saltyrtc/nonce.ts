/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path='messages.d.ts' />

/**
 * Base class for all nonces.
 */
abstract class Nonce {
    protected _cookie: Uint8Array;
    protected _overflow: number;
    protected _sequenceNumber: number;

    constructor(cookie: Uint8Array, overflow: number, sequenceNumber: number) {
        if (cookie.length != 16) {
            throw 'bad-cookie-length';
        }
        this._cookie = cookie;
        this._overflow = overflow;
        this._sequenceNumber = sequenceNumber;
    }

    get cookie() { return this._cookie; }
    get overflow() { return this._overflow; }
    get sequenceNumber() { return this._sequenceNumber; }
    get combinedSequenceNumber() { return (this._overflow << 32) + this._sequenceNumber; }
}

/**
 * A SaltyRTC data channel nonce.
 *
 * Nonce structure:
 *
 * |CCCCCCCCCCCCCCCC|OOOO|QQQQ|
 *
 * - C: Cookie (16 byte)
 * - O: Overflow number (4 bytes)
 * - Q: Sequence number (4 bytes)
 */
export class DataChannelNonce extends Nonce {

    constructor(cookie: Uint8Array, overflow: number, sequenceNumber: number) {
        super(cookie, overflow, sequenceNumber);
    }

    /**
     * Create a nonce from an ArrayBuffer.
     *
     * If packet is not exactly 24 bytes long, throw an exception.
     */
    public static fromArrayBuffer(packet: ArrayBuffer): Nonce {
        if (packet.byteLength != 24) {
            throw 'bad-packet-length';
        }

        // Get view to buffer
        let view = new DataView(packet);

        // Parse and return nonce
        let cookie = new Uint8Array(packet, 0, 16);
        let overflow = view.getUint32(16);
        let sequenceNumber = view.getUint32(20);

        return new DataChannelNonce(cookie, overflow, sequenceNumber);
    }

    /**
     * Return an ArrayBuffer containing the nonce data.
     */
    public toArrayBuffer(): ArrayBuffer {
        let buf = new ArrayBuffer(24);

        let uint8view = new Uint8Array(buf);
        uint8view.set(this._cookie);

        let view = new DataView(buf);
        view.setUint32(16, this._overflow);
        view.setUint32(20, this._sequenceNumber);

        return buf;
    }

}


/**
 * A SaltyRTC signaling channel nonce.
 *
 * This is very similar to the regular nonce, but also contains a sender and
 * receiver byte. That reduces the length of the overflow number to 2 bytes.
 *
 * Nonce structure:
 *
 * |CCCCCCCCCCCCCCCC|S|D|OO|QQQQ|
 *
 * - C: Cookie (16 byte)
 * - S: Source byte (1 byte)
 * - D: Destination byte (1 byte)
 * - O: Overflow number (4 bytes)
 * - Q: Sequence number (4 bytes)
 */
export class SignalingChannelNonce extends Nonce {

    protected _source: number;
    protected _destination: number;

    constructor(cookie: Uint8Array, overflow: number, sequenceNumber: number,
                source: number, destination: number) {
        super(cookie, overflow, sequenceNumber);
        this._source = source;
        this._destination = destination;
    }

    get source() { return this._source; }
    get destination() { return this._destination; }

    /**
     * Create a signaling nonce from an ArrayBuffer.
     *
     * If packet is not exactly 24 bytes long, throw an exception.
     */
    public static fromArrayBuffer(packet: ArrayBuffer): SignalingChannelNonce {
        if (packet.byteLength != 24) {
            throw 'bad-packet-length';
        }

        // Get view to buffer
        let view = new DataView(packet);

        // Parse and return nonce
        let cookie = new Uint8Array(packet, 0, 16);
        let source = view.getUint8(16);
        let destination = view.getUint8(17);
        let overflow = view.getUint16(18);
        let sequenceNumber = view.getUint32(20);

        return new SignalingChannelNonce(cookie, overflow, sequenceNumber, source, destination);
    }

    /**
     * Return an ArrayBuffer containing the signaling nonce data.
     */
    public toArrayBuffer(): ArrayBuffer {
        let buf = new ArrayBuffer(24);

        let uint8view = new Uint8Array(buf);
        uint8view.set(this._cookie);

        let view = new DataView(buf);
        view.setUint8(16, this._source);
        view.setUint8(17, this._destination);
        view.setUint16(18, this._overflow);
        view.setUint32(20, this._sequenceNumber);

        return buf;
    }

}
