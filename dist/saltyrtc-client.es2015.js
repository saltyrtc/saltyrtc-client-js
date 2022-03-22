/**
 * saltyrtc-client-js v0.15.1
 * SaltyRTC JavaScript implementation
 * https://github.com/saltyrtc/saltyrtc-client-js
 *
 * Copyright (C) 2016-2022 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license:
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

import * as nacl from 'tweetnacl';
import * as msgpack from 'msgpack-lite';

class CloseCode {
}
CloseCode.ClosingNormal = 1000;
CloseCode.GoingAway = 1001;
CloseCode.NoSharedSubprotocol = 1002;
CloseCode.PathFull = 3000;
CloseCode.ProtocolError = 3001;
CloseCode.InternalError = 3002;
CloseCode.Handover = 3003;
CloseCode.DroppedByInitiator = 3004;
CloseCode.InitiatorCouldNotDecrypt = 3005;
CloseCode.NoSharedTask = 3006;
CloseCode.InvalidKey = 3007;
CloseCode.Timeout = 3008;
function explainCloseCode(code) {
    switch (code) {
        case CloseCode.ClosingNormal:
            return 'Normal closing';
        case CloseCode.GoingAway:
            return 'The endpoint is going away';
        case CloseCode.NoSharedSubprotocol:
            return 'No shared subprotocol could be found';
        case CloseCode.PathFull:
            return 'No free responder byte';
        case CloseCode.ProtocolError:
            return 'Protocol error';
        case CloseCode.InternalError:
            return 'Internal error';
        case CloseCode.Handover:
            return 'Handover finished';
        case CloseCode.DroppedByInitiator:
            return 'Dropped by initiator';
        case CloseCode.InitiatorCouldNotDecrypt:
            return 'Initiator could not decrypt a message';
        case CloseCode.NoSharedTask:
            return 'No shared task was found';
        case CloseCode.InvalidKey:
            return 'Invalid key';
        case CloseCode.Timeout:
            return 'Timeout';
        default:
            return 'Unknown';
    }
}

class SignalingError extends Error {
    constructor(closeCode, message) {
        super(message);
        this.message = message;
        this.closeCode = closeCode;
        this.name = 'SignalingError';
    }
}
class ProtocolError extends SignalingError {
    constructor(message) {
        super(CloseCode.ProtocolError, message);
    }
}
class ConnectionError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = 'ConnectionError';
    }
}
class ValidationError extends Error {
    constructor(message, critical = true) {
        super(message);
        this.message = message;
        this.name = 'ValidationError';
        this.critical = critical;
    }
}
class CryptoError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'CryptoError';
        this.message = message;
        this.code = code;
    }
}

var exceptions = /*#__PURE__*/Object.freeze({
    __proto__: null,
    SignalingError: SignalingError,
    ProtocolError: ProtocolError,
    ConnectionError: ConnectionError,
    ValidationError: ValidationError,
    CryptoError: CryptoError
});

class EventRegistry {
    constructor() {
        this.map = new Map();
    }
    register(eventType, handler) {
        if (typeof eventType === 'string') {
            this.set(eventType, handler);
        }
        else {
            for (const et of eventType) {
                this.set(et, handler);
            }
        }
    }
    unregister(eventType, handler) {
        if (typeof eventType === 'string') {
            if (!this.map.has(eventType)) {
                return;
            }
            if (typeof handler === 'undefined') {
                this.map.delete(eventType);
            }
            else {
                const list = this.map.get(eventType);
                const index = list.indexOf(handler);
                if (index !== -1) {
                    list.splice(index, 1);
                }
            }
        }
        else {
            for (const et of eventType) {
                this.unregister(et, handler);
            }
        }
    }
    unregisterAll() {
        this.map.clear();
    }
    set(key, value) {
        if (this.map.has(key)) {
            const list = this.map.get(key);
            if (list.indexOf(value) === -1) {
                list.push(value);
            }
        }
        else {
            this.map.set(key, [value]);
        }
    }
    get(eventType) {
        const handlers = [];
        if (typeof eventType === 'string') {
            if (this.map.has(eventType)) {
                handlers.push.apply(handlers, this.map.get(eventType));
            }
        }
        else {
            for (const et of eventType) {
                for (const handler of this.get(et)) {
                    if (handlers.indexOf(handler) === -1) {
                        handlers.push(handler);
                    }
                }
            }
        }
        return handlers;
    }
}

class Log {
    constructor(level) {
        this.level = level;
    }
    set level(level) {
        this._level = level;
        this.debug = this.noop;
        this.trace = this.noop;
        this.info = this.noop;
        this.warn = this.noop;
        this.error = this.noop;
        this.assert = this.noop;
        switch (level) {
            case 'debug':
                this.debug = console.debug;
                this.trace = console.trace;
            case 'info':
                this.info = console.info;
            case 'warn':
                this.warn = console.warn;
            case 'error':
                this.error = console.error;
                this.assert = console.assert;
        }
    }
    get level() {
        return this._level;
    }
    noop() {
    }
}

function u8aToHex(array) {
    const results = [];
    for (const arrayByte of array) {
        results.push(arrayByte.toString(16).replace(/^([\da-f])$/, '0$1'));
    }
    return results.join('');
}
function hexToU8a(hexstring) {
    let array;
    let i;
    let j = 0;
    let k;
    let ref;
    if (hexstring.length % 2 === 1) {
        hexstring = '0' + hexstring;
    }
    array = new Uint8Array(hexstring.length / 2);
    for (i = k = 0, ref = hexstring.length; k <= ref; i = k += 2) {
        array[j++] = parseInt(hexstring.substr(i, 2), 16);
    }
    return array;
}
function byteToHex(value) {
    return '0x' + ('00' + value.toString(16)).substr(-2);
}
function randomUint32() {
    const crypto = window.crypto || window.msCrypto;
    return crypto.getRandomValues(new Uint32Array(1))[0];
}
function concat(...arrays) {
    let totalLength = 0;
    for (const arr of arrays) {
        totalLength += arr.length;
    }
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}
function isString(value) {
    return typeof value === 'string' || value instanceof String;
}
function validateKey(key, name = 'Key') {
    let out;
    if (isString(key)) {
        if (key.length !== 64) {
            throw new ValidationError(name + ' must be 32 bytes long');
        }
        out = hexToU8a(key);
    }
    else if (key instanceof Uint8Array) {
        out = key;
    }
    else {
        throw new ValidationError(name + ' must be an Uint8Array or a hex string');
    }
    if (out.byteLength !== 32) {
        throw new ValidationError(name + ' must be 32 bytes long');
    }
    return out;
}
function arraysAreEqual(a1, a2) {
    if (a1.length !== a2.length) {
        return false;
    }
    for (let i = 0; i < a1.length; i++) {
        if (a1[i] !== a2[i]) {
            return false;
        }
    }
    return true;
}
function arrayToBuffer(array) {
    if (array.byteOffset === 0 && array.byteLength === array.buffer.byteLength) {
        return array.buffer;
    }
    return array.buffer.slice(array.byteOffset, array.byteOffset + array.byteLength);
}

class Box {
    constructor(nonce, data, nonceLength) {
        this._nonce = nonce;
        this._nonceLength = nonceLength;
        this._data = data;
    }
    get length() {
        return this._nonce.length + this._data.length;
    }
    get data() {
        return this._data;
    }
    get nonce() {
        return this._nonce;
    }
    static fromUint8Array(array, nonceLength) {
        if (nonceLength === undefined) {
            throw new Error('nonceLength parameter not specified');
        }
        if (array.byteLength <= nonceLength) {
            throw new CryptoError('bad-message-length', 'Message is shorter than nonce');
        }
        const nonce = array.slice(0, nonceLength);
        const data = array.slice(nonceLength);
        return new Box(nonce, data, nonceLength);
    }
    toUint8Array() {
        const box = new Uint8Array(this.length);
        box.set(this._nonce);
        box.set(this._data, this._nonceLength);
        return box;
    }
}
class KeyStore {
    constructor(secretKey, log) {
        this.logTag = '[SaltyRTC.KeyStore]';
        if (log === undefined) {
            log = new Log('none');
        }
        if (arguments.length > 2) {
            throw new Error('Too many arguments in KeyStore constructor');
        }
        if (secretKey === undefined) {
            this._keyPair = nacl.box.keyPair();
            log.debug(this.logTag, 'New public key:', u8aToHex(this._keyPair.publicKey));
        }
        else {
            this._keyPair = nacl.box.keyPair.fromSecretKey(validateKey(secretKey, 'Private key'));
            log.debug(this.logTag, 'Restored public key:', u8aToHex(this._keyPair.publicKey));
        }
    }
    getSharedKeyStore(publicKey) {
        return new SharedKeyStore(this.secretKeyBytes, publicKey);
    }
    get publicKeyHex() {
        return u8aToHex(this._keyPair.publicKey);
    }
    get publicKeyBytes() {
        return this._keyPair.publicKey;
    }
    get secretKeyHex() {
        return u8aToHex(this._keyPair.secretKey);
    }
    get secretKeyBytes() {
        return this._keyPair.secretKey;
    }
    get keypair() {
        return this._keyPair;
    }
    encryptRaw(bytes, nonce, otherKey) {
        return nacl.box(bytes, nonce, otherKey, this._keyPair.secretKey);
    }
    encrypt(bytes, nonce, otherKey) {
        const encrypted = this.encryptRaw(bytes, nonce, otherKey);
        return new Box(nonce, encrypted, nacl.box.nonceLength);
    }
    decryptRaw(bytes, nonce, otherKey) {
        const data = nacl.box.open(bytes, nonce, otherKey, this._keyPair.secretKey);
        if (!data) {
            throw new CryptoError('decryption-failed', 'Data could not be decrypted');
        }
        return data;
    }
    decrypt(box, otherKey) {
        return this.decryptRaw(box.data, box.nonce, otherKey);
    }
}
class SharedKeyStore {
    constructor(localSecretKey, remotePublicKey) {
        this._localSecretKey = validateKey(localSecretKey, 'Local private key');
        this._remotePublicKey = validateKey(remotePublicKey, 'Remote public key');
        this._sharedKey = nacl.box.before(this._remotePublicKey, this._localSecretKey);
    }
    get localSecretKeyHex() {
        return u8aToHex(this._localSecretKey);
    }
    get localSecretKeyBytes() {
        return this._localSecretKey;
    }
    get remotePublicKeyHex() {
        return u8aToHex(this._remotePublicKey);
    }
    get remotePublicKeyBytes() {
        return this._remotePublicKey;
    }
    encryptRaw(bytes, nonce) {
        return nacl.box.after(bytes, nonce, this._sharedKey);
    }
    encrypt(bytes, nonce) {
        const encrypted = this.encryptRaw(bytes, nonce);
        return new Box(nonce, encrypted, nacl.box.nonceLength);
    }
    decryptRaw(bytes, nonce) {
        const data = nacl.box.open.after(bytes, nonce, this._sharedKey);
        if (!data) {
            throw new CryptoError('decryption-failed', 'Data could not be decrypted');
        }
        return data;
    }
    decrypt(box) {
        return this.decryptRaw(box.data, box.nonce);
    }
}
class AuthToken {
    constructor(bytes, log) {
        this._authToken = null;
        this.logTag = '[SaltyRTC.AuthToken]';
        if (log === undefined) {
            log = new Log('none');
        }
        if (typeof bytes === 'undefined') {
            this._authToken = nacl.randomBytes(nacl.secretbox.keyLength);
            log.debug(this.logTag, 'Generated auth token');
        }
        else {
            if (bytes.byteLength !== nacl.secretbox.keyLength) {
                const msg = 'Auth token must be ' + nacl.secretbox.keyLength + ' bytes long.';
                log.error(this.logTag, msg);
                throw new CryptoError('bad-token-length', msg);
            }
            this._authToken = bytes;
            log.debug(this.logTag, 'Initialized auth token');
        }
    }
    get keyBytes() {
        return this._authToken;
    }
    get keyHex() {
        return u8aToHex(this._authToken);
    }
    encrypt(bytes, nonce) {
        const encrypted = nacl.secretbox(bytes, nonce, this._authToken);
        return new Box(nonce, encrypted, nacl.secretbox.nonceLength);
    }
    decrypt(box) {
        const data = nacl.secretbox.open(box.data, box.nonce, this._authToken);
        if (!data) {
            throw new CryptoError('decryption-failed', 'Data could not be decrypted');
        }
        return data;
    }
}

