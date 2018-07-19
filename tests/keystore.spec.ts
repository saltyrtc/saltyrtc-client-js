/// <reference path="jasmine.d.ts" />

import { CryptoError } from '../src/exceptions';
import { Box, KeyStore, AuthToken } from '../src/keystore';
import { u8aToHex } from '../src/utils';

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
            expect(boxSameLength).toThrow(new CryptoError('bad-message-length', 'Message is shorter than nonce'));
            expect(boxLessLength).toThrow(new CryptoError('bad-message-length', 'Message is shorter than nonce'));
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
            expect(decrypt).toThrow(new CryptoError('decryption-failed', 'Data could not be decrypted'));
        });

        it('cannot encrypt without a proper nonce', () => {
            let encrypt = () => ks.encrypt(data, nacl.randomBytes(3), nacl.randomBytes(32));
            expect(encrypt).toThrow(new Error('bad nonce size'));
        });

        it('can be created from an Uint8Array or hex string', () => {
            const skBytes = nacl.randomBytes(32);
            const skHex = u8aToHex(skBytes);

            let ksBytes = new KeyStore(skBytes);
            let ksHex = new KeyStore(skHex);

            for (let ks of [ksBytes, ksHex]) {
                expect(ks.publicKeyBytes).not.toBeNull();
                expect(ks.secretKeyBytes).toEqual(skBytes);
                expect(ks.publicKeyHex).not.toBeNull();
                expect(ks.secretKeyHex).toEqual(skHex);
            }
        });

        it('shows a nice error message if key is invalid', () => {
            const create1 = () => new KeyStore(Uint8Array.of(1, 2, 3));
            expect(create1).toThrowError('Private key must be 32 bytes long');

            const create2 = () => new KeyStore(42 as any);
            expect(create2).toThrowError('Private key must be an Uint8Array or a hex string');

            const create3 = () => new KeyStore("ffgghh");
            expect(create3).toThrowError('Private key must be 32 bytes long');
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
