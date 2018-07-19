'use strict';

importScripts(
    '../../node_modules/tweetnacl/nacl-fast.js',
    '../../node_modules/msgpack-lite/dist/msgpack.min.js',
    '../../dist/saltyrtc-client.es5.min.js',
);

let keyStore;
let publicKey;
let sharedkeyStore;

function encrypt(e) {
    const cipher = keyStore.encryptRaw(e.data.bytes, e.data.nonce, publicKey);
    postMessage(cipher);
}

function encryptTransferable(e) {
    const cipher = keyStore.encryptRaw(e.data.bytes, e.data.nonce, publicKey);
    postMessage(cipher, [cipher.buffer]);
}

function decrypt(e) {
    const plain = keyStore.decryptRaw(e.data.bytes, e.data.nonce, publicKey);
    postMessage(plain);
}

function decryptTransferable(e) {
    const plain = keyStore.decryptRaw(e.data.bytes, e.data.nonce, publicKey);
    postMessage(plain, [plain.buffer]);
}

function encryptWithSharedKey(e) {
    const cipher = sharedkeyStore.encryptRaw(e.data.bytes, e.data.nonce);
    postMessage(cipher);
}

function encryptWithSharedKeyTransferable(e) {
    const cipher = sharedkeyStore.encryptRaw(e.data.bytes, e.data.nonce);
    postMessage(cipher, [cipher.buffer]);
}

function decryptWithSharedKey(e) {
    const plain = sharedkeyStore.decryptRaw(e.data.bytes, e.data.nonce);
    postMessage(plain);
}

function decryptWithSharedKeyTransferable(e) {
    const plain = sharedkeyStore.decryptRaw(e.data.bytes, e.data.nonce);
    postMessage(plain, [plain.buffer]);
}

addEventListener('message', (e) => {
    keyStore = new saltyrtcClient.KeyStore(e.data.secretKey);
    publicKey = keyStore.publicKeyBytes;

    // Optionally use the precomputed shared key
    let callbackFunctions;
    if (e.data.useSharedKeyStore) {
        sharedkeyStore = keyStore.getSharedKeyStore(publicKey);
        callbackFunctions = {
            'encrypt': encryptWithSharedKey,
            'decrypt': decryptWithSharedKey,
            'encrypt-transferable': encryptWithSharedKeyTransferable,
            'decrypt-transferable': decryptWithSharedKeyTransferable,
        };
    } else {
        callbackFunctions = {
            'encrypt': encrypt,
            'decrypt': decrypt,
            'encrypt-transferable': encryptTransferable,
            'decrypt-transferable': decryptTransferable,
        };
    }

    // Initialise worker by type
    const callbackFunction = callbackFunctions[e.data.type];
    if (!callbackFunction) {
        console.error('Unable to determine role');
        close();
        return;
    }
    addEventListener('message', callbackFunction);
}, { once: true });
