/// <reference path="jasmine.d.ts" />

import { Box, KeyStore, AuthToken } from "../saltyrtc/keystore";

declare var nacl: any; // TODO

export default () => { describe('keystore', function() {

    describe('Box', function() {

        let nonce = nacl.randomBytes(24);
        let data = nacl.randomBytes(7);
        let box = new Box(nonce, data, 24);

        it('correctly calculates the length', () => {
            expect(box.length).toEqual(7 + 24);
        });

        it('correctly returns the data', () => {
            expect(box.data).toEqual(data);
        });

        it('correctly returns the nonce', () => {
            expect(box.nonce).toEqual(nonce);
        });

        it('can be created from a byte array', () => {
            let nonceLength = nacl.box.nonceLength;
            let nonce = nacl.randomBytes(nonceLength);
            let data = nacl.randomBytes(5);
            let array = new Uint8Array(nonceLength + 5)
            array.set(nonce);
            array.set(data, nonceLength);
            let box = Box.fromUint8Array(array, nonceLength);
            expect(box.nonce).toEqual(nonce);
            expect(box.data).toEqual(data);
            expect(box.length).toEqual(nonceLength + 5);
        });

        it('validates the byte array length', () => {
            let nonceLength = nacl.box.nonceLength;
            let boxSameLength = () => Box.fromUint8Array(nacl.randomBytes(nonceLength), nonceLength);
            let boxLessLength = () => Box.fromUint8Array(nacl.randomBytes(nonceLength - 2), nonceLength);
            expect(boxSameLength).toThrow('bad-message-length');
            expect(boxLessLength).toThrow('bad-message-length');
        });

        it('can be converted into a byte array', () => {
            let array = box.toUint8Array();
            expect(array.slice(0, nacl.secretbox.nonceLength)).toEqual(nonce);
            expect(array.slice(nacl.secretbox.nonceLength)).toEqual(data);
        });

    });

    describe('KeyStore', function() {

        let ks = new KeyStore();
        let nonce = nacl.randomBytes(24);
        let data = nacl.randomBytes(7);

        it('generates a keypair', () => {
            // Internal test
            expect((ks as any)._keyPair.publicKey).toBeTruthy();
            expect((ks as any)._keyPair.secretKey).toBeTruthy();
        });

        it('can return the secret/public keys as bytes', () => {
            expect(ks.publicKeyBytes).toBeTruthy();
            expect(ks.secretKeyBytes).toBeTruthy();
            expect(ks.publicKeyBytes instanceof Uint8Array).toEqual(true);
            expect(ks.secretKeyBytes instanceof Uint8Array).toEqual(true);
        });

        it('can return the secret/public keys as hex string', () => {
            expect(ks.publicKeyHex).toBeTruthy();
            expect(ks.secretKeyHex).toBeTruthy();
            expect(typeof ks.publicKeyHex).toEqual('string');
            expect(typeof ks.secretKeyHex).toEqual('string');
        });

        it('can encrypt and decrypt properly (round trip)', () => {
            let ks2 = new KeyStore();
            let expected = nacl.randomBytes(24);
            let encrypted = ks.encrypt(expected, nonce, ks2.publicKeyBytes);
            expect(ks.decrypt(encrypted, ks2.publicKeyBytes)).toEqual(expected);
        });

        it('can only encrypt and decrypt if pubkey matches', () => {
            let ks2 = new KeyStore();
            let ks3 = new KeyStore();
            let expected = nacl.randomBytes(24);
            let encrypted = ks.encrypt(expected, nonce, ks2.publicKeyBytes);
            let decrypt = () => ks.decrypt(encrypted, ks3.publicKeyBytes);
            expect(decrypt).toThrow('decryption-failed');
        });

        it('cannot encrypt without a proper nonce', () => {
            let encrypt = () => ks.encrypt(data, nacl.randomBytes(3), nacl.randomBytes(32));
            expect(encrypt).toThrow(new Error('bad nonce size'));
        });

    });

    describe('AuthToken', function() {

        let at = new AuthToken();

        it('can return the secret key as bytes', () => {
            expect(at.keyBytes).toBeTruthy();
            expect(at.keyBytes instanceof Uint8Array).toEqual(true);
        });

        it('can return the secret key as hex string', () => {
            expect(at.keyHex).toBeTruthy();
            expect(typeof at.keyHex).toEqual('string');
        });

        it('can encrypt and decrypt properly (round trip)', () => {
            let expected = nacl.randomBytes(7);
            let nonce = nacl.randomBytes(24);
            expect(at.encrypt(expected, nonce)).not.toEqual(expected);
            expect(at.decrypt(at.encrypt(expected, nonce))).toEqual(expected);
        });

    });

}); }