class Cookie {
    constructor(bytes) {
        if (bytes !== undefined) {
            if (bytes.length !== 16) {
                throw new ValidationError('Bad cookie length');
            }
            this.bytes = bytes;
        }
        else {
            this.bytes = nacl.randomBytes(Cookie.COOKIE_LENGTH);
        }
    }
    equals(otherCookie) {
        if (otherCookie.bytes === this.bytes) {
            return true;
        }
        if (otherCookie.bytes.byteLength !== Cookie.COOKIE_LENGTH) {
            return false;
        }
        for (let i = 0; i < this.bytes.byteLength; i++) {
            if (otherCookie.bytes[i] !== this.bytes[i]) {
                return false;
            }
        }
        return true;
    }
}
Cookie.COOKIE_LENGTH = 16;
class CookiePair {
    constructor(ours, theirs) {
        this._ours = null;
        this._theirs = null;
        if (typeof ours !== 'undefined' && typeof theirs !== 'undefined') {
            if (theirs.equals(ours)) {
                throw new ProtocolError('Their cookie matches our cookie');
            }
            this._ours = ours;
            this._theirs = theirs;
        }
        else if (typeof ours === 'undefined' && typeof theirs === 'undefined') {
            this._ours = new Cookie();
        }
        else {
            throw new Error('Either both or no cookies must be specified');
        }
    }
    static fromTheirs(theirs) {
        let ours;
        do {
            ours = new Cookie();
        } while (ours.equals(theirs));
        return new CookiePair(ours, theirs);
    }
    get ours() {
        return this._ours;
    }
    get theirs() {
        return this._theirs;
    }
    set theirs(cookie) {
        if (cookie.equals(this._ours)) {
            throw new ProtocolError('Their cookie matches our cookie');
        }
        this._theirs = cookie;
    }
}

class Nonce {
    constructor(cookie, overflow, sequenceNumber, source, destination) {
        this._cookie = cookie;
        this._overflow = overflow;
        this._sequenceNumber = sequenceNumber;
        this._source = source;
        this._destination = destination;
    }
    get cookie() {
        return this._cookie;
    }
    get overflow() {
        return this._overflow;
    }
    get sequenceNumber() {
        return this._sequenceNumber;
    }
    get combinedSequenceNumber() {
        return (this._overflow * (Math.pow(2, 32))) + this._sequenceNumber;
    }
    get source() {
        return this._source;
    }
    get destination() {
        return this._destination;
    }
    static fromUint8Array(packet) {
        if (packet.byteLength !== this.TOTAL_LENGTH) {
            throw new ValidationError('bad-packet-length');
        }
        const view = new DataView(packet.buffer, packet.byteOffset + Cookie.COOKIE_LENGTH, 8);
        const cookie = new Cookie(packet.slice(0, Cookie.COOKIE_LENGTH));
        const source = view.getUint8(0);
        const destination = view.getUint8(1);
        const overflow = view.getUint16(2);
        const sequenceNumber = view.getUint32(4);
        return new Nonce(cookie, overflow, sequenceNumber, source, destination);
    }
    toUint8Array() {
        const buffer = new ArrayBuffer(Nonce.TOTAL_LENGTH);
        const array = new Uint8Array(buffer);
        array.set(this._cookie.bytes);
        const view = new DataView(buffer, Cookie.COOKIE_LENGTH, 8);
        view.setUint8(0, this._source);
        view.setUint8(1, this._destination);
        view.setUint16(2, this._overflow);
        view.setUint32(4, this._sequenceNumber);
        return array;
    }
}
Nonce.TOTAL_LENGTH = 24;

class CombinedSequence {
    constructor() {
        this.sequenceNumber = randomUint32();
        this.overflow = 0;
    }
    next() {
        if (this.sequenceNumber >= CombinedSequence.SEQUENCE_NUMBER_MAX) {
            this.sequenceNumber = 0;
            this.overflow += 1;
            if (this.overflow >= CombinedSequence.OVERFLOW_MAX) {
                throw new Error('overflow-overflow');
            }
        }
        else {
            this.sequenceNumber += 1;
        }
        return {
            sequenceNumber: this.sequenceNumber,
            overflow: this.overflow,
        };
    }
    asNumber() {
        return (this.overflow * (Math.pow(2, 32))) + this.sequenceNumber;
    }
}
CombinedSequence.SEQUENCE_NUMBER_MAX = 0xFFFFFFFF;
CombinedSequence.OVERFLOW_MAX = 0xFFFFF;
class CombinedSequencePair {
    constructor(ours, theirs) {
        this.ours = null;
        this.theirs = null;
        if (typeof ours !== 'undefined' && typeof theirs !== 'undefined') {
            this.ours = ours;
            this.theirs = theirs;
        }
        else if (typeof ours === 'undefined' && typeof theirs === 'undefined') {
            this.ours = new CombinedSequence();
        }
        else {
            throw new Error('Either both or no combined sequences must be specified');
        }
    }
}

class Peer {
    constructor(id, cookiePair) {
        this._csnPair = new CombinedSequencePair();
        this._permanentSharedKey = null;
        this._sessionSharedKey = null;
        this._id = id;
        if (cookiePair === undefined) {
            this._cookiePair = new CookiePair();
        }
        else {
            this._cookiePair = cookiePair;
        }
    }
    get id() {
        return this._id;
    }
    get hexId() {
        return byteToHex(this._id);
    }
    get csnPair() {
        return this._csnPair;
    }
    get cookiePair() {
        return this._cookiePair;
    }
    get permanentSharedKey() {
        return this._permanentSharedKey;
    }
    get sessionSharedKey() {
        return this._sessionSharedKey;
    }
    setPermanentSharedKey(remotePermanentKey, localPermanentKey) {
        this._permanentSharedKey = localPermanentKey.getSharedKeyStore(remotePermanentKey);
    }
    setSessionSharedKey(remoteSessionKey, localSessionKey) {
        this._sessionSharedKey = localSessionKey.getSharedKeyStore(remoteSessionKey);
    }
}
class Client extends Peer {
    constructor() {
        super(...arguments);
        this._localSessionKey = null;
    }
    get localSessionKey() {
        return this._localSessionKey;
    }
    setLocalSessionKey(localSessionKey) {
        this._localSessionKey = localSessionKey;
    }
    setSessionSharedKey(remoteSessionKey, localSessionKey) {
        if (!localSessionKey) {
            localSessionKey = this._localSessionKey;
        }
        else {
            this._localSessionKey = localSessionKey;
        }
        super.setSessionSharedKey(remoteSessionKey, localSessionKey);
    }
}
class Initiator extends Client {
    constructor(remotePermanentKey, localPermanentKey) {
        super(Initiator.ID);
        this.connected = false;
        this.handshakeState = 'new';
        this.setPermanentSharedKey(remotePermanentKey, localPermanentKey);
    }
    get name() {
        return 'Initiator';
    }
}
Initiator.ID = 0x01;
class Responder extends Client {
    constructor(id, counter) {
        super(id);
        this.handshakeState = 'new';
        this._counter = counter;
    }
    get name() {
        return 'Responder ' + this.id;
    }
    get counter() {
        return this._counter;
    }
}
class Server extends Peer {
    constructor() {
        super(Server.ID);
        this.handshakeState = 'new';
    }
    get name() {
        return 'Server';
    }
}
Server.ID = 0x00;

