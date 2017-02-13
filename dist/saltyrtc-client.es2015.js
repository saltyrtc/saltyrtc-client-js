/**
 * saltyrtc-client-js v0.9.1
 * SaltyRTC JavaScript implementation
 * https://github.com/saltyrtc/saltyrtc-client-js
 *
 * Copyright (C) 2016-2017 Threema GmbH
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

import { createCodec, decode, encode } from 'msgpack-lite';
import * as msgpack from 'msgpack-lite';

var CloseCode;
(function (CloseCode) {
    CloseCode[CloseCode["ClosingNormal"] = 1000] = "ClosingNormal";
    CloseCode[CloseCode["GoingAway"] = 1001] = "GoingAway";
    CloseCode[CloseCode["NoSharedSubprotocol"] = 1002] = "NoSharedSubprotocol";
    CloseCode[CloseCode["PathFull"] = 3000] = "PathFull";
    CloseCode[CloseCode["ProtocolError"] = 3001] = "ProtocolError";
    CloseCode[CloseCode["InternalError"] = 3002] = "InternalError";
    CloseCode[CloseCode["Handover"] = 3003] = "Handover";
    CloseCode[CloseCode["DroppedByInitiator"] = 3004] = "DroppedByInitiator";
    CloseCode[CloseCode["InitiatorCouldNotDecrypt"] = 3005] = "InitiatorCouldNotDecrypt";
    CloseCode[CloseCode["NoSharedTask"] = 3006] = "NoSharedTask";
    CloseCode[CloseCode["InvalidKey"] = 3007] = "InvalidKey";
})(CloseCode || (CloseCode = {}));
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
        default:
            return 'Unknown';
    }
}

function InternalError(message) {
    this.message = message;
    if ('captureStackTrace' in Error) {
        Error.captureStackTrace(this, InternalError);
    }
    else {
        this.stack = new Error().stack;
    }
}
InternalError.prototype = Object.create(Error.prototype);
InternalError.prototype.name = 'InternalError';
InternalError.prototype.constructor = InternalError;
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
    constructor(message) {
        super(message);
        this.message = message;
        this.name = 'ValidationError';
    }
}

function u8aToHex(array) {
    const results = [];
    for (let arrayByte of array) {
        results.push(arrayByte.toString(16).replace(/^([\da-f])$/, '0$1'));
    }
    return results.join('');
}
function hexToU8a(hexstring) {
    let array, i, j, k, ref;
    j = 0;
    if (hexstring.length % 2 == 1) {
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
    for (let arr of arrays) {
        totalLength += arr.length;
    }
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (let arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}

function isString(value) {
    return typeof value === 'string' || value instanceof String;
}
function validateKey(key, name = "Key") {
    let out;
    if (isString(key)) {
        out = hexToU8a(key);
    }
    else if (key instanceof Uint8Array) {
        out = key;
    }
    else {
        throw new ValidationError(name + " must be an Uint8Array or a hex string");
    }
    if (out.byteLength != 32) {
        throw new ValidationError(name + " must be 32 bytes long");
    }
    return out;
}
function arraysAreEqual(a1, a2) {
    if (a1.length != a2.length) {
        return false;
    }
    for (let i = 0; i < a1.length; i++) {
        if (a1[i] !== a2[i]) {
            return false;
        }
    }
    return true;
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
            throw 'bad-message-length';
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
    constructor(privateKey) {
        this.logTag = '[SaltyRTC.KeyStore]';
        if (arguments.length > 1) {
            throw new Error('Too many arguments in KeyStore constructor');
        }
        if (privateKey === undefined) {
            this._keyPair = nacl.box.keyPair();
            console.debug(this.logTag, 'New public key:', u8aToHex(this._keyPair.publicKey));
        }
        else {
            this._keyPair = nacl.box.keyPair.fromSecretKey(validateKey(privateKey, "Private key"));
            console.debug(this.logTag, 'Restored public key:', u8aToHex(this._keyPair.publicKey));
        }
    }
    get publicKeyHex() { return u8aToHex(this._keyPair.publicKey); }
    get publicKeyBytes() { return this._keyPair.publicKey; }
    get secretKeyHex() { return u8aToHex(this._keyPair.secretKey); }
    get secretKeyBytes() { return this._keyPair.secretKey; }
    get keypair() {
        return this._keyPair;
    }
    encrypt(bytes, nonce, otherKey) {
        const encrypted = nacl.box(bytes, nonce, otherKey, this._keyPair.secretKey);
        return new Box(nonce, encrypted, nacl.box.nonceLength);
    }
    decrypt(box, otherKey) {
        const data = nacl.box.open(box.data, box.nonce, otherKey, this._keyPair.secretKey);
        if (data === false) {
            throw 'decryption-failed';
        }
        return data;
    }
}
class AuthToken {
    constructor(bytes) {
        this._authToken = null;
        this.logTag = '[SaltyRTC.AuthToken]';
        if (typeof bytes === 'undefined') {
            this._authToken = nacl.randomBytes(nacl.secretbox.keyLength);
            console.debug(this.logTag, 'Generated auth token');
        }
        else {
            if (bytes.byteLength != nacl.secretbox.keyLength) {
                console.error(this.logTag, 'Auth token must be', nacl.secretbox.keyLength, 'bytes long.');
                throw 'bad-token-length';
            }
            this._authToken = bytes;
            console.debug(this.logTag, 'Initialized auth token');
        }
    }
    get keyBytes() { return this._authToken; }
    get keyHex() { return u8aToHex(this._authToken); }
    encrypt(bytes, nonce) {
        const encrypted = nacl.secretbox(bytes, nonce, this._authToken);
        return new Box(nonce, encrypted, nacl.secretbox.nonceLength);
    }
    decrypt(box) {
        const data = nacl.secretbox.open(box.data, box.nonce, this._authToken);
        if (data === false) {
            throw 'decryption-failed';
        }
        return data;
    }
}

class Cookie {
    constructor(bytes) {
        if (typeof bytes !== 'undefined') {
            if (bytes.length !== 16) {
                throw 'bad-cookie-length';
            }
            this.bytes = bytes;
        }
        else {
            this.bytes = nacl.randomBytes(Cookie.COOKIE_LENGTH);
        }
    }
    static fromArrayBuffer(buffer) {
        return new Cookie(new Uint8Array(buffer));
    }
    asArrayBuffer() {
        return this.bytes.buffer.slice(this.bytes.byteOffset, this.bytes.byteLength);
    }
    equals(otherCookie) {
        if (otherCookie.bytes === this.bytes)
            return true;
        if (otherCookie.bytes == null || this.bytes == null)
            return false;
        if (otherCookie.bytes.byteLength != this.bytes.byteLength)
            return false;
        for (let i = 0; i < this.bytes.byteLength; i++) {
            if (otherCookie.bytes[i] != this.bytes[i])
                return false;
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
                throw new ProtocolError("Their cookie matches our cookie");
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
            throw new ProtocolError("Their cookie matches our cookie");
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
    get cookie() { return this._cookie; }
    get overflow() { return this._overflow; }
    get sequenceNumber() { return this._sequenceNumber; }
    get combinedSequenceNumber() { return (this._overflow << 32) + this._sequenceNumber; }
    get source() { return this._source; }
    get destination() { return this._destination; }
    static fromArrayBuffer(packet) {
        if (packet.byteLength != this.TOTAL_LENGTH) {
            throw 'bad-packet-length';
        }
        const view = new DataView(packet);
        const cookie = new Cookie(new Uint8Array(packet, 0, 16));
        const source = view.getUint8(16);
        const destination = view.getUint8(17);
        const overflow = view.getUint16(18);
        const sequenceNumber = view.getUint32(20);
        return new Nonce(cookie, overflow, sequenceNumber, source, destination);
    }
    toArrayBuffer() {
        const buf = new ArrayBuffer(Nonce.TOTAL_LENGTH);
        const uint8view = new Uint8Array(buf);
        uint8view.set(this._cookie.bytes);
        const view = new DataView(buf);
        view.setUint8(16, this._source);
        view.setUint8(17, this._destination);
        view.setUint16(18, this._overflow);
        view.setUint32(20, this._sequenceNumber);
        return buf;
    }
}
Nonce.TOTAL_LENGTH = 24;

function decryptKeystore(box, keyStore, otherKey, msgType) {
    try {
        return keyStore.decrypt(box, otherKey);
    }
    catch (e) {
        if (e === 'decryption-failed') {
            throw new SignalingError(CloseCode.ProtocolError, 'Could not decrypt ' + msgType + ' message.');
        }
        else {
            throw e;
        }
    }
}

function isResponderId(id) {
    return id >= 0x02 && id <= 0xff;
}

class HandoverState {
    constructor() {
        this.reset();
    }
    get local() {
        return this._local;
    }
    get peer() {
        return this._peer;
    }
    set local(state) {
        const wasBoth = this.both;
        this._local = state;
        if (!wasBoth && this.both && this.onBoth !== undefined) {
            this.onBoth();
        }
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

class CombinedSequence {
    constructor() {
        this.logTag = '[SaltyRTC.CSN]';
        this.sequenceNumber = randomUint32();
        this.overflow = 0;
    }
    next() {
        if (this.sequenceNumber + 1 >= CombinedSequence.SEQUENCE_NUMBER_MAX) {
            this.sequenceNumber = 0;
            this.overflow += 1;
            if (this.overflow >= CombinedSequence.OVERFLOW_MAX) {
                console.error(this.logTag, 'Overflow number just overflowed!');
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
}
CombinedSequence.SEQUENCE_NUMBER_MAX = 0x100000000;
CombinedSequence.OVERFLOW_MAX = 0x100000;
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
}
class Initiator extends Peer {
    constructor(permanentKey) {
        super(Initiator.ID);
        this.connected = false;
        this.handshakeState = 'new';
        this.permanentKey = permanentKey;
    }
    get name() {
        return "Initiator";
    }
}
Initiator.ID = 0x01;
class Responder extends Peer {
    constructor(id, counter) {
        super(id);
        this.keyStore = new KeyStore();
        this.handshakeState = 'new';
        this._counter = counter;
    }
    get name() {
        return "Responder " + this.id;
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
        return "Server";
    }
}
Server.ID = 0x00;

class Signaling {
    constructor(client, host, port, serverKey, tasks, pingInterval, permanentKey, peerTrustedKey) {
        this.protocol = 'wss';
        this.ws = null;
        this.msgpackEncodeOptions = {
            codec: createCodec({ binarraybuffer: true }),
        };
        this.msgpackDecodeOptions = {
            codec: createCodec({ binarraybuffer: true }),
        };
        this.state = 'new';
        this.handoverState = new HandoverState();
        this.task = null;
        this.server = new Server();
        this.sessionKey = null;
        this.peerTrustedKey = null;
        this.authToken = null;
        this.serverPublicKey = null;
        this.role = null;
        this.logTag = '[SaltyRTC.Signaling]';
        this.address = Signaling.SALTYRTC_ADDR_UNKNOWN;
        this.onOpen = (ev) => {
            console.info(this.logTag, 'Opened connection');
            this.setState('server-handshake');
        };
        this.onError = (ev) => {
            console.error(this.logTag, 'General WebSocket error', ev);
            this.client.emit({ type: 'connection-error' });
        };
        this.onClose = (ev) => {
            if (ev.code === CloseCode.Handover) {
                console.info(this.logTag, 'Closed WebSocket connection due to handover');
            }
            else {
                console.info(this.logTag, 'Closed WebSocket connection');
                this.setState('closed');
                this.client.emit({ type: 'connection-closed', data: ev.code });
                const log = (reason) => console.error(this.logTag, 'Websocket close reason:', reason);
                switch (ev.code) {
                    case CloseCode.GoingAway:
                        log('Server is being shut down');
                        break;
                    case CloseCode.NoSharedSubprotocol:
                        log('No shared sub-protocol could be found');
                        break;
                    case CloseCode.PathFull:
                        log('Path full (no free responder byte)');
                        break;
                    case CloseCode.ProtocolError:
                        log('Protocol error');
                        break;
                    case CloseCode.InternalError:
                        log('Internal server error');
                        break;
                    case CloseCode.DroppedByInitiator:
                        log('Dropped by initiator');
                        break;
                    case CloseCode.InvalidKey:
                        log('Invalid server key');
                        break;
                }
            }
        };
        this.onMessage = (ev) => {
            console.debug(this.logTag, 'New ws message (' + ev.data.byteLength + ' bytes)');
            if (this.handoverState.peer) {
                console.error(this.logTag, 'Protocol error: Received WebSocket message from peer ' +
                    'even though it has already handed over to task.');
                this.resetConnection(CloseCode.ProtocolError);
                return;
            }
            let nonce;
            try {
                const box = Box.fromUint8Array(new Uint8Array(ev.data), Nonce.TOTAL_LENGTH);
                nonce = Nonce.fromArrayBuffer(box.nonce.buffer);
                try {
                    this.validateNonce(nonce);
                }
                catch (e) {
                    if (e.name === 'ValidationError') {
                        throw new ProtocolError('Invalid nonce: ' + e);
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
                        console.warn(this.logTag, 'Received message in', this.getState(), 'signaling state. Ignoring.');
                }
            }
            catch (e) {
                if (e.name === 'SignalingError' || e.name === 'ProtocolError') {
                    let errmsg = 'Signaling error: ' + explainCloseCode(e.closeCode);
                    if (e.message) {
                        errmsg += ' (' + e.message + ')';
                    }
                    console.error(this.logTag, errmsg);
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
                        case 'closing':
                        case 'closed':
                            break;
                    }
                }
                else if (e.name === 'ConnectionError') {
                    console.warn(this.logTag, 'Connection error. Resetting connection.');
                    this.resetConnection(CloseCode.InternalError);
                }
                else {
                    if (e.hasOwnProperty('stack')) {
                        console.error(this.logTag, 'An unknown error occurred:');
                        console.error(e.stack);
                    }
                    throw e;
                }
            }
        };
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
            this.ws.close(CloseCode.Handover);
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
        return this.getPeerPermanentKey();
    }
    msgpackEncode(data) {
        return encode(data, this.msgpackEncodeOptions);
    }
    msgpackDecode(data) {
        return decode(data, this.msgpackDecodeOptions);
    }
    connect() {
        this.resetConnection();
        this.initWebsocket();
    }
    disconnect() {
        const reason = CloseCode.ClosingNormal;
        this.setState('closing');
        if (this.state === 'task') {
            this.sendClose(reason);
        }
        if (this.ws !== null) {
            console.debug(this.logTag, 'Disconnecting WebSocket');
            this.ws.close(reason);
        }
        this.ws = null;
        if (this.task !== null) {
            console.debug(this.logTag, 'Closing task connections');
            this.task.close(reason);
        }
        this.setState('closed');
    }
    initWebsocket() {
        const url = this.protocol + '://' + this.host + ':' + this.port + '/';
        const path = this.getWebsocketPath();
        this.ws = new WebSocket(url + path, Signaling.SALTYRTC_SUBPROTOCOL);
        this.ws.binaryType = 'arraybuffer';
        this.ws.addEventListener('open', this.onOpen);
        this.ws.addEventListener('error', this.onError);
        this.ws.addEventListener('close', this.onClose);
        this.ws.addEventListener('message', this.onMessage);
        this.setState('ws-connecting');
        console.debug(this.logTag, 'Opening WebSocket connection to', url + path);
    }
    onServerHandshakeMessage(box, nonce) {
        let payload;
        if (this.server.handshakeState === 'new') {
            payload = box.data;
        }
        else {
            payload = this.permanentKey.decrypt(box, this.server.sessionKey);
        }
        const msg = this.decodeMessage(payload, 'server handshake');
        switch (this.server.handshakeState) {
            case 'new':
                if (msg.type !== 'server-hello') {
                    throw new ProtocolError('Expected server-hello message, but got ' + msg.type);
                }
                console.debug(this.logTag, 'Received server-hello');
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
                console.debug(this.logTag, "Received server-auth");
                this.handleServerAuth(msg, nonce);
                break;
            case 'done':
                throw new SignalingError(CloseCode.InternalError, 'Received server handshake message even though server handshake state is set to \'done\'');
            default:
                throw new SignalingError(CloseCode.InternalError, 'Unknown server handshake state: ' + this.server.handshakeState);
        }
        if (this.server.handshakeState === 'done') {
            this.setState('peer-handshake');
            console.debug(this.logTag, 'Server handshake done');
            this.initPeerHandshake();
        }
    }
    onSignalingMessage(box, nonce) {
        console.debug(this.logTag, 'Message received');
        if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
            this.onSignalingServerMessage(box);
        }
        else {
            let decrypted = this.sessionKey.decrypt(box, this.getPeerSessionKey());
            this.onSignalingPeerMessage(decrypted);
        }
    }
    onSignalingServerMessage(box) {
        const msg = this.decryptServerMessage(box);
        if (msg.type === 'send-error') {
            this.handleSendError(msg);
        }
        else {
            console.warn(this.logTag, 'Invalid server message type:', msg.type);
        }
    }
    onSignalingPeerMessage(decrypted) {
        let msg = this.decodeMessage(decrypted);
        if (msg.type === 'close') {
            console.debug(this.logTag, 'Received close');
            this.handleClose(msg);
        }
        else if (msg.type === 'application') {
            console.debug(this.logTag, 'Received application message');
            this.handleApplication(msg);
        }
        else if (this.task !== null && this.task.getSupportedMessageTypes().indexOf(msg.type) !== -1) {
            console.debug(this.logTag, 'Received', msg.type, '[' + this.task.getName() + ']');
            this.task.onTaskMessage(msg);
        }
        else {
            console.warn(this.logTag, 'Received message with invalid type from peer:', msg.type);
        }
    }
    handleServerHello(msg, nonce) {
        this.server.sessionKey = new Uint8Array(msg.key);
        this.server.cookiePair.theirs = nonce.cookie;
    }
    sendClientAuth() {
        let message = {
            type: 'client-auth',
            your_cookie: this.server.cookiePair.theirs.asArrayBuffer(),
            subprotocols: [Signaling.SALTYRTC_SUBPROTOCOL],
            ping_interval: this.pingInterval,
        };
        if (this.serverPublicKey !== null) {
            const start = this.serverPublicKey.byteOffset;
            const end = start + this.serverPublicKey.byteLength;
            message.your_key = this.serverPublicKey.buffer.slice(start, end);
        }
        const packet = this.buildPacket(message, this.server);
        console.debug(this.logTag, 'Sending client-auth');
        this.ws.send(packet);
        this.server.handshakeState = 'auth-sent';
    }
    handleSendError(msg) {
        const id = new DataView(msg.id);
        const idString = u8aToHex(new Uint8Array(msg.id));
        const source = id.getUint8(0);
        const destination = id.getUint8(1);
        if (source != this.address) {
            throw new ProtocolError("Received send-error message for a message not sent by us!");
        }
        console.warn(this.logTag, "SendError: Could not send unknown message:", idString);
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
        console.debug(this.logTag, 'Sending close');
        if (this.handoverState.local === true) {
            this.task.sendSignalingMessage(this.msgpackEncode(message));
        }
        else {
            const packet = this.buildPacket(message, this.getPeer());
            this.ws.send(packet);
        }
    }
    handleClose(msg) {
        console.warn(this.logTag, 'Received close message. Reason:', msg.reason, '(' + explainCloseCode(msg.reason) + ')');
        this.task.close(msg.reason);
        this.resetConnection(CloseCode.GoingAway);
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
                    throw new ValidationError("Received message during server handshake " +
                        "with invalid sender address (" + nonce.source + " != " + Signaling.SALTYRTC_ADDR_SERVER + ")");
                }
                break;
            case 'peer-handshake':
                if (nonce.source !== Signaling.SALTYRTC_ADDR_SERVER) {
                    if (this.role === 'initiator' && !isResponderId(nonce.source)) {
                        throw new ValidationError("Initiator peer message does not come from " +
                            "a valid responder address: " + nonce.source);
                    }
                    else if (this.role === 'responder' && nonce.source != Signaling.SALTYRTC_ADDR_INITIATOR) {
                        throw new ValidationError("Responder peer message does not come from " +
                            "intitiator (" + Signaling.SALTYRTC_ADDR_INITIATOR + "), " +
                            "but from " + nonce.source);
                    }
                }
                break;
            case 'task':
                if (nonce.source !== this.getPeer().id) {
                    throw new ValidationError("Received message after handshake with invalid sender address (" +
                        nonce.source + " != " + this.getPeer().id + ")");
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
                            throw new ValidationError("Received message during server handshake with invalid " +
                                "receiver address (" + nonce.destination + " is not a valid responder id)");
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
            throw new ValidationError("Cannot validate message nonce in signaling state " + this.state);
        }
        if (expected !== null && nonce.destination !== expected) {
            throw new ValidationError("Received message with invalid destination (" +
                nonce.destination + " != " + expected + ")");
        }
    }
    validateNonceCsn(nonce) {
        const peer = this.getPeerWithId(nonce.source);
        if (peer === null) {
            throw new ProtocolError("Could not find peer " + nonce.source);
        }
        if (peer.csnPair.theirs === null) {
            if (nonce.overflow !== 0) {
                throw new ValidationError("First message from " + peer.name + " must have set the overflow number to 0");
            }
            peer.csnPair.theirs = nonce.combinedSequenceNumber;
        }
        else {
            const previous = peer.csnPair.theirs;
            const current = nonce.combinedSequenceNumber;
            if (current < previous) {
                throw new ValidationError(peer.name + " CSN is lower than last time");
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
                throw new ValidationError(peer.name + " cookie changed");
            }
        }
    }
    validateRepeatedCookie(peer, repeatedCookieBytes) {
        const repeatedCookie = Cookie.fromArrayBuffer(repeatedCookieBytes);
        if (!repeatedCookie.equals(peer.cookiePair.ours)) {
            console.debug(this.logTag, 'Their cookie:', repeatedCookie.bytes);
            console.debug(this.logTag, 'Our cookie:', peer.cookiePair.ours.bytes);
            throw new ProtocolError('Peer repeated cookie does not match our cookie');
        }
    }
    validateSignedKeys(signed_keys, nonce, serverPublicKey) {
        if (signed_keys === null || signed_keys === undefined) {
            throw new ValidationError("Server did not send signed_keys in server-auth message");
        }
        const box = new Box(new Uint8Array(nonce.toArrayBuffer()), new Uint8Array(signed_keys), nacl.box.nonceLength);
        console.debug(this.logTag, "Expected server public permanent key is", u8aToHex(serverPublicKey));
        console.debug(this.logTag, "Server public session key is", u8aToHex(this.server.sessionKey));
        let decrypted;
        try {
            decrypted = this.permanentKey.decrypt(box, serverPublicKey);
        }
        catch (e) {
            if (e === 'decryption-failed') {
                throw new ValidationError("Could not decrypt signed_keys in server_auth message");
            }
            throw e;
        }
        const expected = concat(this.server.sessionKey, this.permanentKey.publicKeyBytes);
        if (!arraysAreEqual(decrypted, expected)) {
            throw new ValidationError("Decrypted signed_keys in server-auth message is invalid");
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
            throw new ProtocolError("CSN overflow: " + e.message);
        }
        const nonce = new Nonce(receiver.cookiePair.ours, csn.overflow, csn.sequenceNumber, this.address, receiver.id);
        const nonceBytes = new Uint8Array(nonce.toArrayBuffer());
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
        return this.permanentKey.encrypt(payload, nonceBytes, this.server.sessionKey);
    }
    decryptData(box) {
        const decryptedBytes = this.sessionKey.decrypt(box, this.getPeerSessionKey());
        const start = decryptedBytes.byteOffset;
        const end = start + decryptedBytes.byteLength;
        return decryptedBytes.buffer.slice(start, end);
    }
    resetConnection(reason) {
        if (this.ws !== null) {
            console.debug(this.logTag, 'Disconnecting WebSocket (close code ' + reason + ')');
            if (reason == CloseCode.GoingAway) {
                this.ws.close();
            }
            else {
                this.ws.close(reason);
            }
        }
        this.ws = null;
        this.server = new Server();
        this.handoverState.reset();
        this.setState('new');
        if (reason !== undefined) {
            console.debug(this.logTag, 'Connection reset');
        }
    }
    initTask(task, data) {
        try {
            task.init(this, data);
        }
        catch (e) {
            if (e.name === 'ValidationError') {
                throw new ProtocolError("Peer sent invalid task data");
            }
            throw e;
        }
        this.task = task;
    }
    decryptPeerMessage(box, convertErrors = true) {
        try {
            const decrypted = this.sessionKey.decrypt(box, this.getPeerSessionKey());
            return this.decodeMessage(decrypted, 'peer');
        }
        catch (e) {
            if (convertErrors === true && e === 'decryption-failed') {
                const nonce = Nonce.fromArrayBuffer(box.nonce.buffer);
                throw new ProtocolError('Could not decrypt peer message from ' + byteToHex(nonce.source));
            }
            else {
                throw e;
            }
        }
    }
    decryptServerMessage(box) {
        try {
            const decrypted = this.permanentKey.decrypt(box, this.server.sessionKey);
            return this.decodeMessage(decrypted, 'server');
        }
        catch (e) {
            if (e === 'decryption-failed') {
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
            console.debug(this.logTag, 'Sending', name, 'message through dc');
            this.task.sendSignalingMessage(this.msgpackEncode(msg));
        }
        else {
            console.debug(this.logTag, 'Sending', name, 'message through ws');
            const packet = this.buildPacket(msg, receiver);
            this.ws.send(packet);
        }
    }
    encryptForPeer(data, nonce) {
        return this.sessionKey.encrypt(data, nonce, this.getPeerSessionKey());
    }
    decryptFromPeer(box) {
        try {
            return this.sessionKey.decrypt(box, this.getPeerSessionKey());
        }
        catch (e) {
            if (e === 'decryption-failed') {
                if (this.state === 'task') {
                    this.sendClose(CloseCode.InternalError);
                }
                this.resetConnection(CloseCode.InternalError);
                throw new SignalingError(CloseCode.InternalError, "Decryption of peer message failed. This should not happen.");
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
            this.authToken = new AuthToken();
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
                return this.permanentKey.encrypt(payload, nonceBytes, responder.permanentKey);
            default:
                return responder.keyStore.encrypt(payload, nonceBytes, responder.sessionKey);
        }
    }
    getPeer() {
        if (this.responder !== null) {
            return this.responder;
        }
        return null;
    }
    getPeerSessionKey() {
        if (this.responder !== null) {
            return this.responder.sessionKey;
        }
        return null;
    }
    getPeerPermanentKey() {
        if (this.responder !== null) {
            return this.responder.permanentKey;
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
            throw new ProtocolError("Invalid peer id: " + id);
        }
    }
    handlePeerHandshakeSignalingError(e, source) {
        if (source !== null) {
            this.dropResponder(source, e.closeCode);
        }
    }
    processNewResponder(responderId) {
        if (this.responders.has(responderId)) {
            this.responders.delete(responderId);
        }
        const responder = new Responder(responderId, this.responderCounter++);
        if (this.peerTrustedKey !== null) {
            responder.handshakeState = 'token-received';
            responder.permanentKey = this.peerTrustedKey;
        }
        this.responders.set(responderId, responder);
        if (this.responders.size > 252) {
            this.dropOldestInactiveResponder();
        }
        this.client.emit({ type: 'new-responder', data: responderId });
    }
    dropOldestInactiveResponder() {
        console.warn(this.logTag, "Dropping oldest inactive responder");
        let drop = null;
        for (let r of this.responders.values()) {
            if (r.handshakeState == 'new') {
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
        if (nonce.destination != this.address) {
            throw new ProtocolError('Message destination does not match our address');
        }
        let payload;
        if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
            payload = decryptKeystore(box, this.permanentKey, this.server.sessionKey, 'server');
            const msg = this.decodeMessage(payload, 'server');
            switch (msg.type) {
                case 'new-responder':
                    console.debug(this.logTag, 'Received new-responder', byteToHex(msg.id));
                    this.handleNewResponder(msg);
                    break;
                case 'send-error':
                    console.debug(this.logTag, 'Received send-error');
                    this.handleSendError(msg);
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
                        console.warn(this.logTag, 'Could not decrypt token message: ', e);
                        this.dropResponder(responder.id, CloseCode.InitiatorCouldNotDecrypt);
                        return;
                    }
                    msg = this.decodeMessage(payload, 'token', true);
                    console.debug(this.logTag, 'Received token');
                    this.handleToken(msg, responder);
                    break;
                case 'token-received':
                    const peerPublicKey = this.peerTrustedKey || responder.permanentKey;
                    try {
                        payload = this.permanentKey.decrypt(box, peerPublicKey);
                    }
                    catch (e) {
                        if (this.peerTrustedKey !== null) {
                            console.warn(this.logTag, 'Could not decrypt key message');
                            this.dropResponder(responder.id, CloseCode.InitiatorCouldNotDecrypt);
                            return;
                        }
                        throw e;
                    }
                    msg = this.decodeMessage(payload, 'key', true);
                    console.debug(this.logTag, 'Received key');
                    this.handleKey(msg, responder);
                    this.sendKey(responder);
                    break;
                case 'key-sent':
                    payload = decryptKeystore(box, responder.keyStore, responder.sessionKey, 'auth');
                    msg = this.decodeMessage(payload, 'auth', true);
                    console.debug(this.logTag, 'Received auth');
                    this.handleAuth(msg, responder, nonce);
                    this.sendAuth(responder, nonce);
                    this.responder = this.responders.get(responder.id);
                    this.sessionKey = responder.keyStore;
                    this.responders.delete(responder.id);
                    this.dropResponders(CloseCode.DroppedByInitiator);
                    this.setState('task');
                    console.info(this.logTag, 'Peer handshake done');
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
    sendClientHello() {
    }
    handleServerAuth(msg, nonce) {
        this.address = Signaling.SALTYRTC_ADDR_INITIATOR;
        this.validateRepeatedCookie(this.server, msg.your_cookie);
        if (this.serverPublicKey != null) {
            try {
                this.validateSignedKeys(msg.signed_keys, nonce, this.serverPublicKey);
            }
            catch (e) {
                if (e.name === 'ValidationError') {
                    throw new ProtocolError("Verification of signed_keys failed: " + e.message);
                }
                throw e;
            }
        }
        else if (msg.signed_keys !== null && msg.signed_keys !== undefined) {
            console.warn(this.logTag, "Server sent signed keys, but we're not verifying them.");
        }
        this.responders = new Map();
        for (let id of msg.responders) {
            if (!isResponderId(id)) {
                throw new ProtocolError("Responder id " + id + " must be in the range 0x02-0xff");
            }
            this.processNewResponder(id);
        }
        console.debug(this.logTag, this.responders.size, 'responders connected');
        this.server.handshakeState = 'done';
    }
    initPeerHandshake() {
    }
    handleNewResponder(msg) {
        if (!isResponderId(msg.id)) {
            throw new ProtocolError("Responder id " + msg.id + " must be in the range 0x02-0xff");
        }
        this.processNewResponder(msg.id);
    }
    handleToken(msg, responder) {
        responder.permanentKey = new Uint8Array(msg.key);
        responder.handshakeState = 'token-received';
    }
    handleKey(msg, responder) {
        responder.sessionKey = new Uint8Array(msg.key);
        responder.handshakeState = 'key-received';
    }
    sendKey(responder) {
        const message = {
            type: 'key',
            key: responder.keyStore.publicKeyBytes.buffer,
        };
        const packet = this.buildPacket(message, responder);
        console.debug(this.logTag, 'Sending key');
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
            your_cookie: nonce.cookie.asArrayBuffer(),
            task: this.task.getName(),
            data: taskData,
        };
        const packet = this.buildPacket(message, responder);
        console.debug(this.logTag, 'Sending auth');
        this.ws.send(packet);
        responder.handshakeState = 'auth-sent';
    }
    handleAuth(msg, responder, nonce) {
        this.validateRepeatedCookie(responder, msg.your_cookie);
        try {
            InitiatorSignaling.validateTaskInfo(msg.tasks, msg.data);
        }
        catch (e) {
            if (e.name === 'ValidationError') {
                throw new ProtocolError("Peer sent invalid task info: " + e.message);
            }
            throw e;
        }
        const task = InitiatorSignaling.chooseCommonTask(this.tasks, msg.tasks);
        if (task === null) {
            throw new SignalingError(CloseCode.NoSharedTask, "No shared task could be found");
        }
        else {
            console.log(this.logTag, "Task", task.getName(), "has been selected");
        }
        this.initTask(task, msg.data[task.getName()]);
        console.debug(this.logTag, 'Responder', responder.hexId, 'authenticated');
        responder.cookiePair.theirs = nonce.cookie;
        responder.handshakeState = 'auth-received';
    }
    static validateTaskInfo(names, data) {
        if (names.length < 1) {
            throw new ValidationError("Task names must not be empty");
        }
        if (Object.keys(data).length < 1) {
            throw new ValidationError("Task data must not be empty");
        }
        if (names.length != Object.keys(data).length) {
            throw new ValidationError("Task data must contain an entry for every task");
        }
        for (let task of names) {
            if (!data.hasOwnProperty(task)) {
                throw new ValidationError("Task data must contain an entry for every task");
            }
        }
    }
    static chooseCommonTask(ourTasks, theirTasks) {
        for (let task of ourTasks) {
            if (theirTasks.indexOf(task.getName()) !== -1) {
                return task;
            }
        }
        return null;
    }
    _handleSendError(receiver) {
        if (!isResponderId(receiver)) {
            throw new ProtocolError("Outgoing c2c messages must have been sent to a responder");
        }
        let notify = false;
        if (this.responder === null) {
            const responder = this.responders.get(receiver);
            if (responder === null || responder === undefined) {
                console.warn(this.logTag, "Got send-error message for unknown responder", receiver);
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
                console.warn(this.logTag, "Got send-error message for unknown responder", receiver);
            }
        }
        if (notify === true) {
            this.client.emit({ type: "signaling-connection-lost", data: receiver });
        }
    }
    dropResponders(reason) {
        console.debug(this.logTag, 'Dropping', this.responders.size, 'other responders.');
        for (let id of this.responders.keys()) {
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
        console.debug(this.logTag, 'Sending drop-responder', byteToHex(responderId));
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
        this.initiator = new Initiator(initiatorPubKey);
        if (authToken !== undefined) {
            this.authToken = authToken;
        }
        else {
            this.initiator.handshakeState = 'token-sent';
        }
    }
    getWebsocketPath() {
        return u8aToHex(this.initiator.permanentKey);
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
                return this.permanentKey.encrypt(payload, nonceBytes, this.initiator.permanentKey);
            default:
                const peerSessionKey = this.getPeerSessionKey();
                if (peerSessionKey === null) {
                    throw new ProtocolError('Trying to encrypt for peer using session key, but session key is null');
                }
                return this.sessionKey.encrypt(payload, nonceBytes, peerSessionKey);
        }
    }
    getPeer() {
        if (this.initiator !== null) {
            return this.initiator;
        }
        return null;
    }
    getPeerSessionKey() {
        if (this.initiator !== null) {
            return this.initiator.sessionKey;
        }
        return null;
    }
    getPeerPermanentKey() {
        if (this.initiator !== null) {
            return this.initiator.permanentKey;
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
            throw new ProtocolError("Invalid peer id: " + id);
        }
    }
    handlePeerHandshakeSignalingError(e, source) {
        this.resetConnection(e.closeCode);
    }
    onPeerHandshakeMessage(box, nonce) {
        if (nonce.destination != this.address) {
            throw new ProtocolError('Message destination does not match our address');
        }
        let payload;
        if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
            payload = decryptKeystore(box, this.permanentKey, this.server.sessionKey, 'server');
            const msg = this.decodeMessage(payload, 'server');
            switch (msg.type) {
                case 'new-initiator':
                    console.debug(this.logTag, 'Received new-initiator');
                    this.handleNewInitiator(msg);
                    break;
                case 'send-error':
                    console.debug(this.logTag, 'Received send-error');
                    this.handleSendError(msg);
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
                    console.debug(this.logTag, 'Received key');
                    this.handleKey(msg);
                    this.sendAuth(nonce);
                    break;
                case 'auth-sent':
                    msg = this.decodeMessage(payload, 'auth', true);
                    console.debug(this.logTag, 'Received auth');
                    this.handleAuth(msg, nonce);
                    this.setState('task');
                    console.info(this.logTag, 'Peer handshake done');
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
                return decryptKeystore(box, this.permanentKey, this.initiator.permanentKey, 'key');
            case 'auth-sent':
            case 'auth-received':
                return decryptKeystore(box, this.sessionKey, this.initiator.sessionKey, 'initiator session');
            default:
                throw new ProtocolError('Invalid handshake state: ' + this.initiator.handshakeState);
        }
    }
    sendClientHello() {
        const message = {
            type: 'client-hello',
            key: this.permanentKey.publicKeyBytes.buffer,
        };
        const packet = this.buildPacket(message, this.server, false);
        console.debug(this.logTag, 'Sending client-hello');
        this.ws.send(packet);
        this.server.handshakeState = 'hello-sent';
    }
    handleServerAuth(msg, nonce) {
        if (nonce.destination > 0xff || nonce.destination < 0x02) {
            console.error(this.logTag, 'Invalid nonce destination:', nonce.destination);
            throw 'bad-nonce-destination';
        }
        this.address = nonce.destination;
        console.debug(this.logTag, 'Server assigned address', byteToHex(this.address));
        this.logTag = '[SaltyRTC.Responder.' + byteToHex(this.address) + ']';
        this.validateRepeatedCookie(this.server, msg.your_cookie);
        if (this.serverPublicKey != null) {
            try {
                this.validateSignedKeys(msg.signed_keys, nonce, this.serverPublicKey);
            }
            catch (e) {
                if (e.name === 'ValidationError') {
                    throw new ProtocolError("Verification of signed_keys failed: " + e.message);
                }
                throw e;
            }
        }
        else if (msg.signed_keys !== null && msg.signed_keys !== undefined) {
            console.warn(this.logTag, "Server sent signed keys, but we're not verifying them.");
        }
        this.initiator.connected = msg.initiator_connected;
        console.debug(this.logTag, 'Initiator', this.initiator.connected ? '' : 'not', 'connected');
        this.server.handshakeState = 'done';
    }
    handleNewInitiator(msg) {
        this.initiator = new Initiator(this.initiator.permanentKey);
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
            key: this.permanentKey.publicKeyBytes.buffer,
        };
        const packet = this.buildPacket(message, this.initiator);
        console.debug(this.logTag, 'Sending token');
        this.ws.send(packet);
        this.initiator.handshakeState = 'token-sent';
    }
    sendKey() {
        this.sessionKey = new KeyStore();
        const replyMessage = {
            type: 'key',
            key: this.sessionKey.publicKeyBytes.buffer,
        };
        const packet = this.buildPacket(replyMessage, this.initiator);
        console.debug(this.logTag, 'Sending key');
        this.ws.send(packet);
        this.initiator.handshakeState = 'key-sent';
    }
    handleKey(msg) {
        this.initiator.sessionKey = new Uint8Array(msg.key);
        this.initiator.handshakeState = 'key-received';
    }
    sendAuth(nonce) {
        if (nonce.cookie.equals(this.initiator.cookiePair.ours)) {
            throw new ProtocolError('Their cookie and our cookie are the same.');
        }
        const taskData = {};
        for (let task of this.tasks) {
            taskData[task.getName()] = task.getData();
        }
        const taskNames = this.tasks.map((task) => task.getName());
        const message = {
            type: 'auth',
            your_cookie: nonce.cookie.asArrayBuffer(),
            tasks: taskNames,
            data: taskData,
        };
        const packet = this.buildPacket(message, this.initiator);
        console.debug(this.logTag, 'Sending auth');
        this.ws.send(packet);
        this.initiator.handshakeState = 'auth-sent';
    }
    handleAuth(msg, nonce) {
        this.validateRepeatedCookie(this.initiator, msg.your_cookie);
        try {
            ResponderSignaling.validateTaskInfo(msg.task, msg.data);
        }
        catch (e) {
            if (e.name === 'ValidationError') {
                throw new ProtocolError("Peer sent invalid task info: " + e.message);
            }
            throw e;
        }
        let selectedTask = null;
        for (let task of this.tasks) {
            if (task.getName() === msg.task) {
                selectedTask = task;
                console.info(this.logTag, "Task", msg.task, "has been selected");
                break;
            }
        }
        if (selectedTask === null) {
            throw new SignalingError(CloseCode.ProtocolError, "Initiator selected unknown task");
        }
        else {
            this.initTask(selectedTask, msg.data[selectedTask.getName()]);
        }
        console.debug(this.logTag, 'Initiator authenticated');
        this.initiator.cookiePair.theirs = nonce.cookie;
        this.initiator.handshakeState = 'auth-received';
    }
    static validateTaskInfo(name, data) {
        if (name.length == 0) {
            throw new ValidationError("Task name must not be empty");
        }
        if (Object.keys(data).length < 1) {
            throw new ValidationError("Task data must not be empty");
        }
        if (Object.keys(data).length > 1) {
            throw new ValidationError("Task data must contain exactly 1 key");
        }
        if (!data.hasOwnProperty(name)) {
            throw new ValidationError("Task data must contain an entry for the chosen task");
        }
    }
    _handleSendError(receiver) {
        if (receiver != Signaling.SALTYRTC_ADDR_INITIATOR) {
            throw new ProtocolError("Outgoing c2c messages must have been sent to the initiator");
        }
        this.client.emit({ type: "signaling-connection-lost", data: receiver });
        this.resetConnection(CloseCode.ProtocolError);
    }
}

class EventRegistry {
    constructor() {
        this.map = new Map();
    }
    register(eventType, handler) {
        if (typeof eventType === 'string') {
            this.set(eventType, handler);
        }
        else {
            for (let et of eventType) {
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
            for (let et of eventType) {
                this.unregister(et, handler);
            }
        }
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
            for (let et of eventType) {
                for (let handler of this.get(et)) {
                    if (handlers.indexOf(handler) === -1) {
                        handlers.push(handler);
                    }
                }
            }
        }
        return handlers;
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
    }
    validateHost(host) {
        if (host.endsWith('/')) {
            throw new Error('SaltyRTC host may not end with a slash');
        }
        if (host.indexOf('//') !== -1) {
            throw new Error('SaltyRTC host should not contain protocol');
        }
    }
    requireKeyStore() {
        if (!this.hasKeyStore) {
            throw new Error("Keys not set yet. Please call .withKeyStore method first.");
        }
    }
    requireConnectionInfo() {
        if (!this.hasConnectionInfo) {
            throw new Error("Connection info not set yet. Please call .connectTo method first.");
        }
    }
    requireTasks() {
        if (!this.hasTasks) {
            throw new Error("Tasks not set yet. Please call .usingTasks method first.");
        }
    }
    requireInitiatorInfo() {
        if (!this.hasInitiatorInfo) {
            throw new Error("Initiator info not set yet. Please call .initiatorInfo method first.");
        }
    }
    connectTo(host, port = 8765) {
        this.validateHost(host);
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
        this.peerTrustedKey = validateKey(peerTrustedKey, "Peer key");
        this.hasTrustedPeerKey = true;
        return this;
    }
    usingTasks(tasks) {
        if (tasks.length < 1) {
            throw new Error("You must specify at least 1 task");
        }
        this.tasks = tasks;
        this.hasTasks = true;
        return this;
    }
    withPingInterval(interval) {
        if (interval < 0) {
            throw new Error("Ping interval may not be negative");
        }
        this.pingInterval = interval;
        return this;
    }
    withServerKey(serverKey) {
        this.serverPublicKey = validateKey(serverKey, "Server public key");
        return this;
    }
    initiatorInfo(initiatorPublicKey, authToken) {
        this.initiatorPublicKey = validateKey(initiatorPublicKey, "Initiator public key");
        this.authToken = validateKey(authToken, "Auth token");
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
            return new SaltyRTC(this.keyStore, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval, this.peerTrustedKey)
                .asInitiator();
        }
        else {
            return new SaltyRTC(this.keyStore, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval)
                .asInitiator();
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
            return new SaltyRTC(this.keyStore, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval, this.peerTrustedKey)
                .asResponder();
        }
        else {
            this.requireInitiatorInfo();
            if (this.serverInfoFactory !== null) {
                this.processServerInfo(this.serverInfoFactory, this.initiatorPublicKey);
            }
            return new SaltyRTC(this.keyStore, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval)
                .asResponder(this.initiatorPublicKey, this.authToken);
        }
    }
}
class SaltyRTC {
    constructor(permanentKey, host, port, serverKey, tasks, pingInterval, peerTrustedKey) {
        this.peerTrustedKey = null;
        this._signaling = null;
        this.logTag = '[SaltyRTC.Client]';
        if (permanentKey === undefined) {
            throw new Error('SaltyRTC must be initialized with a permanent key');
        }
        if (host === undefined) {
            throw new Error('SaltyRTC must be initialized with a target host');
        }
        if (tasks === undefined || tasks.length == 0) {
            throw new Error('SaltyRTC must be initialized with at least 1 task');
        }
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
            const token = new AuthToken(authToken);
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
        return u8aToHex(this.signaling.authTokenBytes);
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
    connect() {
        this.signaling.connect();
    }
    disconnect() {
        this.signaling.disconnect();
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
        this.eventRegistry.unregister(event, handler);
    }
    emit(event) {
        console.debug(this.logTag, 'New event:', event.type);
        const handlers = this.eventRegistry.get(event.type);
        for (let handler of handlers) {
            try {
                this.callHandler(handler, event);
            }
            catch (e) {
                console.error(this.logTag, 'Unhandled exception in', event.type, 'handler:', e);
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

export { SaltyRTCBuilder, KeyStore, Box, Cookie, CookiePair, CombinedSequence, CombinedSequencePair, EventRegistry, CloseCode, explainCloseCode, SignalingError, ConnectionError };
