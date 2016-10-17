/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path='saltyrtc-client.d.ts' />
/// <reference path='types/tweetnacl.d.ts' />

import { u8aToHex } from "./utils";

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
        const nonce = array.slice(0, nonceLength);

        // Unpack data
        const data = array.slice(nonceLength);

        // Return box
        return new Box(nonce, data, nonceLength);
    }

    public toUint8Array(): Uint8Array {
        // Return both the nonce and the encrypted data
        const box = new Uint8Array(this.length);
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

    constructor(publicKey?: Uint8Array, secretKey?: Uint8Array) {
        // Create new key pair if necessary
        if (publicKey === undefined || secretKey === undefined) {
            this._keyPair = nacl.box.keyPair();
            console.debug('KeyStore: New public key:', u8aToHex(this._keyPair.publicKey));
        } else {
            this._keyPair = {
                publicKey: publicKey,
                secretKey: secretKey,
            };
            console.debug('KeyStore: Restored public key:', u8aToHex(this._keyPair.publicKey));
        }
    }

    /**
     * Return the public key as hex string.
     */
    get publicKeyHex(): string { return u8aToHex(this._keyPair.publicKey); }

    /**
     * Return the public key as Uint8Array.
     */
    get publicKeyBytes(): Uint8Array { return this._keyPair.publicKey; }

    /**
     * Return the secret key as hex string.
     */
    get secretKeyHex(): string { return u8aToHex(this._keyPair.secretKey); }

    /**
     * Return the secret key as Uint8Array.
     */
    get secretKeyBytes(): Uint8Array { return this._keyPair.secretKey; }

    /**
     * Return the full keypair.
     */
    get keypair(): nacl.KeyPair {
        return this._keyPair;
    }

    /**
     * Encrypt data for the peer.
     */
    public encrypt(bytes: Uint8Array, nonce: Uint8Array, otherKey: Uint8Array): saltyrtc.Box {
        const encrypted = nacl.box(bytes, nonce, otherKey, this._keyPair.secretKey);
        return new Box(nonce, encrypted, nacl.box.nonceLength);
    }

    /**
     * Decrypt data from the peer.
     */
    public decrypt(box: saltyrtc.Box, otherKey: Uint8Array): Uint8Array {
        // Decrypt data
        const data = nacl.box.open(box.data, box.nonce, otherKey, this._keyPair.secretKey);
        if (data === false) {
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
    public encrypt(bytes: Uint8Array, nonce: Uint8Array): saltyrtc.Box {
        const encrypted = nacl.secretbox(bytes, nonce, this._authToken);
        return new Box(nonce, encrypted, nacl.secretbox.nonceLength);
    }

    /**
     * Decrypt data using the shared auth token.
     */
    public decrypt(box: saltyrtc.Box): Uint8Array {
        const data = nacl.secretbox.open(box.data, box.nonce, this._authToken);
        if (data === false) {
            throw 'decryption-failed'
        }
        return data as Uint8Array;
    }

}
