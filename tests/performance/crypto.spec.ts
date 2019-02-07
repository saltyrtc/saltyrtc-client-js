/// <reference path="../jasmine.d.ts" />

import { KeyStore } from '../../src/keystore';
import { Config } from '../config';
import { testData } from './utils';

export default () => {
    describe('crypto', () => {
        describe('Main Thread (shared key store=false)', () => {
            it(`encrypt ${Config.CRYPTO_ITERATIONS} times`, () => {
                const keyStore = new KeyStore();
                const publicKey = keyStore.publicKeyBytes;
                const start = performance.now();

                for (let i = 0; i <= Config.CRYPTO_ITERATIONS; ++i) {
                    keyStore.encrypt(testData.bytes, testData.nonce, publicKey);
                }

                const end = performance.now();
                console.info(`Took ${(end - start) / 1000} seconds`);
                expect(0).toBe(0);
            }, 30000);

            it(`decrypt ${Config.CRYPTO_ITERATIONS} times`, () => {
                const keyStore = new KeyStore();
                const publicKey = keyStore.publicKeyBytes;
                const box = keyStore.encrypt(testData.bytes, testData.nonce, publicKey);
                const start = performance.now();

                for (let i = 0; i <= Config.CRYPTO_ITERATIONS; ++i) {
                    keyStore.decrypt(box, publicKey);
                }

                const end = performance.now();
                console.info(`Took ${(end - start) / 1000} seconds`);
                expect(0).toBe(0);
            }, 30000);
        });

        describe('Main Thread (shared key store=true)', () => {
            it(`encrypt ${Config.CRYPTO_ITERATIONS} times`, () => {
                const keyStore = new KeyStore();
                const sharedKeyStore = keyStore.getSharedKeyStore(keyStore.publicKeyBytes);
                const start = performance.now();

                for (let i = 0; i <= Config.CRYPTO_ITERATIONS; ++i) {
                    sharedKeyStore.encrypt(testData.bytes, testData.nonce);
                }

                const end = performance.now();
                console.info(`Took ${(end - start) / 1000} seconds`);
                expect(0).toBe(0);
            }, 30000);

            it(`decrypt ${Config.CRYPTO_ITERATIONS} times`, () => {
                const keyStore = new KeyStore();
                const sharedKeyStore = keyStore.getSharedKeyStore(keyStore.publicKeyBytes);
                const box = sharedKeyStore.encrypt(testData.bytes, testData.nonce);
                const start = performance.now();

                for (let i = 0; i <= Config.CRYPTO_ITERATIONS; ++i) {
                    sharedKeyStore.decrypt(box);
                }

                const end = performance.now();
                console.info(`Took ${(end - start) / 1000} seconds`);
                expect(0).toBe(0);
            }, 30000);
        });

        [false, true].forEach((useSharedKeyStore) => {
            describe(`Web Worker (shared key store=${useSharedKeyStore}, transferables=false)`, () => {
                it(`encrypt ${Config.CRYPTO_ITERATIONS} times`, (done: any) => {
                    // @ts-ignore
                    expect(window.Worker).toBeDefined();
                    const worker = new Worker('performance/crypto.worker.js');
                    let iterations = 0;
                    worker.onmessage = () => {
                        ++iterations;

                        // All encryption tasks resolved?
                        if (iterations === Config.CRYPTO_ITERATIONS) {
                            worker.terminate();
                            const end = performance.now();
                            console.info(`Took ${(end - start) / 1000} seconds`);
                            done();
                        }
                    };

                    // Initialise worker as an encrypt worker
                    const keyStore = new KeyStore();
                    worker.postMessage({
                        type: 'encrypt',
                        secretKey: keyStore.secretKeyBytes,
                        useSharedKeyStore: useSharedKeyStore,
                    });
                    const start = performance.now();

                    // Enqueue encryption tasks
                    for (let i = 0; i <= Config.CRYPTO_ITERATIONS; ++i) {
                        worker.postMessage({
                            bytes: testData.bytes,
                            nonce: testData.nonce,
                        });
                    }
                }, 30000);

                it(`decrypt ${Config.CRYPTO_ITERATIONS} times`, (done: any) => {
                    // @ts-ignore
                    expect(window.Worker).toBeDefined();
                    const worker = new Worker('performance/crypto.worker.js');
                    let iterations = 0;
                    worker.onmessage = () => {
                        ++iterations;

                        // All decryption tasks resolved?
                        if (iterations === Config.CRYPTO_ITERATIONS) {
                            worker.terminate();
                            const end = performance.now();
                            console.info(`Took ${(end - start) / 1000} seconds`);
                            done();
                        }
                    };

                    // Initialise worker as a decrypt worker
                    const keyStore = new KeyStore();
                    const sharedKeyStore = keyStore.getSharedKeyStore(keyStore.publicKeyBytes);
                    const box = sharedKeyStore.encrypt(testData.bytes, testData.nonce);
                    worker.postMessage({
                        type: 'decrypt',
                        secretKey: keyStore.secretKeyBytes,
                        useSharedKeyStore: useSharedKeyStore,
                    });
                    const start = performance.now();

                    // Enqueue encryption tasks
                    for (let i = 0; i <= Config.CRYPTO_ITERATIONS; ++i) {
                        worker.postMessage({
                            bytes: box.data,
                            nonce: box.nonce,
                        });
                    }
                }, 30000);
            });

            describe(`Web Worker (shared key store=${useSharedKeyStore}, transferables=true)`, () => {
                it(`encrypt ${Config.CRYPTO_ITERATIONS} times`, (done: any) => {
                    // @ts-ignore
                    expect(window.Worker).toBeDefined();

                    const worker = new Worker('performance/crypto.worker.js');
                    let iterations = 0;
                    worker.onmessage = () => {
                        ++iterations;

                        // All encryption tasks resolved?
                        if (iterations === Config.CRYPTO_ITERATIONS) {
                            worker.terminate();
                            const end = performance.now();
                            console.info(`Took ${(end - start) / 1000} seconds`);
                            done();
                        }
                    };

                    // Initialise worker as an encrypt worker
                    const keyStore = new KeyStore();
                    const testDataArray = Array.from({ length: Config.CRYPTO_ITERATIONS }, () => {
                        // Need to copy the plain data, so it can be transferred
                        return testData.bytes.slice(0);
                    });
                    worker.postMessage({
                        type: 'encrypt-transferable',
                        secretKey: keyStore.secretKeyBytes,
                        useSharedKeyStore: useSharedKeyStore,
                    });
                    const start = performance.now();

                    // Enqueue encryption tasks
                    for (const testData_ of testDataArray) {
                        expect(testData_.buffer.byteLength).toBeGreaterThan(0);
                        worker.postMessage({
                            bytes: testData_,
                            nonce: testData.nonce,
                        }, [testData_.buffer]);
                        expect(testData_.buffer.byteLength).toBe(0);
                        expect(testData.nonce.buffer.byteLength).toBeGreaterThan(0);
                    }
                }, 60000);

                it(`decrypt ${Config.CRYPTO_ITERATIONS} times`, (done: any) => {
                    // @ts-ignore
                    expect(window.Worker).toBeDefined();

                    const worker = new Worker('performance/crypto.worker.js');
                    let iterations = 0;
                    worker.onmessage = () => {
                        ++iterations;

                        // All decryption tasks resolved?
                        if (iterations === Config.CRYPTO_ITERATIONS) {
                            worker.terminate();
                            const end = performance.now();
                            console.info(`Took ${(end - start) / 1000} seconds`);
                            done();
                        }
                    };

                    // Initialise worker as a decrypt worker
                    const keyStore = new KeyStore();
                    const sharedKeyStore = keyStore.getSharedKeyStore(keyStore.publicKeyBytes);
                    const boxes = Array.from({ length: Config.CRYPTO_ITERATIONS }, () => {
                        // Need to generate new data, so it can be transferred
                        return sharedKeyStore.encrypt(testData.bytes, testData.nonce);
                    });
                    worker.postMessage({
                        type: 'decrypt-transferable',
                        secretKey: keyStore.secretKeyBytes,
                        useSharedKeyStore: useSharedKeyStore,
                    });
                    const start = performance.now();

                    // Enqueue encryption tasks
                    for (const box of boxes) {
                        expect(box.data.buffer.byteLength).toBeGreaterThan(0);
                        worker.postMessage({
                            bytes: box.data,
                            nonce: box.nonce,
                        }, [box.data.buffer]);
                        expect(box.data.buffer.byteLength).toBe(0);
                        expect(box.nonce.buffer.byteLength).toBeGreaterThan(0);
                    }
                }, 60000);
            });
        });
    });
};
