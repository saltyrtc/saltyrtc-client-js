'use strict';

importScripts(
    '../../node_modules/tweetnacl/nacl-fast.js',
    '../../node_modules/msgpack-lite/dist/msgpack.min.js',
    '../../dist/saltyrtc-client.es5.min.js',
);

let keyStore;
let publicKey;

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

addEventListener('message', (e) => {
    keyStore = new saltyrtcClient.KeyStore(e.data.privateKey);
    publicKey = keyStore.publicKeyBytes;

    switch (e.data.type) {
        case 'encrypt':
            addEventListener('message', encrypt);
            break;
        case 'decrypt':
            addEventListener('message', decrypt);
            break;
        case 'encrypt-transferable':
            addEventListener('message', encryptTransferable);
            break;
        case 'decrypt-transferable':
            addEventListener('message', decryptTransferable);
            break;
        default:
            console.error('Unable to determine role');
            close();
            break;
    }
}, { once: true });