class HandoverState {
    constructor() {
        this.reset();
    }
    get local() {
        return this._local;
    }
    set local(state) {
        const wasBoth = this.both;
        this._local = state;
        if (!wasBoth && this.both && this.onBoth !== undefined) {
            this.onBoth();
        }
    }
    get peer() {
        return this._peer;
    }
    set peer(state) {
        const wasBoth = this.both;
        this._peer = state;
        if (!wasBoth && this.both && this.onBoth !== undefined) {
            this.onBoth();
        }
    }
    get both() {
        return this._local === true && this._peer === true;
    }
    get any() {
        return this._local === true || this._peer === true;
    }
    reset() {
        this._local = false;
        this._peer = false;
    }
}

function isResponderId(id) {
    return id >= 0x02 && id <= 0xff;
}

class Signaling {
    constructor(client, host, port, serverKey, tasks, pingInterval, permanentKey, peerTrustedKey) {
        this.protocol = 'wss';
        this.ws = null;
        this.msgpackEncodeOptions = {
            codec: msgpack.createCodec({ binarraybuffer: true }),
        };
        this.msgpackDecodeOptions = {
            codec: msgpack.createCodec({ binarraybuffer: true }),
        };
        this.state = 'new';
        this.handoverState = new HandoverState();
        this.neverConnected = true;
        this.task = null;
        this.server = new Server();
        this.peerTrustedKey = null;
        this.authToken = null;
        this.serverPublicKey = null;
        this.role = null;
        this.logTag = '[SaltyRTC.Signaling]';
        this.address = Signaling.SALTYRTC_ADDR_UNKNOWN;
        this.log = client.log;
        this.client = client;
        this.permanentKey = permanentKey;
        this.host = host;
        this.port = port;
        this.tasks = tasks;
        this.pingInterval = pingInterval;
        if (peerTrustedKey !== undefined) {
            this.peerTrustedKey = peerTrustedKey;
        }
        if (serverKey !== undefined) {
            this.serverPublicKey = serverKey;
        }
        this.handoverState.onBoth = () => {
            this.client.emit({ type: 'handover' });
            this.closeWebsocket(CloseCode.Handover);
        };
    }
    setState(newState) {
        this.state = newState;
        this.client.emit({ type: 'state-change', data: newState });
        this.client.emit({ type: 'state-change:' + newState });
    }
    getState() {
        return this.state;
    }
    get permanentKeyBytes() {
        return this.permanentKey.publicKeyBytes;
    }
    get authTokenBytes() {
        if (this.authToken !== null) {
            return this.authToken.keyBytes;
        }
        return null;
    }
    get peerPermanentKeyBytes() {
        return this.getPeer().permanentSharedKey.remotePublicKeyBytes;
    }
    msgpackEncode(data) {
        return msgpack.encode(data, this.msgpackEncodeOptions);
    }
    msgpackDecode(data) {
        return msgpack.decode(data, this.msgpackDecodeOptions);
    }
    connect() {
        if (this.neverConnected !== true) {
            throw new ConnectionError('Signaling instance cannot be reused. Please create a new client instance.');
        }
        this.neverConnected = false;
        this.resetConnection();
        this.initWebsocket();
    }
    disconnect(unbind = false) {
        const reason = CloseCode.ClosingNormal;
        this.setState('closing');
        if (this.state === 'task') {
            this.sendClose(reason);
        }
        this.closeWebsocket(reason, undefined, unbind);
        if (this.task !== null) {
            this.log.debug(this.logTag, 'Closing task connections');
            this.task.close(reason);
        }
        this.setState('closed');
    }
    closeWebsocket(code, reason, unbind = false) {
        if (this.ws !== null) {
            if (code === undefined || code <= 3000) {
                code = CloseCode.ClosingNormal;
            }
            this.log.debug(this.logTag, `Disconnecting WebSocket, close code: ${code}`);
            this.ws.close(code, reason);
            if (unbind) {
                this.ws.removeEventListener('open', this.onOpen.bind(this));
                this.ws.removeEventListener('error', this.onError.bind(this));
                this.ws.removeEventListener('close', this.onClose.bind(this));
                this.ws.removeEventListener('message', this.onMessage.bind(this));
            }
            this.ws = null;
            if (unbind) {
                this.setState('closed');
            }
        }
    }
    initWebsocket() {
        const url = this.protocol + '://' + this.host + ':' + this.port + '/';
        const path = this.getWebsocketPath();
        this.ws = new WebSocket(url + path, Signaling.SALTYRTC_SUBPROTOCOL);
        this.ws.binaryType = 'arraybuffer';
        this.ws.addEventListener('open', this.onOpen.bind(this));
        this.ws.addEventListener('error', this.onError.bind(this));
        this.ws.addEventListener('close', this.onClose.bind(this));
        this.ws.addEventListener('message', this.onMessage.bind(this));
        this.setState('ws-connecting');
        this.log.debug(this.logTag, 'Opening WebSocket connection to', url + path);
    }
    onOpen() {
        this.log.info(this.logTag, 'Opened connection');
        this.setState('server-handshake');
    }
    onError(ev) {
        this.log.error(this.logTag, 'General WebSocket error', ev);
        this.client.emit({ type: 'connection-error' });
    }
    onClose(ev) {
        if (ev.code === CloseCode.Handover) {
            this.log.info(this.logTag, 'Closed WebSocket connection due to handover');
        }
        else {
            this.log.info(this.logTag, 'Closed WebSocket connection with close code ' + ev.code +
                ' (' + explainCloseCode(ev.code) + ')');
            this.setState('closed');
            this.client.emit({ type: 'connection-closed', data: ev.code });
        }
    }
    onMessage(ev) {
        this.log.debug(this.logTag, 'New ws message (' + ev.data.byteLength + ' bytes)');
        if (this.handoverState.peer) {
            this.log.error(this.logTag, 'Protocol error: Received WebSocket message from peer ' +
                'even though it has already handed over to task.');
            this.resetConnection(CloseCode.ProtocolError);
            return;
        }
        let nonce;
        try {
            const box = Box.fromUint8Array(new Uint8Array(ev.data), Nonce.TOTAL_LENGTH);
            nonce = Nonce.fromUint8Array(box.nonce);
            const peer = this.getPeerWithId(nonce.source);
            if (peer === null) {
                this.log.debug(this.logTag, 'Ignoring message from unknown id: ' + nonce.source);
                return;
            }
            try {
                this.validateNonce(nonce);
            }
            catch (e) {
                if (e.name === 'ValidationError') {
                    if (e.critical === true) {
                        throw new ProtocolError('Invalid nonce: ' + e);
                    }
                    else {
                        this.log.warn(this.logTag, 'Dropping message with invalid nonce: ' + e);
                        return;
                    }
                }
                else {
                    throw e;
                }
            }
            switch (this.getState()) {
                case 'server-handshake':
                    this.onServerHandshakeMessage(box, nonce);
                    break;
                case 'peer-handshake':
                    this.onPeerHandshakeMessage(box, nonce);
                    break;
                case 'task':
                    this.onSignalingMessage(box, nonce);
                    break;
                default:
                    this.log.warn(this.logTag, 'Received message in', this.getState(), 'signaling state. Ignoring.');
            }
        }
        catch (e) {
            if (e.name === 'SignalingError' || e.name === 'ProtocolError') {
                let errmsg = 'Signaling error: ' + explainCloseCode(e.closeCode);
                if (e.message) {
                    errmsg += ' (' + e.message + ')';
                }
                this.log.error(this.logTag, errmsg);
                switch (this.state) {
                    case 'new':
                    case 'ws-connecting':
                    case 'server-handshake':
                        this.resetConnection(e.closeCode);
                        break;
                    case 'peer-handshake':
                        this.handlePeerHandshakeSignalingError(e, nonce === undefined ? null : nonce.source);
                        break;
                    case 'task':
                        this.sendClose(e.closeCode);
                        this.resetConnection(CloseCode.ClosingNormal);
                        break;
                }
            }
            else if (e.name === 'ConnectionError') {
                this.log.warn(this.logTag, 'Connection error. Resetting connection.');
                this.resetConnection(CloseCode.InternalError);
            }
            else {
                if (e.hasOwnProperty('stack')) {
                    this.log.error(this.logTag, 'An unknown error occurred:');
                    this.log.error(e.stack);
                }
                throw e;
            }
        }
    }
    onServerHandshakeMessage(box, nonce) {
        let payload;
        if (this.server.handshakeState === 'new') {
            payload = box.data;
        }
        else {
            payload = this.server.sessionSharedKey.decrypt(box);
        }
        const msg = this.decodeMessage(payload, 'server handshake');
        switch (this.server.handshakeState) {
            case 'new':
                if (msg.type !== 'server-hello') {
                    throw new ProtocolError('Expected server-hello message, but got ' + msg.type);
                }
                this.log.debug(this.logTag, 'Received server-hello');
                this.handleServerHello(msg, nonce);
                this.sendClientHello();
                this.sendClientAuth();
                break;
            case 'hello-sent':
                throw new ProtocolError('Received ' + msg.type + ' message before sending client-auth');
            case 'auth-sent':
                if (msg.type !== 'server-auth') {
                    throw new ProtocolError('Expected server-auth message, but got ' + msg.type);
                }
                this.log.debug(this.logTag, 'Received server-auth');
                this.handleServerAuth(msg, nonce);
                break;
            case 'done':
                throw new SignalingError(CloseCode.InternalError, 'Received server handshake message even though server handshake state is set to \'done\'');
            default:
                throw new SignalingError(CloseCode.InternalError, 'Unknown server handshake state: ' + this.server.handshakeState);
        }
        if (this.server.handshakeState === 'done') {
            this.setState('peer-handshake');
            this.log.debug(this.logTag, 'Server handshake done');
            this.initPeerHandshake();
        }
    }
    onSignalingMessage(box, nonce) {
        this.log.debug(this.logTag, 'Message received');
        if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
            this.onSignalingServerMessage(box);
        }
        else {
            const decrypted = this.getPeer().sessionSharedKey.decrypt(box);
            this.onSignalingPeerMessage(decrypted);
        }
    }
    onSignalingServerMessage(box) {
        const msg = this.decryptServerMessage(box);
        switch (msg.type) {
            case 'send-error':
                this.log.debug(this.logTag, 'Received send-error message');
                this.handleSendError(msg);
                break;
            case 'disconnected':
                this.log.debug(this.logTag, 'Received disconnected message');
                this.handleDisconnected(msg);
                break;
            default:
                this.onUnhandledSignalingServerMessage(msg);
        }
    }
    onSignalingPeerMessage(decrypted) {
        const msg = this.decodeMessage(decrypted);
        if (msg.type === 'close') {
            this.log.debug(this.logTag, 'Received close');
            this.handleClose(msg);
        }
        else if (msg.type === 'application') {
            this.log.debug(this.logTag, 'Received application message');
            this.handleApplication(msg);
        }
        else if (this.task !== null) {
            const messageSupportedByTask = this.task.getSupportedMessageTypes().indexOf(msg.type) !== -1;
            if (messageSupportedByTask) {
                this.log.debug(this.logTag, 'Received', msg.type, '[' + this.task.getName() + ']');
                this.task.onTaskMessage(msg);
            }
            else {
                this.log.error(this.logTag, 'Received', msg.type, 'message which is not supported by the', this.task.getName(), 'task');
                this.resetConnection(CloseCode.ProtocolError);
            }
        }
        else {
            this.log.warn(this.logTag, 'Received message with invalid type from peer:', msg.type);
        }
    }
    handleServerHello(msg, nonce) {
        this.server.setSessionSharedKey(new Uint8Array(msg.key), this.permanentKey);
        this.server.cookiePair.theirs = nonce.cookie;
    }
    sendClientAuth() {
        const message = {
            type: 'client-auth',
            your_cookie: arrayToBuffer(this.server.cookiePair.theirs.bytes),
            subprotocols: [Signaling.SALTYRTC_SUBPROTOCOL],
            ping_interval: this.pingInterval,
        };
        if (this.serverPublicKey !== null) {
            message.your_key = arrayToBuffer(this.serverPublicKey);
        }
        const packet = this.buildPacket(message, this.server);
        this.log.debug(this.logTag, 'Sending client-auth');
        this.ws.send(packet);
        this.server.handshakeState = 'auth-sent';
    }
    handleSendError(msg) {
        const id = new DataView(msg.id);
        const idString = u8aToHex(new Uint8Array(msg.id));
        const source = id.getUint8(0);
        const destination = id.getUint8(1);
        if (source !== this.address) {
            throw new ProtocolError('Received send-error message for a message not sent by us!');
        }
        this.log.warn(this.logTag, 'SendError: Could not send unknown message:', idString);
        this._handleSendError(destination);
    }
    handleApplication(msg) {
        this.client.emit({ type: 'application', data: msg.data });
    }
    sendClose(reason) {
        const message = {
            type: 'close',
            reason: reason,
        };
        this.log.debug(this.logTag, 'Sending close');
        if (this.handoverState.local === true) {
            this.task.sendSignalingMessage(this.msgpackEncode(message));
        }
        else {
            const packet = this.buildPacket(message, this.getPeer());
            this.ws.send(packet);
        }
    }
    handleClose(msg) {
        this.log.warn(this.logTag, 'Received close message. Reason:', msg.reason, '(' + explainCloseCode(msg.reason) + ')');
        this.task.close(msg.reason);
        this.resetConnection(CloseCode.GoingAway);
    }
    handleDisconnected(msg) {
        this.client.emit({ type: 'peer-disconnected', data: msg.id });
    }
    validateNonce(nonce) {
        this.validateNonceSource(nonce);
        this.validateNonceDestination(nonce);
        this.validateNonceCsn(nonce);
        this.validateNonceCookie(nonce);
    }
    validateNonceSource(nonce) {
        switch (this.state) {
            case 'server-handshake':
                if (nonce.source !== Signaling.SALTYRTC_ADDR_SERVER) {
                    throw new ValidationError('Received message during server handshake ' +
                        'with invalid sender address (' + nonce.source + ' != ' + Signaling.SALTYRTC_ADDR_SERVER + ')', false);
                }
                break;
            case 'peer-handshake':
            case 'task':
                if (nonce.source !== Signaling.SALTYRTC_ADDR_SERVER) {
                    if (this.role === 'initiator' && !isResponderId(nonce.source)) {
                        throw new ValidationError('Initiator peer message does not come from ' +
                            'a valid responder address: ' + nonce.source, false);
                    }
                    else if (this.role === 'responder' && nonce.source !== Signaling.SALTYRTC_ADDR_INITIATOR) {
                        throw new ValidationError('Responder peer message does not come from ' +
                            'intitiator (' + Signaling.SALTYRTC_ADDR_INITIATOR + '), ' +
                            'but from ' + nonce.source, false);
                    }
                }
                break;
            default:
                throw new ProtocolError('Cannot validate message nonce in signaling state ' + this.state);
        }
    }
    validateNonceDestination(nonce) {
        let expected = null;
        if (this.state === 'server-handshake') {
            switch (this.server.handshakeState) {
                case 'new':
                case 'hello-sent':
                    expected = Signaling.SALTYRTC_ADDR_UNKNOWN;
                    break;
                case 'auth-sent':
                    if (this.role === 'initiator') {
                        expected = Signaling.SALTYRTC_ADDR_INITIATOR;
                    }
                    else {
                        if (!isResponderId(nonce.destination)) {
                            throw new ValidationError('Received message during server handshake with invalid ' +
                                'receiver address (' + nonce.destination + ' is not a valid responder id)');
                        }
                    }
                    break;
                case 'done':
                    expected = this.address;
                    break;
            }
        }
        else if (this.state === 'peer-handshake' || this.state === 'task') {
            expected = this.address;
        }
        else {
            throw new ValidationError('Cannot validate message nonce in signaling state ' + this.state);
        }
        if (expected !== null && nonce.destination !== expected) {
            throw new ValidationError('Received message with invalid destination (' +
                nonce.destination + ' != ' + expected + ')');
        }
    }
    validateNonceCsn(nonce) {
        const peer = this.getPeerWithId(nonce.source);
        if (peer === null) {
            throw new ProtocolError('Could not find peer ' + nonce.source);
        }
        if (peer.csnPair.theirs === null) {
            if (nonce.overflow !== 0) {
                throw new ValidationError('First message from ' + peer.name
                    + ' must have set the overflow number to 0');
            }
            peer.csnPair.theirs = nonce.combinedSequenceNumber;
        }
        else {
            const previous = peer.csnPair.theirs;
            const current = nonce.combinedSequenceNumber;
            if (current < previous) {
                throw new ValidationError(peer.name + ' CSN is lower than last time');
            }
            else if (current === previous) {
                throw new ValidationError(peer.name + " CSN hasn't been incremented");
            }
            else {
                peer.csnPair.theirs = current;
            }
        }
    }
    validateNonceCookie(nonce) {
        const peer = this.getPeerWithId(nonce.source);
        if (peer !== null && peer.cookiePair.theirs !== null) {
            if (!nonce.cookie.equals(peer.cookiePair.theirs)) {
                throw new ValidationError(peer.name + ' cookie changed');
            }
        }
    }
    validateRepeatedCookie(peer, repeatedCookieBytes) {
        const repeatedCookie = new Cookie(repeatedCookieBytes);
        if (!repeatedCookie.equals(peer.cookiePair.ours)) {
            this.log.debug(this.logTag, 'Their cookie:', repeatedCookie.bytes);
            this.log.debug(this.logTag, 'Our cookie:', peer.cookiePair.ours.bytes);
            throw new ProtocolError('Peer repeated cookie does not match our cookie');
        }
    }
    validateSignedKeys(signedKeys, nonce, serverPublicKey) {
        if (signedKeys === null || signedKeys === undefined) {
            throw new ValidationError('Server did not send signed_keys in server-auth message');
        }
        const box = new Box(nonce.toUint8Array(), new Uint8Array(signedKeys), nacl.box.nonceLength);
        this.log.debug(this.logTag, 'Expected server public permanent key is', u8aToHex(serverPublicKey));
        let decrypted;
        try {
            decrypted = this.permanentKey.decrypt(box, serverPublicKey);
        }
        catch (e) {
            if (e.name === 'CryptoError' && e.code === 'decryption-failed') {
                throw new ValidationError('Could not decrypt signed_keys in server_auth message');
            }
            throw e;
        }
        const expected = concat(this.server.sessionSharedKey.remotePublicKeyBytes, this.permanentKey.publicKeyBytes);
        if (!arraysAreEqual(decrypted, expected)) {
            throw new ValidationError('Decrypted signed_keys in server-auth message is invalid');
        }
    }
    decodeMessage(data, expectedType, enforce = false) {
        const msg = this.msgpackDecode(data);
        if (msg.type === undefined) {
            throw new ProtocolError('Malformed ' + expectedType + ' message: Failed to decode msgpack data.');
        }
        if (enforce && expectedType !== undefined && msg.type !== expectedType) {
            throw new ProtocolError('Invalid ' + expectedType + ' message, bad type: ' + msg);
        }
        return msg;
    }
    buildPacket(message, receiver, encrypt = true) {
        let csn;
        try {
            csn = receiver.csnPair.ours.next();
        }
        catch (e) {
            throw new ProtocolError('CSN overflow: ' + e.message);
        }
        const nonce = new Nonce(receiver.cookiePair.ours, csn.overflow, csn.sequenceNumber, this.address, receiver.id);
        const nonceBytes = nonce.toUint8Array();
        const data = this.msgpackEncode(message);
        if (encrypt === false) {
            return concat(nonceBytes, data);
        }
        let box;
        if (receiver.id === Signaling.SALTYRTC_ADDR_SERVER) {
            box = this.encryptHandshakeDataForServer(data, nonceBytes);
        }
        else if (receiver.id === Signaling.SALTYRTC_ADDR_INITIATOR || isResponderId(receiver.id)) {
            box = this.encryptHandshakeDataForPeer(receiver.id, message.type, data, nonceBytes);
        }
        else {
            throw new ProtocolError('Bad receiver byte: ' + receiver);
        }
        return box.toUint8Array();
    }
    encryptHandshakeDataForServer(payload, nonceBytes) {
        return this.server.sessionSharedKey.encrypt(payload, nonceBytes);
    }
    getCurrentPeerCsn() {
        if (this.getState() !== 'task') {
            return null;
        }
        return {
            incoming: this.getPeer().csnPair.theirs,
            outgoing: this.getPeer().csnPair.ours.asNumber(),
        };
    }
    decryptData(box) {
        return this.getPeer().sessionSharedKey.decrypt(box);
    }
    resetConnection(reason) {
        this.closeWebsocket(reason, undefined, true);
        this.server = new Server();
        this.handoverState.reset();
        this.setState('new');
        if (reason !== undefined) {
            this.log.debug(this.logTag, 'Connection reset');
        }
    }
    initTask(task, data) {
        try {
            task.init(this, data);
        }
        catch (e) {
            if (e.name === 'ValidationError') {
                throw new ProtocolError('Peer sent invalid task data');
            }
            throw e;
        }
        this.task = task;
    }
    decryptPeerMessage(box, convertErrors = true) {
        try {
            const decrypted = this.getPeer().sessionSharedKey.decrypt(box);
            return this.decodeMessage(decrypted, 'peer');
        }
        catch (e) {
            if (convertErrors === true && e.name === 'CryptoError' && e.code === 'decryption-failed') {
                const nonce = Nonce.fromUint8Array(box.nonce);
                throw new ProtocolError('Could not decrypt peer message from ' + byteToHex(nonce.source));
            }
            else {
                throw e;
            }
        }
    }
    decryptServerMessage(box) {
        try {
            const decrypted = this.server.sessionSharedKey.decrypt(box);
            return this.decodeMessage(decrypted, 'server');
        }
        catch (e) {
            if (e.name === 'CryptoError' && e.code === 'decryption-failed') {
                throw new ProtocolError('Could not decrypt server message');
            }
            else {
                throw e;
            }
        }
    }
    sendApplication(msg) {
        this.sendPostClientHandshakeMessage(msg, 'application');
    }
    sendTaskMessage(msg) {
        this.sendPostClientHandshakeMessage(msg, 'task');
    }
    sendPostClientHandshakeMessage(msg, name) {
        if (this.state !== 'task') {
            throw new SignalingError(CloseCode.ProtocolError, 'Cannot send ' + name + ' message in "' + this.state + '" state');
        }
        const receiver = this.getPeer();
        if (receiver === null) {
            throw new SignalingError(CloseCode.InternalError, 'No peer address could be found');
        }
        if (this.handoverState.local === true) {
            this.log.debug(this.logTag, 'Sending', name, 'message through dc');
            this.task.sendSignalingMessage(this.msgpackEncode(msg));
        }
        else {
            this.log.debug(this.logTag, 'Sending', name, 'message through ws');
            const packet = this.buildPacket(msg, receiver);
            this.ws.send(packet);
        }
    }
    encryptForPeer(data, nonce) {
        const peer = this.getPeer();
        if (!peer) {
            throw new Error('Remote peer has not yet been established');
        }
        const sessionSharedKey = peer.sessionSharedKey;
        if (!sessionSharedKey) {
            throw new Error('Session key not yet established');
        }
        return sessionSharedKey.encrypt(data, nonce);
    }
    decryptFromPeer(box) {
        const peer = this.getPeer();
        if (!peer) {
            throw new Error('Remote peer has not yet been established');
        }
        const sessionSharedKey = peer.sessionSharedKey;
        if (!sessionSharedKey) {
            throw new Error('Session key not yet established');
        }
        try {
            return sessionSharedKey.decrypt(box);
        }
        catch (e) {
            if (e.name === 'CryptoError' && e.code === 'decryption-failed') {
                if (this.state === 'task') {
                    this.sendClose(CloseCode.InternalError);
                }
                this.resetConnection(CloseCode.InternalError);
                throw new SignalingError(CloseCode.InternalError, 'Decryption of peer message failed. This should not happen.');
            }
            else {
                throw e;
            }
        }
    }
}
Signaling.SALTYRTC_SUBPROTOCOL = 'v1.saltyrtc.org';
Signaling.SALTYRTC_ADDR_UNKNOWN = 0x00;
Signaling.SALTYRTC_ADDR_SERVER = 0x00;
Signaling.SALTYRTC_ADDR_INITIATOR = 0x01;

