/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import { u8aToHex, hexToU8a } from "./utils";

declare var nacl: any; // TODO

/**
 * A `Box` contains a nonce and encrypted data.
 */
export class Box {

    private _nonce: Uint8Array;
    private _data: any; // TODO

    constructor(nonce: Uint8Array, data: Uint8Array) {
        this._nonce = nonce;
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

    public static fromArray(array: Uint8Array) {
        // Unpack nonce
        let nonce_length = nacl.box.nonceLength;
        let nonce = array.slice(0, nonce_length);

        // Unpack data
        let data = array.slice(nonce_length);

        // Return box
        return new Box(nonce, data);
    }

    public toArray(): Uint8Array {
        // Return both the nonce and the encrypted data
        let box = new Uint8Array(this.length);
        box.set(this._nonce);
        box.set(this._data, nacl.box.nonceLength);
        return box;
    }

}


// A tweetnacl KeyPair
interface IKeyPair {
    publicKey: Uint8Array,
    secretKey: Uint8Array
}


/**
 * A KeyStore holds public and private keys and can handle encryption and
 * decryption.
 */
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
    public encrypt(bytes: Uint8Array, nonce: Uint8Array): Box {
        let encrypted = nacl.box(bytes, nonce, this.otherKey, this.keyPair.secretKey);
        return new Box(nonce, encrypted);
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
