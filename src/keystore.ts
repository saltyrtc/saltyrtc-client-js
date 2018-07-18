/**
 * Copyright (C) 2016-2018 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import * as nacl from 'tweetnacl';
import { CryptoError } from './exceptions';
import { u8aToHex, validateKey } from './utils';

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
     * May throw CryptoError instances with the following codes:
     *
     * - bad-message-length: Message is shorter than the nonce
     */
    public static fromUint8Array(array: Uint8Array, nonceLength: number) {
        // Validate nonceLength parameter
        if (nonceLength === undefined) {
            throw new Error('nonceLength parameter not specified');
        }

        // Validate message length
        if (array.byteLength <= nonceLength) {
            throw new CryptoError('bad-message-length', 'Message is shorter than nonce');
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
    private _keyPair: nacl.BoxKeyPair;

    private logTag: string = '[SaltyRTC.KeyStore]';

    constructor(privateKey?: Uint8Array | string) {
        // Validate argument count (bug prevention)
        if (arguments.length > 1) {
            throw new Error('Too many arguments in KeyStore constructor');
        }

        // Create new key pair if necessary
        if (privateKey === undefined) {
            this._keyPair = nacl.box.keyPair();
            console.debug(this.logTag, 'New public key:', u8aToHex(this._keyPair.publicKey));
        } else {
            this._keyPair = nacl.box.keyPair.fromSecretKey(validateKey(privateKey, 'Private key'));
            console.debug(this.logTag, 'Restored public key:', u8aToHex(this._keyPair.publicKey));
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
    get keypair(): nacl.BoxKeyPair {
        return this._keyPair;
    }

    /**
     * Encrypt plain data for the peer and return encrypted data as bytes.
     */
    public encryptRaw(bytes: Uint8Array, nonce: Uint8Array, otherKey: Uint8Array): Uint8Array {
        return nacl.box(bytes, nonce, otherKey, this._keyPair.secretKey);
    }

    /**
     * Encrypt plain data for the peer and return encrypted data in a box.
     */
    public encrypt(bytes: Uint8Array, nonce: Uint8Array, otherKey: Uint8Array): saltyrtc.Box {
        const encrypted = this.encryptRaw(bytes, nonce, otherKey);
        return new Box(nonce, encrypted, nacl.box.nonceLength);
    }

    /**
     * Decrypt encrypted bytes from the peer and return plain data as bytes.
     *
     * May throw CryptoError instances with the following codes:
     *
     * - decryption-failed: Data could not be decrypted
     */
    public decryptRaw(bytes: Uint8Array, nonce: Uint8Array, otherKey: Uint8Array): Uint8Array {
        const data = nacl.box.open(bytes, nonce, otherKey, this._keyPair.secretKey);
        if (!data) {
            throw new CryptoError('decryption-failed', 'Data could not be decrypted');
        }
        return data as Uint8Array;
    }

    /**
     * Decrypt encrypted boxed data from the peer and return plain data as bytes.
     *
     * May throw CryptoError instances with the following codes:
     *
     * - decryption-failed: Data could not be decrypted
     */
    public decrypt(box: saltyrtc.Box, otherKey: Uint8Array): Uint8Array {
        return this.decryptRaw(box.data, box.nonce, otherKey);
    }
}

export class AuthToken implements saltyrtc.AuthToken {

    private _authToken: Uint8Array = null;

    private logTag: string = '[SaltyRTC.AuthToken]';

    /*
     * May throw CryptoError instances with the following codes:
     *
     * - bad-token-length
     */
    constructor(bytes?: Uint8Array) {
        if (typeof bytes === 'undefined') {
            this._authToken = nacl.randomBytes(nacl.secretbox.keyLength);
            console.debug(this.logTag, 'Generated auth token');
        } else {
            if (bytes.byteLength !== nacl.secretbox.keyLength) {
                const msg = 'Auth token must be ' + nacl.secretbox.keyLength + ' bytes long.';
                console.error(this.logTag, msg);
                throw new CryptoError('bad-token-length', msg);
            }
            this._authToken = bytes;
            console.debug(this.logTag, 'Initialized auth token');
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
     *
     * May throw CryptoError instances with the following codes:
     *
     * - decryption-failed: Data could not be decrypted
     */
    public decrypt(box: saltyrtc.Box): Uint8Array {
        const data = nacl.secretbox.open(box.data, box.nonce, this._authToken);
        if (!data) {
            throw new CryptoError('decryption-failed', 'Data could not be decrypted');
        }
        return data as Uint8Array;
    }

}