class InitiatorSignaling extends Signaling {
    constructor(client, host, port, serverKey, tasks, pingInterval, permanentKey, responderTrustedKey) {
        super(client, host, port, serverKey, tasks, pingInterval, permanentKey, responderTrustedKey);
        this.logTag = '[SaltyRTC.Initiator]';
        this.responderCounter = 0;
        this.responders = null;
        this.responder = null;
        this.role = 'initiator';
        if (responderTrustedKey === undefined) {
            this.authToken = new AuthToken(undefined, this.log);
        }
    }
    getWebsocketPath() {
        return this.permanentKey.publicKeyHex;
    }
    encryptHandshakeDataForPeer(receiver, messageType, payload, nonceBytes) {
        if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR) {
            throw new ProtocolError('Initiator cannot encrypt messages for initiator');
        }
        else if (!isResponderId(receiver)) {
            throw new ProtocolError('Bad receiver byte: ' + receiver);
        }
        let responder;
        if (this.getState() === 'task') {
            responder = this.responder;
        }
        else if (this.responders.has(receiver)) {
            responder = this.responders.get(receiver);
        }
        else {
            throw new ProtocolError('Unknown responder: ' + receiver);
        }
        switch (messageType) {
            case 'key':
                return responder.permanentSharedKey.encrypt(payload, nonceBytes);
            default:
                return responder.sessionSharedKey.encrypt(payload, nonceBytes);
        }
    }
    getPeer() {
        if (this.responder !== null) {
            return this.responder;
        }
        return null;
    }
    getPeerWithId(id) {
        if (id === Signaling.SALTYRTC_ADDR_SERVER) {
            return this.server;
        }
        else if (isResponderId(id)) {
            if (this.state === 'task' && this.responder !== null && this.responder.id === id) {
                return this.responder;
            }
            else if (this.responders.has(id)) {
                return this.responders.get(id);
            }
            return null;
        }
        else {
            throw new ProtocolError('Invalid peer id: ' + id);
        }
    }
    handlePeerHandshakeSignalingError(e, source) {
        if (source !== null) {
            this.dropResponder(source, e.closeCode);
        }
    }
    processNewResponder(responderId) {
        if (this.responders.has(responderId)) {
            this.log.warn(this.logTag, 'Previous responder discarded (server ' +
                `should have sent 'disconnected' message): ${responderId}`);
            this.responders.delete(responderId);
        }
        const responder = new Responder(responderId, this.responderCounter++);
        if (this.peerTrustedKey !== null) {
            responder.handshakeState = 'token-received';
            responder.setPermanentSharedKey(this.peerTrustedKey, this.permanentKey);
        }
        this.responders.set(responderId, responder);
        if (this.responders.size > 252) {
            this.dropOldestInactiveResponder();
        }
        this.client.emit({ type: 'new-responder', data: responderId });
    }
    dropOldestInactiveResponder() {
        this.log.warn(this.logTag, 'Dropping oldest inactive responder');
        let drop = null;
        for (const r of this.responders.values()) {
            if (r.handshakeState === 'new') {
                if (drop === null) {
                    drop = r;
                }
                else if (r.counter < drop.counter) {
                    drop = r;
                }
            }
        }
        if (drop !== null) {
            this.dropResponder(drop.id, CloseCode.DroppedByInitiator);
        }
    }
    onPeerHandshakeMessage(box, nonce) {
        if (nonce.destination !== this.address) {
            throw new ProtocolError('Message destination does not match our address');
        }
        let payload;
        if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
            try {
                payload = this.server.sessionSharedKey.decrypt(box);
            }
            catch (e) {
                if (e.name === 'CryptoError' && e.code === 'decryption-failed') {
                    throw new SignalingError(CloseCode.ProtocolError, 'Could not decrypt server message.');
                }
                else {
                    throw e;
                }
            }
            const msg = this.decodeMessage(payload, 'server');
            switch (msg.type) {
                case 'new-responder':
                    this.log.debug(this.logTag, 'Received new-responder message', byteToHex(msg.id));
                    this.handleNewResponder(msg);
                    break;
                case 'send-error':
                    this.log.debug(this.logTag, 'Received send-error message');
                    this.handleSendError(msg);
                    break;
                case 'disconnected':
                    this.log.debug(this.logTag, 'Received disconnected message');
                    this.handleDisconnected(msg);
                    break;
                default:
                    throw new ProtocolError('Received unexpected server message: ' + msg.type);
            }
        }
        else if (isResponderId(nonce.source)) {
            const responder = this.responders.get(nonce.source);
            if (responder === null) {
                throw new ProtocolError('Unknown message source: ' + nonce.source);
            }
            let msg;
            switch (responder.handshakeState) {
                case 'new':
                    if (this.peerTrustedKey !== null) {
                        throw new SignalingError(CloseCode.InternalError, 'Handshake state is "new" even though a trusted key is available');
                    }
                    try {
                        payload = this.authToken.decrypt(box);
                    }
                    catch (e) {
                        this.log.warn(this.logTag, 'Could not decrypt token message: ', e);
                        this.dropResponder(responder.id, CloseCode.InitiatorCouldNotDecrypt);
                        return;
                    }
                    msg = this.decodeMessage(payload, 'token', true);
                    this.log.debug(this.logTag, 'Received token');
                    this.handleToken(msg, responder);
                    break;
                case 'token-received':
                    if (this.peerTrustedKey !== null) {
                        try {
                            payload = this.permanentKey.decrypt(box, this.peerTrustedKey);
                        }
                        catch (e) {
                            this.log.warn(this.logTag, 'Could not decrypt key message');
                            this.dropResponder(responder.id, CloseCode.InitiatorCouldNotDecrypt);
                            return;
                        }
                    }
                    else {
                        payload = responder.permanentSharedKey.decrypt(box);
                    }
                    msg = this.decodeMessage(payload, 'key', true);
                    this.log.debug(this.logTag, 'Received key');
                    this.handleKey(msg, responder);
                    this.sendKey(responder);
                    break;
                case 'key-sent':
                    try {
                        payload = responder.sessionSharedKey.decrypt(box);
                    }
                    catch (e) {
                        if (e.name === 'CryptoError' && e.code === 'decryption-failed') {
                            throw new SignalingError(CloseCode.ProtocolError, 'Could not decrypt auth message.');
                        }
                        else {
                            throw e;
                        }
                    }
                    msg = this.decodeMessage(payload, 'auth', true);
                    this.log.debug(this.logTag, 'Received auth');
                    this.handleAuth(msg, responder, nonce);
                    this.sendAuth(responder, nonce);
                    this.responder = this.responders.get(responder.id);
                    this.responders.delete(responder.id);
                    this.dropResponders(CloseCode.DroppedByInitiator);
                    this.setState('task');
                    this.log.info(this.logTag, 'Peer handshake done');
                    this.task.onPeerHandshakeDone();
                    break;
                default:
                    throw new SignalingError(CloseCode.InternalError, 'Unknown responder handshake state');
            }
        }
        else {
            throw new SignalingError(CloseCode.InternalError, 'Message source is neither the server nor a responder');
        }
    }
    onUnhandledSignalingServerMessage(msg) {
        if (msg.type === 'new-responder') {
            this.log.debug(this.logTag, 'Received new-responder message');
            this.handleNewResponder(msg);
        }
        else {
            this.log.warn(this.logTag, 'Unexpected server message type:', msg.type);
        }
    }
    sendClientHello() {
    }
    handleServerAuth(msg, nonce) {
        this.address = Signaling.SALTYRTC_ADDR_INITIATOR;
        this.validateRepeatedCookie(this.server, new Uint8Array(msg.your_cookie));
        if (this.serverPublicKey != null) {
            try {
                this.validateSignedKeys(new Uint8Array(msg.signed_keys), nonce, this.serverPublicKey);
            }
            catch (e) {
                if (e.name === 'ValidationError') {
                    throw new ProtocolError('Verification of signed_keys failed: ' + e.message);
                }
                throw e;
            }
        }
        else if (msg.signed_keys !== null && msg.signed_keys !== undefined) {
            this.log.warn(this.logTag, "Server sent signed keys, but we're not verifying them.");
        }
        this.responders = new Map();
        for (const id of msg.responders) {
            if (!isResponderId(id)) {
                throw new ProtocolError('Responder id ' + id + ' must be in the range 0x02-0xff');
            }
            this.processNewResponder(id);
        }
        this.log.debug(this.logTag, this.responders.size, 'responders connected');
        this.server.handshakeState = 'done';
    }
    initPeerHandshake() {
    }
    handleNewResponder(msg) {
        if (!isResponderId(msg.id)) {
            throw new ProtocolError('Responder id ' + msg.id + ' must be in the range 0x02-0xff');
        }
        if (this.state === 'peer-handshake') {
            this.processNewResponder(msg.id);
        }
        else {
            this.log.debug(this.logTag, `Dropping responder ${msg.id} in '${this.state}' state`);
            this.dropResponder(msg.id, CloseCode.DroppedByInitiator);
        }
    }
    handleToken(msg, responder) {
        responder.setPermanentSharedKey(new Uint8Array(msg.key), this.permanentKey);
        responder.handshakeState = 'token-received';
    }
    handleKey(msg, responder) {
        responder.setLocalSessionKey(new KeyStore(undefined, this.log));
        responder.setSessionSharedKey(new Uint8Array(msg.key));
        responder.handshakeState = 'key-received';
    }
    sendKey(responder) {
        const message = {
            type: 'key',
            key: arrayToBuffer(responder.localSessionKey.publicKeyBytes),
        };
        const packet = this.buildPacket(message, responder);
        this.log.debug(this.logTag, 'Sending key');
        this.ws.send(packet);
        responder.handshakeState = 'key-sent';
    }
    sendAuth(responder, nonce) {
        if (nonce.cookie.equals(responder.cookiePair.ours)) {
            throw new ProtocolError('Their cookie and our cookie are the same.');
        }
        const taskData = {};
        taskData[this.task.getName()] = this.task.getData();
        const message = {
            type: 'auth',
            your_cookie: arrayToBuffer(nonce.cookie.bytes),
            task: this.task.getName(),
            data: taskData,
        };
        const packet = this.buildPacket(message, responder);
        this.log.debug(this.logTag, 'Sending auth');
        this.ws.send(packet);
        responder.handshakeState = 'auth-sent';
    }
    handleAuth(msg, responder, nonce) {
        this.validateRepeatedCookie(responder, new Uint8Array(msg.your_cookie));
        try {
            InitiatorSignaling.validateTaskInfo(msg.tasks, msg.data);
        }
        catch (e) {
            if (e.name === 'ValidationError') {
                throw new ProtocolError('Peer sent invalid task info: ' + e.message);
            }
            throw e;
        }
        const task = InitiatorSignaling.chooseCommonTask(this.tasks, msg.tasks);
        if (task === null) {
            const requested = this.tasks.map((t) => t.getName());
            const offered = msg.tasks;
            this.log.debug(this.logTag, 'We requested:', requested, 'Peer offered:', offered);
            this.client.emit({ type: 'no-shared-task', data: { requested: requested, offered: offered } });
            throw new SignalingError(CloseCode.NoSharedTask, 'No shared task could be found');
        }
        else {
            this.log.debug(this.logTag, 'Task', task.getName(), 'has been selected');
        }
        this.initTask(task, msg.data[task.getName()]);
        this.log.debug(this.logTag, 'Responder', responder.hexId, 'authenticated');
        responder.cookiePair.theirs = nonce.cookie;
        responder.handshakeState = 'auth-received';
    }
    static validateTaskInfo(names, data) {
        if (names.length < 1) {
            throw new ValidationError('Task names must not be empty');
        }
        if (Object.keys(data).length < 1) {
            throw new ValidationError('Task data must not be empty');
        }
        if (names.length !== Object.keys(data).length) {
            throw new ValidationError('Task data must contain an entry for every task');
        }
        for (const task of names) {
            if (!data.hasOwnProperty(task)) {
                throw new ValidationError('Task data must contain an entry for every task');
            }
        }
    }
    static chooseCommonTask(ourTasks, theirTasks) {
        for (const task of ourTasks) {
            if (theirTasks.indexOf(task.getName()) !== -1) {
                return task;
            }
        }
        return null;
    }
    _handleSendError(receiver) {
        if (!isResponderId(receiver)) {
            throw new ProtocolError('Outgoing c2c messages must have been sent to a responder');
        }
        let notify = false;
        if (this.responder === null) {
            const responder = this.responders.get(receiver);
            if (responder === null || responder === undefined) {
                this.log.warn(this.logTag, 'Got send-error message for unknown responder', receiver);
            }
            else {
                notify = true;
                this.responders.delete(receiver);
            }
        }
        else {
            if (this.responder.id === receiver) {
                notify = true;
                this.resetConnection(CloseCode.ProtocolError);
            }
            else {
                this.log.warn(this.logTag, 'Got send-error message for unknown responder', receiver);
            }
        }
        if (notify === true) {
            this.client.emit({ type: 'signaling-connection-lost', data: receiver });
        }
    }
    dropResponders(reason) {
        this.log.debug(this.logTag, 'Dropping', this.responders.size, 'other responders.');
        for (const id of this.responders.keys()) {
            this.dropResponder(id, reason);
        }
    }
    dropResponder(responderId, reason) {
        const message = {
            type: 'drop-responder',
            id: responderId,
            reason: reason,
        };
        const packet = this.buildPacket(message, this.server);
        this.log.debug(this.logTag, 'Sending drop-responder', byteToHex(responderId));
        this.ws.send(packet);
        this.responders.delete(responderId);
    }
}

