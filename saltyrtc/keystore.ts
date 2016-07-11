/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path='saltyrtc.d.ts' />
/// <reference path='types/tweetnacl.d.ts' />

import { u8aToHex, hexToU8a } from "./utils";

/**
 * A `Box` contains a nonce and encrypted data.
 */
export class Box implements saltyrtc.Box {

    private _nonce: Uint8Array;
    private _nonceLength: number;
    private _data: Uint8Array;

    constructor(nonce: Uint8Array, data: Uint8Array, nonceLength: number) {
        this._nonce = nonce;
        this._nonceLength = nonceLength;
        this._data = data;
    }

    public get length(): number {
        return this._nonce.length + this._data.length;
    }

    public get data() {
        return this._data;
    }

    public get nonce(): Uint8Array {
        return this._nonce;
    }

    /**
     * Parse an Uint8Array, create a Box wrapping the data.
     *
     * May throw the following exceptions:
     *
     * - bad-message-length: Message is too short
     */
    public static fromUint8Array(array: Uint8Array, nonceLength: number) {
        // Validate nonceLength parameter
        if (nonceLength === undefined) {
            throw new Error('nonceLength parameter not specified');
        }

        // Validate message length
        if (array.byteLength <= nonceLength) {
            throw 'bad-message-length';
        }

        // Unpack nonce
        let nonce = array.slice(0, nonceLength);

        // Unpack data
        let data = array.slice(nonceLength);

        // Return box
        return new Box(nonce, data, nonceLength);
    }

    public toUint8Array(): Uint8Array {
        // Return both the nonce and the encrypted data
        let box = new Uint8Array(this.length);
        box.set(this._nonce);
        box.set(this._data, this._nonceLength);
        return box;
    }

}


/**
 * A KeyStore holds public and private keys and can handle encryption and
 * decryption.
 */
export class KeyStore implements saltyrtc.KeyStore {
    // The NaCl key pair
    private _keyPair: nacl.KeyPair;

    constructor() {
        // Create new key pair
        this._keyPair = nacl.box.keyPair();
        console.debug('KeyStore: Public key:', u8aToHex(this._keyPair.publicKey));
    }

    /**
     * Return the public key as hex string.
     */
    get publicKeyHex() { return u8aToHex(this._keyPair.publicKey); }

    /**
     * Return the public key as Uint8Array.
     */
    get publicKeyBytes() { return this._keyPair.publicKey; }

    /**
     * Return the secret key as hex string.
     */
    get secretKeyHex() { return u8aToHex(this._keyPair.secretKey); }

    /**
     * Return the secret key as Uint8Array.
     */
    get secretKeyBytes() { return this._keyPair.secretKey; }

    /**
     * Encrypt data for the peer.
     */
    public encrypt(bytes: Uint8Array, nonce: Uint8Array, otherKey: Uint8Array): Box {
        let encrypted = nacl.box(bytes, nonce, otherKey, this._keyPair.secretKey);
        return new Box(nonce, encrypted, nacl.box.nonceLength);
    }

    /**
     * Decrypt data from the peer.
     */
    public decrypt(box: Box, otherKey: Uint8Array): Uint8Array {
        // Decrypt data
        let data = nacl.box.open(box.data, box.nonce, otherKey, this._keyPair.secretKey);
        if (data === false) {
            // TODO: Handle error
            throw 'decryption-failed'
        }
        return data as Uint8Array;
    }
}


export class AuthToken implements saltyrtc.AuthToken {

    private _authToken: Uint8Array = null;

    constructor(bytes?: Uint8Array) {
        if (typeof bytes === 'undefined') {
            this._authToken = nacl.randomBytes(nacl.secretbox.keyLength);
            console.debug('AuthToken: Generated auth token');
        } else {
            if (bytes.byteLength != nacl.secretbox.keyLength) {
                console.error('Auth token must be', nacl.secretbox.keyLength, 'bytes long.');
                throw 'bad-token-length';
            }
            this._authToken = bytes;
            console.debug('AuthToken: Initialized auth token');
        }
    }

    /**
     * Return the secret key as Uint8Array.
     */
    get keyBytes() { return this._authToken; }

    /**
     * Return the secret key as hex string.
     */
    get keyHex() { return u8aToHex(this._authToken); }

    /**
     * Encrypt data using the shared auth token.
     */
    public encrypt(bytes: Uint8Array, nonce: Uint8Array): Box {
        let encrypted = nacl.secretbox(bytes, nonce, this._authToken);
        return new Box(nonce, encrypted, nacl.secretbox.nonceLength);
    }

    /**
     * Decrypt data using the shared auth token.
     */
    public decrypt(box: Box): Uint8Array {
        let data = nacl.secretbox.open(box.data, box.nonce, this._authToken);
        if (data === false) {
            // TODO: handle error
            throw 'decryption-failed'
        }
        return data as Uint8Array;
    }

}
