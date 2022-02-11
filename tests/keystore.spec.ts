// tslint:disable:file-header
// tslint:disable:no-reference
/// <reference path='jasmine.d.ts' />

import * as nacl from 'tweetnacl';
import { CryptoError, ValidationError } from '../src/exceptions';
import { AuthToken, Box, KeyStore, SharedKeyStore } from '../src/keystore';
import { hexToU8a, u8aToHex } from '../src/utils';

export default () => { describe('keystore', function() {

    describe('Box', function() {

        const nonce = nacl.randomBytes(24);
        const data = nacl.randomBytes(7);
        const box = new Box(nonce, data, 24);

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
            const nonceLength = nacl.box.nonceLength;
            const nonce2 = nacl.randomBytes(nonceLength);
            const data2 = nacl.randomBytes(5);
            const array = new Uint8Array(nonceLength + 5);
            array.set(nonce2);
            array.set(data2, nonceLength);
            const box2 = Box.fromUint8Array(array, nonceLength);
            expect(box2.nonce).toEqual(nonce2);
            expect(box2.data).toEqual(data2);
            expect(box2.length).toEqual(nonceLength + 5);
        });

        it('validates the byte array length', () => {
            const nonceLength = nacl.box.nonceLength;
            const boxSameLength = () => Box.fromUint8Array(nacl.randomBytes(nonceLength), nonceLength);
            const boxLessLength = () => Box.fromUint8Array(nacl.randomBytes(nonceLength - 2), nonceLength);
            expect(boxSameLength).toThrow(new CryptoError('bad-message-length', 'Message is shorter than nonce'));
            expect(boxLessLength).toThrow(new CryptoError('bad-message-length', 'Message is shorter than nonce'));
        });

        it('can be converted into a byte array', () => {
            const array = box.toUint8Array();
            expect(array.slice(0, nacl.secretbox.nonceLength)).toEqual(nonce);
            expect(array.slice(nacl.secretbox.nonceLength)).toEqual(data);
        });

    });

    describe('KeyStore', function() {

        const ks = new KeyStore();
        const nonce = nacl.randomBytes(24);
        const data = nacl.randomBytes(7);

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
            const ks2 = new KeyStore();
            const expected = nacl.randomBytes(24);
            let encrypted;
            let decrypted;

            encrypted = ks.encrypt(expected, nonce, ks2.publicKeyBytes);
            decrypted = ks.decrypt(encrypted, ks2.publicKeyBytes);
            expect(decrypted).toEqual(expected);
            decrypted = ks.decryptRaw(encrypted.data, encrypted.nonce, ks2.publicKeyBytes);
            expect(decrypted).toEqual(expected);

            encrypted = ks.encryptRaw(expected, nonce, ks2.publicKeyBytes);
            const encryptedBox = new Box(nonce, encrypted, nacl.box.nonceLength);
            decrypted = ks.decrypt(encryptedBox, ks2.publicKeyBytes);
            expect(decrypted).toEqual(expected);
            decrypted = ks.decryptRaw(encrypted, nonce, ks2.publicKeyBytes);
            expect(decrypted).toEqual(expected);
        });

        it('can only encrypt and decrypt if pubkey matches', () => {
            const ks2 = new KeyStore();
            const ks3 = new KeyStore();
            const expected = nacl.randomBytes(24);
            const encrypted = ks.encrypt(expected, nonce, ks2.publicKeyBytes);

            const decrypts = [
                () => ks.decrypt(encrypted, ks3.publicKeyBytes),
                () => ks.decryptRaw(encrypted.data, encrypted.nonce, ks3.publicKeyBytes),
            ];

            for (const decrypt of decrypts) {
                const error = new CryptoError('decryption-failed', 'Data could not be decrypted');
                expect(decrypt).toThrow(error);
            }
        });

        it('cannot encrypt without a proper nonce', () => {
            const encrypts = [
                () => ks.encrypt(data, nacl.randomBytes(3), nacl.randomBytes(32)),
                () => ks.encryptRaw(data, nacl.randomBytes(3), nacl.randomBytes(32)),
            ];

            for (const encrypt of encrypts) {
                expect(encrypt).toThrow(new Error('bad nonce size'));
            }
        });

        it('can be created from an Uint8Array or hex string', () => {
            const skBytes = nacl.randomBytes(32);
            const skHex = u8aToHex(skBytes);

            const ksBytes = new KeyStore(skBytes);
            const ksHex = new KeyStore(skHex);

            for (const keystore of [ksBytes, ksHex]) {
                expect(keystore.publicKeyBytes).not.toBeNull();
                expect(keystore.secretKeyBytes).toEqual(skBytes);
                expect(keystore.publicKeyHex).not.toBeNull();
                expect(keystore.secretKeyHex).toEqual(skHex);
            }
        });

        it('shows a nice error message if key is invalid', () => {
            const create1 = () => new KeyStore(Uint8Array.of(1, 2, 3));
            expect(create1).toThrowError('Private key must be 32 bytes long');

            const create2 = () => new KeyStore(42 as any);
            expect(create2).toThrowError('Private key must be an Uint8Array or a hex string');

            const create3 = () => new KeyStore('ffgghh');
            expect(create3).toThrowError('Private key must be 32 bytes long');
        });

    });

    describe('SharedKeyStore', function() {
        const ks = new KeyStore(new Uint8Array(32).fill(0xff));
        const sks = ks.getSharedKeyStore(ks.publicKeyBytes);

        const nonce = new Uint8Array(24).fill(0xff);
        const data = new Uint8Array(10).fill(0xff);

        it('calculates the shared key', () => {
            const key = hexToU8a('9cfcb55fa42de280c84c95d9cf08fcbec63657998d15e139dbd3b4c6a1264541');
            expect((sks as any)._sharedKey).toEqual(key);
        });

        it('can be derived from a KeyStore', () => {
            expect(sks.localSecretKeyBytes).toEqual(ks.secretKeyBytes);
            expect(sks.localSecretKeyHex).toEqual(ks.secretKeyHex);
            expect(sks.remotePublicKeyBytes).toEqual(ks.publicKeyBytes);
            expect(sks.remotePublicKeyHex).toEqual(ks.publicKeyHex);
        });

        it('can be constructed from Uint8Array based keys', () => {
            const sks2 = new SharedKeyStore(ks.secretKeyBytes, ks.publicKeyBytes);
            expect(sks2.localSecretKeyBytes).toEqual(ks.secretKeyBytes);
            expect(sks2.localSecretKeyHex).toEqual(ks.secretKeyHex);
            expect(sks2.remotePublicKeyBytes).toEqual(ks.publicKeyBytes);
            expect(sks2.remotePublicKeyHex).toEqual(ks.publicKeyHex);
        });

        it('can be constructed from hex string based keys', () => {
            const sks2 = new SharedKeyStore(ks.secretKeyHex, ks.publicKeyHex);
            expect(sks2.localSecretKeyBytes).toEqual(ks.secretKeyBytes);
            expect(sks2.localSecretKeyHex).toEqual(ks.secretKeyHex);
            expect(sks2.remotePublicKeyBytes).toEqual(ks.publicKeyBytes);
            expect(sks2.remotePublicKeyHex).toEqual(ks.publicKeyHex);
        });

        it('rejects invalid keys', () => {
            let create;
            let error;

            create = () => new SharedKeyStore({ meow: true } as any, ks.publicKeyBytes);
            error = new ValidationError('Local private key must be an Uint8Array or a hex string');
            expect(create).toThrow(error);

            create = () => new SharedKeyStore(ks.secretKeyBytes, { meow: true } as any);
            error = new ValidationError('Remote public key must be an Uint8Array or a hex string');
            expect(create).toThrow(error);
        });

        it('can encrypt and decrypt properly (round trip)', () => {
            const expected = new Uint8Array(24).fill(0xee);
            let encrypted;

            encrypted = sks.encrypt(expected, nonce);
            expect(sks.decrypt(encrypted)).toEqual(expected);
            expect(sks.decryptRaw(encrypted.data, encrypted.nonce)).toEqual(expected);

            encrypted = sks.encryptRaw(expected, nonce);
            const encryptedBox = new Box(nonce, encrypted, nacl.box.nonceLength);
            expect(sks.decrypt(encryptedBox)).toEqual(expected);
            expect(sks.decryptRaw(encrypted, nonce)).toEqual(expected);
        });

        it('cannot encrypt without a proper nonce', () => {
            const encrypts = [
                () => sks.encrypt(data, nacl.randomBytes(3)),
                () => sks.encryptRaw(data, nacl.randomBytes(3)),
            ];

            for (const encrypt of encrypts) {
                expect(encrypt).toThrow(new Error('bad nonce size'));
            }
        });

        it('can encrypt/decrypt data from KeyStore', () => {
            const expected = new Uint8Array(24).fill(0xee);
            let encrypted;

            encrypted = ks.encrypt(expected, nonce, ks.publicKeyBytes);
            expect(sks.decrypt(encrypted)).toEqual(expected);

            encrypted = sks.encrypt(expected, nonce);
            expect(ks.decrypt(encrypted, ks.publicKeyBytes)).toEqual(expected);
        });

        it('encrypted data matches expectation with a specific set of keys', () => {
            const skLocal = Uint8Array.from([
                4, 4, 4, 4, 4, 4, 4, 4,
                3, 3, 3, 3, 3, 3, 3, 3,
                2, 2, 2, 2, 2, 2, 2, 2,
                1, 1, 1, 1, 1, 1, 1, 1,
            ]);
            const skRemote = Uint8Array.from([
                1, 1, 1, 1, 1, 1, 1, 1,
                2, 2, 2, 2, 2, 2, 2, 2,
                3, 3, 3, 3, 3, 3, 3, 3,
                4, 4, 4, 4, 4, 4, 4, 4,
            ]);
            const ks1 = new KeyStore(skLocal);
            const plaintext = new Uint8Array(0);
            const nonce1 = new TextEncoder().encode('connectionidconnectionid');
            const expected = Uint8Array.from([
                253, 142, 84, 143,
                118, 139, 224, 253,
                252, 98, 240, 45,
                22, 73, 234, 94
            ]);

            const encrypted = ks1.encryptRaw(plaintext, nonce1, new KeyStore(skRemote).publicKeyBytes);
            expect(encrypted).toEqual(expected);
        });

    });

    describe('AuthToken', function() {

        const at = new AuthToken();

        it('can return the secret key as bytes', () => {
            expect(at.keyBytes).toBeTruthy();
            expect(at.keyBytes instanceof Uint8Array).toEqual(true);
        });

        it('can return the secret key as hex string', () => {
            expect(at.keyHex).toBeTruthy();
            expect(typeof at.keyHex).toEqual('string');
        });

        it('can encrypt and decrypt properly (round trip)', () => {
            const expected = nacl.randomBytes(7);
            const nonce = nacl.randomBytes(24);
            expect(at.encrypt(expected, nonce)).not.toEqual(expected);
            expect(at.decrypt(at.encrypt(expected, nonce))).toEqual(expected);
        });

    });

}); };