class ResponderSignaling extends Signaling {
    constructor(client, host, port, serverKey, tasks, pingInterval, permanentKey, initiatorPubKey, authToken) {
        super(client, host, port, serverKey, tasks, pingInterval, permanentKey, authToken === undefined ? initiatorPubKey : undefined);
        this.logTag = '[SaltyRTC.Responder]';
        this.initiator = null;
        this.role = 'responder';
        this.initiator = new Initiator(initiatorPubKey, this.permanentKey);
        if (authToken !== undefined) {
            this.authToken = authToken;
        }
        else {
            this.initiator.handshakeState = 'token-sent';
        }
    }
    getWebsocketPath() {
        return this.initiator.permanentSharedKey.remotePublicKeyHex;
    }
    encryptHandshakeDataForPeer(receiver, messageType, payload, nonceBytes) {
        if (isResponderId(receiver)) {
            throw new ProtocolError('Responder may not encrypt messages for other responders: ' + receiver);
        }
        else if (receiver !== Signaling.SALTYRTC_ADDR_INITIATOR) {
            throw new ProtocolError('Bad receiver byte: ' + receiver);
        }
        switch (messageType) {
            case 'token':
                return this.authToken.encrypt(payload, nonceBytes);
            case 'key':
                return this.initiator.permanentSharedKey.encrypt(payload, nonceBytes);
            default:
                const sessionSharedKey = this.getPeer().sessionSharedKey;
                if (sessionSharedKey === null) {
                    throw new ProtocolError('Trying to encrypt for peer using session key, but session key is null');
                }
                return sessionSharedKey.encrypt(payload, nonceBytes);
        }
    }
    getPeer() {
        if (this.initiator !== null) {
            return this.initiator;
        }
        return null;
    }
    getPeerWithId(id) {
        if (id === Signaling.SALTYRTC_ADDR_SERVER) {
            return this.server;
        }
        else if (id === Signaling.SALTYRTC_ADDR_INITIATOR) {
            return this.initiator;
        }
        else {
            throw new ProtocolError('Invalid peer id: ' + id);
        }
    }
    handlePeerHandshakeSignalingError(e, source) {
        this.resetConnection(e.closeCode);
    }
    onPeerHandshakeMessage(box, nonce) {
        if (nonce.destination !== this.address) {
            throw new ProtocolError('Message destination does not match our address');
        }
        let payload;
        if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
            try {
                payload = this.server.sessionSharedKey.decrypt(box);
            }
            catch (e) {
                if (e.name === 'CryptoError' && e.code === 'decryption-failed') {
                    throw new SignalingError(CloseCode.ProtocolError, 'Could not decrypt server message.');
                }
                else {
                    throw e;
                }
            }
            const msg = this.decodeMessage(payload, 'server');
            switch (msg.type) {
                case 'new-initiator':
                    this.log.debug(this.logTag, 'Received new-initiator message');
                    this.handleNewInitiator();
                    break;
                case 'send-error':
                    this.log.debug(this.logTag, 'Received send-error message');
                    this.handleSendError(msg);
                    break;
                case 'disconnected':
                    this.log.debug(this.logTag, 'Received disconnected message');
                    this.handleDisconnected(msg);
                    break;
                default:
                    throw new ProtocolError('Received unexpected server message: ' + msg.type);
            }
        }
        else if (nonce.source === Signaling.SALTYRTC_ADDR_INITIATOR) {
            payload = this.decryptInitiatorMessage(box);
            let msg;
            switch (this.initiator.handshakeState) {
                case 'new':
                    throw new ProtocolError('Unexpected peer handshake message');
                case 'key-sent':
                    msg = this.decodeMessage(payload, 'key', true);
                    this.log.debug(this.logTag, 'Received key');
                    this.handleKey(msg);
                    this.sendAuth(nonce);
                    break;
                case 'auth-sent':
                    msg = this.decodeMessage(payload, 'auth', true);
                    this.log.debug(this.logTag, 'Received auth');
                    this.handleAuth(msg, nonce);
                    this.setState('task');
                    this.log.info(this.logTag, 'Peer handshake done');
                    break;
                default:
                    throw new SignalingError(CloseCode.InternalError, 'Unknown initiator handshake state');
            }
        }
        else {
            throw new SignalingError(CloseCode.InternalError, 'Message source is neither the server nor the initiator');
        }
    }
    decryptInitiatorMessage(box) {
        switch (this.initiator.handshakeState) {
            case 'new':
            case 'token-sent':
            case 'key-received':
                throw new ProtocolError('Received message in ' + this.initiator.handshakeState + ' state.');
            case 'key-sent':
                try {
                    return this.initiator.permanentSharedKey.decrypt(box);
                }
                catch (e) {
                    if (e.name === 'CryptoError' && e.code === 'decryption-failed') {
                        throw new SignalingError(CloseCode.ProtocolError, 'Could not decrypt key message.');
                    }
                    else {
                        throw e;
                    }
                }
            case 'auth-sent':
            case 'auth-received':
                try {
                    return this.initiator.sessionSharedKey.decrypt(box);
                }
                catch (e) {
                    if (e.name === 'CryptoError' && e.code === 'decryption-failed') {
                        throw new SignalingError(CloseCode.ProtocolError, 'Could not decrypt initiator session message.');
                    }
                    else {
                        throw e;
                    }
                }
            default:
                throw new ProtocolError('Invalid handshake state: ' + this.initiator.handshakeState);
        }
    }
    onUnhandledSignalingServerMessage(msg) {
        if (msg.type === 'new-initiator') {
            this.log.debug(this.logTag, 'Received new-initiator message after peer handshake completed, ' +
                'closing');
            this.resetConnection(CloseCode.ClosingNormal);
        }
        else {
            this.log.warn(this.logTag, 'Unexpected server message type:', msg.type);
        }
    }
    sendClientHello() {
        const message = {
            type: 'client-hello',
            key: arrayToBuffer(this.permanentKey.publicKeyBytes),
        };
        const packet = this.buildPacket(message, this.server, false);
        this.log.debug(this.logTag, 'Sending client-hello');
        this.ws.send(packet);
        this.server.handshakeState = 'hello-sent';
    }
    handleServerAuth(msg, nonce) {
        if (nonce.destination > 0xff || nonce.destination < 0x02) {
            this.log.error(this.logTag, 'Invalid nonce destination:', nonce.destination);
            throw new ValidationError('Invalid nonce destination: ' + nonce.destination);
        }
        this.address = nonce.destination;
        this.log.debug(this.logTag, 'Server assigned address', byteToHex(this.address));
        this.logTag = '[SaltyRTC.Responder.' + byteToHex(this.address) + ']';
        this.validateRepeatedCookie(this.server, new Uint8Array(msg.your_cookie));
        if (this.serverPublicKey != null) {
            try {
                this.validateSignedKeys(new Uint8Array(msg.signed_keys), nonce, this.serverPublicKey);
            }
            catch (e) {
                if (e.name === 'ValidationError') {
                    throw new ProtocolError('Verification of signed_keys failed: ' + e.message);
                }
                throw e;
            }
        }
        else if (msg.signed_keys !== null && msg.signed_keys !== undefined) {
            this.log.warn(this.logTag, "Server sent signed keys, but we're not verifying them.");
        }
        this.initiator.connected = msg.initiator_connected;
        this.log.debug(this.logTag, 'Initiator', this.initiator.connected ? '' : 'not', 'connected');
        this.server.handshakeState = 'done';
    }
    handleNewInitiator() {
        this.initiator = new Initiator(this.initiator.permanentSharedKey.remotePublicKeyBytes, this.permanentKey);
        this.initiator.connected = true;
        this.initPeerHandshake();
    }
    initPeerHandshake() {
        if (this.initiator.connected) {
            if (this.peerTrustedKey === null) {
                this.sendToken();
            }
            this.sendKey();
        }
    }
    sendToken() {
        const message = {
            type: 'token',
            key: arrayToBuffer(this.permanentKey.publicKeyBytes),
        };
        const packet = this.buildPacket(message, this.initiator);
        this.log.debug(this.logTag, 'Sending token');
        this.ws.send(packet);
        this.initiator.handshakeState = 'token-sent';
    }
    sendKey() {
        this.initiator.setLocalSessionKey(new KeyStore(undefined, this.log));
        const replyMessage = {
            type: 'key',
            key: arrayToBuffer(this.initiator.localSessionKey.publicKeyBytes),
        };
        const packet = this.buildPacket(replyMessage, this.initiator);
        this.log.debug(this.logTag, 'Sending key');
        this.ws.send(packet);
        this.initiator.handshakeState = 'key-sent';
    }
    handleKey(msg) {
        this.initiator.setSessionSharedKey(new Uint8Array(msg.key));
        this.initiator.handshakeState = 'key-received';
    }
    sendAuth(nonce) {
        if (nonce.cookie.equals(this.initiator.cookiePair.ours)) {
            throw new ProtocolError('Their cookie and our cookie are the same.');
        }
        const taskData = {};
        for (const task of this.tasks) {
            taskData[task.getName()] = task.getData();
        }
        const taskNames = this.tasks.map((task) => task.getName());
        const message = {
            type: 'auth',
            your_cookie: arrayToBuffer(nonce.cookie.bytes),
            tasks: taskNames,
            data: taskData,
        };
        const packet = this.buildPacket(message, this.initiator);
        this.log.debug(this.logTag, 'Sending auth');
        this.ws.send(packet);
        this.initiator.handshakeState = 'auth-sent';
    }
    handleAuth(msg, nonce) {
        this.validateRepeatedCookie(this.initiator, new Uint8Array(msg.your_cookie));
        try {
            ResponderSignaling.validateTaskInfo(msg.task, msg.data);
        }
        catch (e) {
            if (e.name === 'ValidationError') {
                throw new ProtocolError('Peer sent invalid task info: ' + e.message);
            }
            throw e;
        }
        let selectedTask = null;
        for (const task of this.tasks) {
            if (task.getName() === msg.task) {
                selectedTask = task;
                this.log.info(this.logTag, 'Task', msg.task, 'has been selected');
                break;
            }
        }
        if (selectedTask === null) {
            throw new SignalingError(CloseCode.ProtocolError, 'Initiator selected unknown task');
        }
        else {
            this.initTask(selectedTask, msg.data[selectedTask.getName()]);
        }
        this.log.debug(this.logTag, 'Initiator authenticated');
        this.initiator.cookiePair.theirs = nonce.cookie;
        this.initiator.handshakeState = 'auth-received';
    }
    static validateTaskInfo(name, data) {
        if (name.length === 0) {
            throw new ValidationError('Task name must not be empty');
        }
        if (Object.keys(data).length < 1) {
            throw new ValidationError('Task data must not be empty');
        }
        if (Object.keys(data).length > 1) {
            throw new ValidationError('Task data must contain exactly 1 key');
        }
        if (!data.hasOwnProperty(name)) {
            throw new ValidationError('Task data must contain an entry for the chosen task');
        }
    }
    _handleSendError(receiver) {
        if (receiver !== Signaling.SALTYRTC_ADDR_INITIATOR) {
            throw new ProtocolError('Outgoing c2c messages must have been sent to the initiator');
        }
        this.client.emit({ type: 'signaling-connection-lost', data: receiver });
        this.resetConnection(CloseCode.ProtocolError);
    }
}

