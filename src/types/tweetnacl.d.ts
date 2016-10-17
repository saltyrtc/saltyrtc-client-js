declare namespace nacl {

    interface KeyPair {
        publicKey: Uint8Array,
        secretKey: Uint8Array,
    }

    function box(message: Uint8Array, nonce: Uint8Array,
                 theirPublicKey: Uint8Array, mySecretKey: Uint8Array): Uint8Array;
    function secretbox(message: Uint8Array, nonce: Uint8Array,
                       key: Uint8Array): Uint8Array;
    function scalarMult(n: number, p: number): number;
    function sign(message: Uint8Array, secretKey: Uint8Array): Uint8Array;
    function hash(message: Uint8Array): Uint8Array;
    function randomBytes(length: number): Uint8Array;
    function setPRNG(prng: (x, n: number) => void): void;
    function verify(x: Uint8Array, y: Uint8Array): boolean;

}

declare namespace nacl.box {
    var publicKeyLength: number;
    var secretKeyLength: number;
    var sharedKeyLength: number;
    var nonceLength: number;
    var overheadLength: number;

    function keyPair(): nacl.KeyPair;
    function open(box: Uint8Array, nonce: Uint8Array,
                  theirPublicKey: Uint8Array, mySecretKey: Uint8Array): Uint8Array | boolean;
    function before(theirPublicKey: Uint8Array, mySecretKey: Uint8Array): Uint8Array;
    function after(message: Uint8Array, nonce: Uint8Array, sharedKey: Uint8Array): Uint8Array;
}


declare namespace nacl.box.keyPair {
    function fromSecretKey(secretKey: Uint8Array): nacl.KeyPair;
}

declare namespace nacl.box.open {
    function after(box: Uint8Array, nonce: Uint8Array, sharedKey: Uint8Array): Uint8Array;
}

declare namespace nacl.secretbox {
    var keyLength: number;
    var nonceLength: number;
    var overheadLength: number;

    function open(box: Uint8Array, nonce: Uint8Array, key: Uint8Array): Uint8Array | boolean;
}

declare namespace nacl.scalarMult {
    var scalarLength: number;
    var groupElementLength: number;

    function base(n: number): number;
}

declare namespace nacl.sign {
    var publicKeyLength: number;
    var secretKeyLength: number;
    var seedLength: number;
    var signatureLength: number;

    function keyPair(): nacl.KeyPair;
    function open(signedMessage: Uint8Array, publicKey: Uint8Array): Uint8Array;
    function detached(message: Uint8Array, secretKey: Uint8Array): Uint8Array;
}

declare namespace nacl.sign.keyPair {
    function fromSecretKey(secretKey: Uint8Array): nacl.KeyPair;
    function fromSeed(seed: Uint8Array): nacl.KeyPair;
}

declare namespace nacl.sign.detached {
    function verify(message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): boolean;
}

declare namespace nacl.hash {
    var hashLength: number;
}
