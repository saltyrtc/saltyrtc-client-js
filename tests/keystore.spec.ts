/// <reference path="jasmine.d.ts" />

import { KeyStore, Box } from "../saltyrtc/keystore";

declare var nacl: any; // TODO

export default () => {

    describe('keystore.Box', () => {

        let nonce = nacl.randomBytes(24);
        let data = nacl.randomBytes(7);
        let box = new Box(nonce, data);

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
            let nonceLength = nacl.secretbox.nonceLength;
            let nonce = nacl.randomBytes(nonceLength);
            let data = nacl.randomBytes(5);
            let array = new Uint8Array(nonceLength + 5)
            array.set(nonce);
            array.set(data, nonceLength);
            let box = Box.fromArray(array);
            expect(box.nonce).toEqual(nonce);
            expect(box.data).toEqual(data);
            expect(box.length).toEqual(nonceLength + 5);
        });

        it('can be converted into a byte array', () => {
            let array = box.toArray();
            expect(array.slice(0, nacl.secretbox.nonceLength)).toEqual(nonce);
            expect(array.slice(nacl.secretbox.nonceLength)).toEqual(data);
        });

    });

    describe('keystore.KeyStore', () => {

        let ks = new KeyStore();

        it('generates a keypair', () => {
            // Internal test
            expect((ks as any).keyPair.publicKey).toBeTruthy();
            expect((ks as any).keyPair.secretKey).toBeTruthy();
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

        it('detects whether an otherKey was set', () => {
            ks.otherKey = nacl.randomBytes(16);
            expect(ks.hasOtherKey()).toEqual(true);
            ks.otherKey = null;
            expect(ks.hasOtherKey()).toEqual(false);
        });

        it('can set and retrieve an otherKey', () => {
            ks.otherKey = null;
            expect(ks.otherKey).toBeNull();
            let other = nacl.randomBytes(16);
            ks.otherKey = other;
            expect(ks.otherKey).toEqual(other);
        });

        it('can encrypt and decrypt properly (round trip)', () => {
            let ks2 = new KeyStore();
            ks.otherKey = ks2.publicKeyBytes;
            let expected = nacl.randomBytes(24);
            expect(ks.decrypt(ks.encrypt(expected))).toEqual(expected);
        });

    });

}
