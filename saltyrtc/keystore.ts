/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import { u8aToHex, hexToU8a, randomString } from "./utils";

var nacl: any; // TODO

export class Box {

    private _nonce: Uint8Array;
    private _data: any; // TODO

    constructor(nonce: Uint8Array, data) {
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
    public keyPair: IKeyPair;

    constructor() {
        // Create new key pair
        // TODO: Try to read from webstorage first and send push message to app
        this.keyPair = nacl.box.keyPair();
        console.debug('Private key:', u8aToHex(this.keyPair.secretKey));
        console.debug('Public key:', u8aToHex(this.keyPair.publicKey));

        // Make sure that toHex and toBin work properly
        // TODO: Move to test
        let result = JSON.stringify(hexToU8a(u8aToHex(this.keyPair.secretKey)));
        if (JSON.stringify(this.keyPair.secretKey) != result) {
            throw 'Assertion error';
        }

        // Make sure encryption and decryption work properly
        // TODO: Move to test
        this.otherKey = this.keyPair.publicKey;
        let expected = randomString();
        if (this.decrypt(this.encrypt(expected)) != expected) {
            throw 'Assertion error';
        }
        this.otherKey = null;
    }

    /**
     * Whether or not the keystore has stored the public key of the recipient.
     */
    public hasOtherKey() {
        return this.otherKey != null;
    }

    public get otherKey(): Uint8Array { return this.otherKey; }
    public set otherKey(key: Uint8Array) {
        console.debug('KeyStore: Updating other key');
        this.otherKey = key;
    }

    /**
     * Return the public key as hex string.
     */
    public getPublicKey() {
        return u8aToHex(this.keyPair.publicKey);
    }

    /**
     * Return the data necessary to create a QR code.
     *
     * @deprecated, probably not needed in a generic saltyrtc library.
     */
    public getPublicKeyAsQRCode() {
        return {
            version: 5,
            errorCorrectionLevel: 'M',
            size: 256,
            data: this.getPublicKey()
        };
    }

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

        // Return data as string
        return nacl.util.encodeUTF8(data);
    }
}
