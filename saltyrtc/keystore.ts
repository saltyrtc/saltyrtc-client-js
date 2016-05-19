/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import { u8aToHex, hexToU8a } from "./utils";

declare var nacl: any; // TODO

export class Box {

    private _nonce: Uint8Array;
    private _data: any; // TODO

    constructor(nonce: Uint8Array, data: Uint8Array) {
        this._nonce = nonce;
        this._data = data;
    }

    public get length() {
        return this._nonce.length + this._data.length;
    }

    public get data() {
        return this._data;
    }

    public get nonce() {
        return this._nonce;
    }

    public static fromArray(array) {
        // Unpack nonce
        let nonce_length = nacl.secretbox.nonceLength;
        let nonce = array.slice(0, nonce_length);

        // Unpack data
        let data = array.slice(nonce_length);

        // Return box
        return new Box(nonce, data);
    }

    public toArray() {
        let nonce_length = nacl.secretbox.nonceLength;

        // Return both the nonce and the encrypted data
        let box = new Uint8Array(this.length);
        box.set(this._nonce);
        box.set(this._data, nonce_length);
        return box;
    }
}


// A tweetnacl KeyPair
interface IKeyPair {
    publicKey: Uint8Array,
    secretKey: Uint8Array
}


export class KeyStore {
    // Public key of the recipient
    private _otherKey: Uint8Array = null;
    // The NaCl key pair
    private keyPair: IKeyPair;

    constructor() {
        // Create new key pair
        this.keyPair = nacl.box.keyPair();
        console.debug('KeyStore: Private key:', u8aToHex(this.keyPair.secretKey));
        console.debug('KeyStore: Public key:', u8aToHex(this.keyPair.publicKey));
    }

    /**
     * Whether or not the keystore has stored the public key of the recipient.
     */
    public hasOtherKey() {
        return this.otherKey != null;
    }

    public get otherKey(): Uint8Array { return this._otherKey; }
    public set otherKey(key: Uint8Array) {
        console.debug('KeyStore: Updating other key');
        this._otherKey = key;
    }

    /**
     * Return the public key as hex string.
     */
    get publicKeyHex() { return u8aToHex(this.keyPair.publicKey); }

    /**
     * Return the public key as Uint8Array.
     */
    get publicKeyBytes() { return this.keyPair.publicKey; }

    /**
     * Return the secret key as hex string.
     */
    get secretKeyHex() { return u8aToHex(this.keyPair.secretKey); }

    /**
     * Return the secret key as Uint8Array.
     */
    get secretKeyBytes() { return this.keyPair.secretKey; }

    /**
     * Encrypt data for the peer.
     */
    public encrypt(bytes: Uint8Array): Box {
        // Generate random nonce
        let nonce = nacl.randomBytes(nacl.secretbox.nonceLength);

        // Encrypt data with keys and nonce
        bytes = nacl.box(bytes, nonce, this.otherKey, this.keyPair.secretKey);

        // Return box
        return new Box(nonce, bytes);
    }

    /**
     * Decrypt data from the peer.
     */
    public decrypt(box: Box): Uint8Array {
        // Decrypt data
        let data = nacl.box.open(box.data, box.nonce, this.otherKey, this.keyPair.secretKey);
        if (data == false) {
            // TODO: Handle error
            throw 'Decryption failed'
        }
        return data;
    }
}