class SaltyRTCBuilder {
    constructor() {
        this.hasConnectionInfo = false;
        this.hasKeyStore = false;
        this.hasInitiatorInfo = false;
        this.hasTrustedPeerKey = false;
        this.hasTasks = false;
        this.serverInfoFactory = null;
        this.pingInterval = 0;
        this.logLevel = 'none';
    }
    static validateHost(host) {
        if (host.endsWith('/')) {
            throw new Error('SaltyRTC host may not end with a slash');
        }
        if (host.indexOf('//') !== -1) {
            throw new Error('SaltyRTC host should not contain protocol');
        }
    }
    requireKeyStore() {
        if (!this.hasKeyStore) {
            throw new Error('Keys not set yet. Please call .withKeyStore method first.');
        }
    }
    requireConnectionInfo() {
        if (!this.hasConnectionInfo) {
            throw new Error('Connection info not set yet. Please call .connectTo method first.');
        }
    }
    requireTasks() {
        if (!this.hasTasks) {
            throw new Error('Tasks not set yet. Please call .usingTasks method first.');
        }
    }
    requireInitiatorInfo() {
        if (!this.hasInitiatorInfo) {
            throw new Error('Initiator info not set yet. Please call .initiatorInfo method first.');
        }
    }
    connectTo(host, port = 8765) {
        SaltyRTCBuilder.validateHost(host);
        this.host = host;
        this.port = port;
        this.hasConnectionInfo = true;
        return this;
    }
    connectWith(serverInfoFactory) {
        this.serverInfoFactory = serverInfoFactory;
        this.hasConnectionInfo = true;
        return this;
    }
    withKeyStore(keyStore) {
        this.keyStore = keyStore;
        this.hasKeyStore = true;
        return this;
    }
    withTrustedPeerKey(peerTrustedKey) {
        this.peerTrustedKey = validateKey(peerTrustedKey, 'SaltyRTC peer key');
        this.hasTrustedPeerKey = true;
        return this;
    }
    usingTasks(tasks) {
        if (tasks.length < 1) {
            throw new Error('You must specify at least 1 task');
        }
        this.tasks = tasks;
        this.hasTasks = true;
        return this;
    }
    withPingInterval(interval) {
        if (interval < 0) {
            throw new Error('Ping interval may not be negative');
        }
        this.pingInterval = interval;
        return this;
    }
    withServerKey(serverKey) {
        this.serverPublicKey = validateKey(serverKey, 'SaltyRTC server public key');
        return this;
    }
    withLoggingLevel(level) {
        this.logLevel = level;
        return this;
    }
    initiatorInfo(initiatorPublicKey, authToken) {
        this.initiatorPublicKey = validateKey(initiatorPublicKey, 'SaltyRTC initiator public key');
        this.authToken = validateKey(authToken, 'SaltyRTC auth token');
        this.hasInitiatorInfo = true;
        return this;
    }
    processServerInfo(factory, publicKey) {
        const publicKeyHex = u8aToHex(publicKey);
        const data = factory(publicKeyHex);
        this.host = data.host;
        this.port = data.port;
    }
    asInitiator() {
        this.requireConnectionInfo();
        this.requireKeyStore();
        this.requireTasks();
        if (this.hasInitiatorInfo) {
            throw new Error('Cannot initialize as initiator if .initiatorInfo(...) has been used');
        }
        if (this.serverInfoFactory !== null) {
            this.processServerInfo(this.serverInfoFactory, this.keyStore.publicKeyBytes);
        }
        if (this.hasTrustedPeerKey) {
            return new SaltyRTC(new Log(this.logLevel), this.keyStore, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval, this.peerTrustedKey).asInitiator();
        }
        else {
            return new SaltyRTC(new Log(this.logLevel), this.keyStore, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval).asInitiator();
        }
    }
    asResponder() {
        this.requireConnectionInfo();
        this.requireKeyStore();
        this.requireTasks();
        if (this.hasTrustedPeerKey) {
            if (this.serverInfoFactory !== null) {
                this.processServerInfo(this.serverInfoFactory, this.peerTrustedKey);
            }
            return new SaltyRTC(new Log(this.logLevel), this.keyStore, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval, this.peerTrustedKey).asResponder();
        }
        else {
            this.requireInitiatorInfo();
            if (this.serverInfoFactory !== null) {
                this.processServerInfo(this.serverInfoFactory, this.initiatorPublicKey);
            }
            return new SaltyRTC(new Log(this.logLevel), this.keyStore, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval).asResponder(this.initiatorPublicKey, this.authToken);
        }
    }
}
class SaltyRTC {
    constructor(log, permanentKey, host, port, serverKey, tasks, pingInterval, peerTrustedKey) {
        this.peerTrustedKey = null;
        this._signaling = null;
        this.logTag = '[SaltyRTC.Client]';
        if (permanentKey === undefined) {
            throw new Error('SaltyRTC must be initialized with a permanent key');
        }
        if (host === undefined) {
            throw new Error('SaltyRTC must be initialized with a target host');
        }
        if (tasks === undefined || tasks.length === 0) {
            throw new Error('SaltyRTC must be initialized with at least 1 task');
        }
        this.log = log;
        this.host = host;
        this.port = port;
        this.permanentKey = permanentKey;
        this.tasks = tasks;
        this.pingInterval = pingInterval;
        if (peerTrustedKey !== undefined) {
            this.peerTrustedKey = peerTrustedKey;
        }
        if (serverKey !== undefined) {
            this.serverPublicKey = serverKey;
        }
        this.eventRegistry = new EventRegistry();
    }
    asInitiator() {
        if (this.peerTrustedKey !== null) {
            this._signaling = new InitiatorSignaling(this, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval, this.permanentKey, this.peerTrustedKey);
        }
        else {
            this._signaling = new InitiatorSignaling(this, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval, this.permanentKey);
        }
        return this;
    }
    asResponder(initiatorPubKey, authToken) {
        if (this.peerTrustedKey !== null) {
            this._signaling = new ResponderSignaling(this, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval, this.permanentKey, this.peerTrustedKey);
        }
        else {
            const token = new AuthToken(authToken, this.log);
            this._signaling = new ResponderSignaling(this, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval, this.permanentKey, initiatorPubKey, token);
        }
        return this;
    }
    get signaling() {
        if (this._signaling === null) {
            throw Error('SaltyRTC instance not initialized. Use .asInitiator() or .asResponder().');
        }
        return this._signaling;
    }
    get state() {
        return this.signaling.getState();
    }
    get keyStore() {
        return this.permanentKey;
    }
    get permanentKeyBytes() {
        return this.signaling.permanentKeyBytes;
    }
    get permanentKeyHex() {
        return u8aToHex(this.signaling.permanentKeyBytes);
    }
    get authTokenBytes() {
        return this.signaling.authTokenBytes;
    }
    get authTokenHex() {
        if (this.signaling.authTokenBytes) {
            return u8aToHex(this.signaling.authTokenBytes);
        }
        return null;
    }
    get peerPermanentKeyBytes() {
        return this.signaling.peerPermanentKeyBytes;
    }
    get peerPermanentKeyHex() {
        return u8aToHex(this.signaling.peerPermanentKeyBytes);
    }
    getTask() {
        return this.signaling.task;
    }
    getCurrentPeerCsn() {
        return this.signaling.getCurrentPeerCsn();
    }
    encryptForPeer(data, nonce) {
        return this.signaling.encryptForPeer(data, nonce);
    }
    decryptFromPeer(box) {
        return this.signaling.decryptFromPeer(box);
    }
    connect() {
        this.signaling.connect();
    }
    disconnect(unbind = false) {
        this.signaling.disconnect(unbind);
    }
    on(event, handler) {
        this.eventRegistry.register(event, handler);
    }
    once(event, handler) {
        const onceHandler = (ev) => {
            try {
                handler(ev);
            }
            catch (e) {
                this.off(ev.type, onceHandler);
                throw e;
            }
            this.off(ev.type, onceHandler);
        };
        this.eventRegistry.register(event, onceHandler);
    }
    off(event, handler) {
        if (event === undefined) {
            this.eventRegistry.unregisterAll();
        }
        else {
            this.eventRegistry.unregister(event, handler);
        }
    }
    emit(event) {
        this.log.debug(this.logTag, 'New event:', event.type);
        const handlers = this.eventRegistry.get(event.type);
        for (const handler of handlers) {
            try {
                this.callHandler(handler, event);
            }
            catch (e) {
                this.log.error(this.logTag, 'Unhandled exception in', event.type, 'handler:', e);
            }
        }
    }
    sendApplicationMessage(data) {
        this.signaling.sendApplication({
            type: 'application',
            data: data,
        });
    }
    callHandler(handler, event) {
        const response = handler(event);
        if (response === false) {
            this.eventRegistry.unregister(event.type, handler);
        }
    }
}

export { Box, CloseCode, CombinedSequence, CombinedSequencePair, ConnectionError, Cookie, CookiePair, EventRegistry, KeyStore, Log, SaltyRTCBuilder, SignalingError, exceptions, explainCloseCode };
