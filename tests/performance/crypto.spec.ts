/// <reference path="jasmine.d.ts" />

import { KeyStore } from '../../src/keystore';
import { Config } from './../config';
import { testData } from './utils';

export default () => { describe('crypto', function() {

    it(`encrypt ${Config.CRYPTO_ITERATIONS} times`, () => {
        const keyStore = new KeyStore();
        const publicKey = keyStore.publicKeyBytes;

        const start = performance.now();
        for (let i = 0; i <= Config.CRYPTO_ITERATIONS; ++i) {
            keyStore.encrypt(testData.plain, testData.nonce, publicKey);
        }
        const end = performance.now();
        console.info(`Took ${(end - start) / 1000} seconds`);
    });

    it(`decrypt ${Config.CRYPTO_ITERATIONS} times`, () => {
        const keyStore = new KeyStore();
        const publicKey = keyStore.publicKeyBytes;
        const box = keyStore.encrypt(testData.plain, testData.nonce, publicKey);

        const start = performance.now();
        for (let i = 0; i <= Config.CRYPTO_ITERATIONS; ++i) {
            keyStore.decrypt(box, publicKey);
        }
        const end = performance.now();
        console.info(`Took ${(end - start) / 1000} seconds`);
    });

}); }
