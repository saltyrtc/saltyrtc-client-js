/**
 * saltyrtc-client-js v0.2.3
 * SaltyRTC JavaScript implementation
 * https://github.com/saltyrtc/saltyrtc-client-js
 *
 * Copyright (C) 2016 Threema GmbH
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

function u8aToHex(array) {
    const results = [];
    for (let arrayByte of array) {
        results.push(arrayByte.toString(16).replace(/^([\da-f])$/, '0$1'));
    }
    return results.join('');
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
function waitFor(test, delay_ms, retries, success, error) {
    if (test() === false) {
        if (retries === 1) {
            error();
        }
        else {
            setTimeout(() => waitFor(test, delay_ms, retries - 1, success, error), delay_ms);
        }
        return;
    }
    success();
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
    constructor(publicKey, secretKey) {
        if (publicKey === undefined || secretKey === undefined) {
            this._keyPair = nacl.box.keyPair();
            console.debug('KeyStore: New public key:', u8aToHex(this._keyPair.publicKey));
        }
        else {
            this._keyPair = {
                publicKey: publicKey,
                secretKey: secretKey,
            };
            console.debug('KeyStore: Restored public key:', u8aToHex(this._keyPair.publicKey));
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
        if (typeof bytes === 'undefined') {
            this._authToken = nacl.randomBytes(nacl.secretbox.keyLength);
            console.debug('AuthToken: Generated auth token');
        }
        else {
            if (bytes.byteLength != nacl.secretbox.keyLength) {
                console.error('Auth token must be', nacl.secretbox.keyLength, 'bytes long.');
                throw 'bad-token-length';
            }
            this._authToken = bytes;
            console.debug('AuthToken: Initialized auth token');
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
        for (var i = 0; i < this.bytes.byteLength; i++) {
            if (otherCookie.bytes[i] != this.bytes[i])
                return false;
        }
        return true;
    }
}
Cookie.COOKIE_LENGTH = 16;
class CookiePair {
    constructor(ours, theirs) {
        this.ours = null;
        this.theirs = null;
        if (typeof ours !== 'undefined' && typeof theirs !== 'undefined') {
            this.ours = ours;
            this.theirs = theirs;
        }
        else if (typeof ours === 'undefined' && typeof theirs === 'undefined') {
            this.ours = new Cookie();
        }
        else {
            throw new Error('Either both or no cookies must be specified');
        }
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

class CombinedSequence {
    constructor() {
        this.sequenceNumber = randomUint32();
        this.overflow = 0;
    }
    next() {
        if (this.sequenceNumber + 1 >= CombinedSequence.SEQUENCE_NUMBER_MAX) {
            this.sequenceNumber = 0;
            this.overflow += 1;
            if (this.overflow >= CombinedSequence.OVERFLOW_MAX) {
                console.error('Overflow number just overflowed!');
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
        this.stack = (new Error()).stack;
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

function isResponderId(receiver) {
    return receiver >= 0x02 && receiver <= 0xff;
}

class Signaling {
    constructor(client, host, port, tasks, permanentKey, peerTrustedKey) {
        this.protocol = 'wss';
        this.ws = null;
        this.msgpackOptions = {
            codec: createCodec({ binarraybuffer: true }),
        };
        this.state = 'new';
        this.serverHandshakeState = 'new';
        this.handoverState = {
            local: false,
            peer: false,
        };
        this.task = null;
        this.serverKey = null;
        this.sessionKey = null;
        this.authToken = null;
        this.peerTrustedKey = null;
        this.role = null;
        this.logTag = 'Signaling:';
        this.address = Signaling.SALTYRTC_ADDR_UNKNOWN;
        this.cookiePair = null;
        this.serverCsn = new CombinedSequence();
        this.onOpen = (ev) => {
            console.info(this.logTag, 'Opened connection');
            this.setState('server-handshake');
        };
        this.onError = (ev) => {
            console.error(this.logTag, 'General WebSocket error', ev);
            this.client.emit({ type: 'connection-error', data: ev });
        };
        this.onClose = (ev) => {
            if (ev.code === CloseCode.Handover) {
                console.info(this.logTag, 'Closed WebSocket connection due to handover');
            }
            else {
                console.info(this.logTag, 'Closed WebSocket connection');
                this.setState('closed');
                const log = (reason) => console.error(this.logTag, 'Server closed connection:', reason);
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
                }
                this.client.emit({ type: 'connection-closed', data: ev });
            }
        };
        this.onMessage = (ev) => {
            console.debug(this.logTag, 'New ws message (' + ev.data.byteLength + ' bytes)');
            try {
                const box = Box.fromUint8Array(new Uint8Array(ev.data), Nonce.TOTAL_LENGTH);
                const nonce = Nonce.fromArrayBuffer(box.nonce.buffer);
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
                if (e instanceof SignalingError) {
                    console.error(this.logTag, 'Signaling error: ' + explainCloseCode(e.closeCode));
                    if (this.state === 'task') {
                        this.sendClose(e.closeCode);
                    }
                    this.resetConnection(e.closeCode);
                }
                else if (e instanceof ConnectionError) {
                    console.warn(this.logTag, 'Connection error. Resetting connection.');
                    this.resetConnection(CloseCode.InternalError);
                }
                throw e;
            }
        };
        this.client = client;
        this.permanentKey = permanentKey;
        this.host = host;
        this.port = port;
        this.tasks = tasks;
        if (peerTrustedKey !== undefined) {
            this.peerTrustedKey = peerTrustedKey;
        }
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
        return encode(data, this.msgpackOptions);
    }
    msgpackDecode(data) {
        return decode(data, this.msgpackOptions);
    }
    connect() {
        this.resetConnection();
        this.initWebsocket();
    }
    disconnect() {
        if (this.ws !== null) {
            console.debug(this.logTag, 'Disconnecting WebSocket');
            this.ws.close();
        }
        this.ws = null;
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
        if (this.serverHandshakeState === 'new') {
            payload = box.data;
        }
        else {
            payload = this.permanentKey.decrypt(box, this.serverKey);
        }
        const msg = this.decodeMessage(payload, 'server handshake');
        switch (this.serverHandshakeState) {
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
                throw new SignalingError(CloseCode.InternalError, 'Unknown server handshake state: ' + this.serverHandshakeState);
        }
        if (this.serverHandshakeState === 'done') {
            this.setState('peer-handshake');
            console.debug(this.logTag, 'Server handshake done');
            this.initPeerHandshake();
        }
    }
    onSignalingMessage(box, nonce) {
        console.debug('Message received');
        if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
            this.onSignalingServerMessage(box);
        }
        else {
            let decrypted;
            try {
                decrypted = this.decryptFromPeer(box);
            }
            catch (e) {
                if (e === 'decryption-failed') {
                    console.warn(this.logTag, 'Could not decrypt peer message from', byteToHex(nonce.source));
                    return;
                }
                else {
                    throw e;
                }
            }
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
            console.debug('Received close');
        }
        else if (msg.type === 'data') {
            console.debug(this.logTag, 'Received data');
            this.handleData(msg);
        }
        else if (msg.type === 'restart') {
            console.debug(this.logTag, 'Received restart');
            this.handleRestart(msg);
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
        this.serverKey = new Uint8Array(msg.key);
        let cookie;
        do {
            cookie = new Cookie();
        } while (cookie.equals(nonce.cookie));
        this.cookiePair = new CookiePair(cookie, nonce.cookie);
    }
    sendClientAuth() {
        const message = {
            type: 'client-auth',
            your_cookie: this.cookiePair.theirs.asArrayBuffer(),
            subprotocols: [Signaling.SALTYRTC_SUBPROTOCOL],
        };
        const packet = this.buildPacket(message, Signaling.SALTYRTC_ADDR_SERVER);
        console.debug(this.logTag, 'Sending client-auth');
        this.ws.send(packet);
        this.serverHandshakeState = 'auth-sent';
    }
    handleData(msg) {
        this.client.emit({ type: 'data', data: msg.data });
        if (typeof msg.data_type === 'string') {
            this.client.emit({ type: 'data:' + msg.data_type, data: msg.data });
        }
    }
    handleRestart(msg) {
        throw new ProtocolError('Restart messages not yet implemented');
    }
    handleSendError(msg) {
        throw new ProtocolError('Send error messages not yet implemented');
    }
    validateNonce(nonce, destination, source) {
        if (destination !== undefined && nonce.destination !== destination) {
            console.error(this.logTag, 'Nonce destination is', nonce.destination, 'but we\'re', this.address);
            throw 'bad-nonce-destination';
        }
        if (source !== undefined && nonce.source !== source) {
            console.error(this.logTag, 'Nonce source is', nonce.source, 'but should be', source);
            throw 'bad-nonce-source';
        }
    }
    validateRepeatedCookie(msg) {
        const repeatedCookie = Cookie.fromArrayBuffer(msg.your_cookie);
        if (!repeatedCookie.equals(this.cookiePair.ours)) {
            console.debug(this.logTag, 'Their cookie:', repeatedCookie.bytes);
            console.debug(this.logTag, 'Our cookie:', this.cookiePair.ours.bytes);
            throw new ProtocolError('Peer repeated cookie does not match our cookie');
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
        const csn = this.getNextCsn(receiver);
        const nonce = new Nonce(this.cookiePair.ours, csn.overflow, csn.sequenceNumber, this.address, receiver);
        const nonceBytes = new Uint8Array(nonce.toArrayBuffer());
        const data = this.msgpackEncode(message);
        if (encrypt === false) {
            return concat(nonceBytes, data);
        }
        let box;
        if (receiver === Signaling.SALTYRTC_ADDR_SERVER) {
            box = this.encryptHandshakeDataForServer(data, nonceBytes);
        }
        else if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR || isResponderId(receiver)) {
            box = this.encryptHandshakeDataForPeer(receiver, message.type, data, nonceBytes);
        }
        else {
            throw new ProtocolError('Bad receiver byte: ' + receiver);
        }
        return box.toUint8Array();
    }
    encryptHandshakeDataForServer(payload, nonceBytes) {
        return this.permanentKey.encrypt(payload, nonceBytes, this.serverKey);
    }
    decryptData(box) {
        const decryptedBytes = this.sessionKey.decrypt(box, this.getPeerSessionKey());
        const start = decryptedBytes.byteOffset;
        const end = start + decryptedBytes.byteLength;
        return decryptedBytes.buffer.slice(start, end);
    }
    resetConnection(closeCode = CloseCode.ClosingNormal) {
        this.setState('new');
        this.serverCsn = new CombinedSequence();
        if (this.ws !== null) {
            console.debug(this.logTag, 'Disconnecting WebSocket (close code ' + closeCode + ')');
            this.ws.close(closeCode);
        }
        this.ws = null;
    }
    initTask(task, data) {
        try {
            task.init(this, data);
        }
        catch (e) {
            if (e instanceof ValidationError) {
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
            const decrypted = this.permanentKey.decrypt(box, this.serverKey);
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
    send(payload) {
        if (['server-handshake', 'peer-handshake', 'task'].indexOf(this.state) === -1) {
            console.error('Trying to send message, but connection state is', this.state);
            throw new ConnectionError("Bad signaling state, cannot send message");
        }
        if (this.handoverState.local === false) {
            this.ws.send(payload);
        }
        else {
            this.task.sendSignalingMessage(payload);
        }
    }
    sendTaskMessage(msg) {
        const receiver = this.getPeerAddress();
        if (receiver === null) {
            throw new SignalingError(CloseCode.InternalError, 'No peer address could be found');
        }
        const packet = this.buildPacket(msg, receiver);
        this.send(packet);
    }
    encryptForPeer(data, nonce) {
        return this.sessionKey.encrypt(data, nonce, this.getPeerSessionKey());
    }
    decryptFromPeer(box) {
        return this.sessionKey.decrypt(box, this.getPeerSessionKey());
    }
    sendClose(reason) {
    }
}
Signaling.SALTYRTC_SUBPROTOCOL = 'v0.saltyrtc.org';
Signaling.SALTYRTC_ADDR_UNKNOWN = 0x00;
Signaling.SALTYRTC_ADDR_SERVER = 0x00;
Signaling.SALTYRTC_ADDR_INITIATOR = 0x01;

class Peer {
    constructor(permanentKey) {
        this._csn = new CombinedSequence();
        this.permanentKey = permanentKey;
    }
    get id() {
        return this._id;
    }
    get hexId() {
        return byteToHex(this._id);
    }
    get csn() {
        return this._csn;
    }
}
class Initiator extends Peer {
    constructor(permanentKey) {
        super(permanentKey);
        this.connected = false;
        this.handshakeState = 'new';
        this._id = 0x01;
    }
}
class Responder extends Peer {
    constructor(id) {
        super();
        this.keyStore = new KeyStore();
        this.handshakeState = 'new';
        this._id = id;
    }
}

class InitiatorSignaling extends Signaling {
    constructor(client, host, port, tasks, permanentKey, responderTrustedKey) {
        super(client, host, port, tasks, permanentKey, responderTrustedKey);
        this.logTag = 'Initiator:';
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
    getNextCsn(receiver) {
        if (receiver === Signaling.SALTYRTC_ADDR_SERVER) {
            return this.serverCsn.next();
        }
        else if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR) {
            throw new ProtocolError('Initiator cannot send messages to initiator');
        }
        else if (isResponderId(receiver)) {
            if (this.getState() === 'task') {
                return this.responder.csn.next();
            }
            else if (this.responders.has(receiver)) {
                return this.responders.get(receiver).csn.next();
            }
            else {
                throw new ProtocolError('Unknown responder: ' + receiver);
            }
        }
        else {
            throw new ProtocolError('Bad receiver byte: ' + receiver);
        }
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
    getPeerAddress() {
        if (this.responder !== null) {
            return this.responder.id;
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
    processNewResponder(responderId) {
        if (!this.responders.has(responderId)) {
            if (!isResponderId(responderId)) {
                throw new ProtocolError('Invalid responder id: ' + responderId);
            }
            const responder = new Responder(responderId);
            if (this.peerTrustedKey !== null) {
                responder.handshakeState = 'token-received';
                responder.permanentKey = this.peerTrustedKey;
            }
            this.responders.set(responderId, responder);
            this.client.emit({ type: 'new-responder', data: responderId });
        }
        else {
            console.warn(this.logTag, 'Got new-responder message for an already known responder.');
        }
    }
    onPeerHandshakeMessage(box, nonce) {
        if (nonce.destination != this.address) {
            throw new ProtocolError('Message destination does not match our address');
        }
        let payload;
        if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
            payload = decryptKeystore(box, this.permanentKey, this.serverKey, 'server');
            const msg = this.decodeMessage(payload, 'server');
            switch (msg.type) {
                case 'new-responder':
                    console.debug(this.logTag, 'Received new-responder');
                    this.handleNewResponder(msg);
                    break;
                default:
                    throw new ProtocolError('Received unexpected server message: ' + msg.type);
            }
        }
        else if (isResponderId(nonce.source)) {
            const responder = this.responders.get(nonce.source);
            if (responder === null) {
                throw new ProtocolError('Unknown message sender: ' + nonce.source);
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
                        this.dropResponder(responder.id);
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
                            this.dropResponder(responder.id);
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
                    this.dropResponders();
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
        this.validateNonce(nonce, this.address, Signaling.SALTYRTC_ADDR_SERVER);
        this.validateRepeatedCookie(msg);
        this.responders = new Map();
        for (let id of msg.responders) {
            this.processNewResponder(id);
        }
        console.debug(this.logTag, this.responders.size, 'responders connected');
        this.serverHandshakeState = 'done';
    }
    initPeerHandshake() {
    }
    handleNewResponder(msg) {
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
        const packet = this.buildPacket(message, responder.id);
        console.debug(this.logTag, 'Sending key');
        this.ws.send(packet);
        responder.handshakeState = 'key-sent';
    }
    sendAuth(responder, nonce) {
        if (nonce.cookie.equals(this.cookiePair.ours)) {
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
        const packet = this.buildPacket(message, responder.id);
        console.debug(this.logTag, 'Sending auth');
        this.ws.send(packet);
        responder.handshakeState = 'auth-sent';
    }
    handleAuth(msg, responder, nonce) {
        this.validateRepeatedCookie(msg);
        try {
            InitiatorSignaling.validateTaskInfo(msg.tasks, msg.data);
        }
        catch (e) {
            if (e instanceof ValidationError) {
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
        if (nonce.cookie.equals(this.cookiePair.ours)) {
            throw new ProtocolError('Local and remote cookies are equal');
        }
        responder.cookie = nonce.cookie;
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
    dropResponders() {
        console.debug(this.logTag, 'Dropping', this.responders.size, 'other responders.');
        for (let id of this.responders.keys()) {
            this.dropResponder(id);
        }
    }
    dropResponder(responderId) {
        const message = {
            type: 'drop-responder',
            id: responderId,
        };
        const packet = this.buildPacket(message, Signaling.SALTYRTC_ADDR_SERVER);
        console.debug(this.logTag, 'Sending drop-responder', byteToHex(responderId));
        this.ws.send(packet);
        this.responders.delete(responderId);
    }
}

class ResponderSignaling extends Signaling {
    constructor(client, host, port, tasks, permanentKey, initiatorPubKey, authToken) {
        super(client, host, port, tasks, permanentKey, authToken === undefined ? initiatorPubKey : undefined);
        this.logTag = 'Responder:';
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
    getNextCsn(receiver) {
        if (receiver === Signaling.SALTYRTC_ADDR_SERVER) {
            return this.serverCsn.next();
        }
        else if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR) {
            return this.initiator.csn.next();
        }
        else if (isResponderId(receiver)) {
            throw new ProtocolError('Responder may not send messages to other responders: ' + receiver);
        }
        else {
            throw new ProtocolError('Bad receiver byte: ' + receiver);
        }
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
    getPeerAddress() {
        if (this.initiator !== null) {
            return this.initiator.id;
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
    onPeerHandshakeMessage(box, nonce) {
        if (nonce.destination != this.address) {
            throw new ProtocolError('Message destination does not match our address');
        }
        let payload;
        if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
            payload = decryptKeystore(box, this.permanentKey, this.serverKey, 'server');
            const msg = this.decodeMessage(payload, 'server');
            switch (msg.type) {
                case 'new-initiator':
                    console.debug(this.logTag, 'Received new-initiator');
                    this.handleNewInitiator(msg);
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
        const packet = this.buildPacket(message, Signaling.SALTYRTC_ADDR_SERVER, false);
        console.debug(this.logTag, 'Sending client-hello');
        this.ws.send(packet);
        this.serverHandshakeState = 'hello-sent';
    }
    handleServerAuth(msg, nonce) {
        this.validateNonce(nonce, undefined, Signaling.SALTYRTC_ADDR_SERVER);
        if (nonce.destination > 0xff || nonce.destination < 0x02) {
            console.error(this.logTag, 'Invalid nonce destination:', nonce.destination);
            throw 'bad-nonce-destination';
        }
        this.address = nonce.destination;
        console.debug(this.logTag, 'Server assigned address', byteToHex(this.address));
        this.logTag = 'Responder[' + byteToHex(this.address) + ']:';
        this.validateRepeatedCookie(msg);
        this.initiator.connected = msg.initiator_connected;
        console.debug(this.logTag, 'Initiator', this.initiator.connected ? '' : 'not', 'connected');
        this.serverHandshakeState = 'done';
    }
    handleNewInitiator(msg) {
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
        const packet = this.buildPacket(message, Signaling.SALTYRTC_ADDR_INITIATOR);
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
        const packet = this.buildPacket(replyMessage, Signaling.SALTYRTC_ADDR_INITIATOR);
        console.debug(this.logTag, 'Sending key');
        this.ws.send(packet);
        this.initiator.handshakeState = 'key-sent';
    }
    handleKey(msg) {
        this.initiator.sessionKey = new Uint8Array(msg.key);
        this.initiator.handshakeState = 'key-received';
    }
    sendAuth(nonce) {
        if (nonce.cookie.equals(this.cookiePair.ours)) {
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
        const packet = this.buildPacket(message, Signaling.SALTYRTC_ADDR_INITIATOR);
        console.debug(this.logTag, 'Sending auth');
        this.ws.send(packet);
        this.initiator.handshakeState = 'auth-sent';
    }
    handleAuth(msg, nonce) {
        this.validateRepeatedCookie(msg);
        try {
            ResponderSignaling.validateTaskInfo(msg.task, msg.data);
        }
        catch (e) {
            if (e instanceof ValidationError) {
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
        this.initiator.cookie = nonce.cookie;
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
    withKeyStore(keyStore) {
        this.keyStore = keyStore;
        this.hasKeyStore = true;
        return this;
    }
    withTrustedPeerKey(peerTrustedKey) {
        this.peerTrustedKey = peerTrustedKey;
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
    initiatorInfo(initiatorPublicKey, authToken) {
        this.initiatorPublicKey = initiatorPublicKey;
        this.authToken = authToken;
        this.hasInitiatorInfo = true;
        return this;
    }
    asInitiator() {
        this.requireConnectionInfo();
        this.requireKeyStore();
        this.requireTasks();
        if (this.hasTrustedPeerKey) {
            return new SaltyRTC(this.keyStore, this.host, this.port, this.tasks, this.peerTrustedKey)
                .asInitiator();
        }
        else {
            return new SaltyRTC(this.keyStore, this.host, this.port, this.tasks)
                .asInitiator();
        }
    }
    asResponder() {
        this.requireConnectionInfo();
        this.requireKeyStore();
        this.requireTasks();
        if (this.hasTrustedPeerKey) {
            return new SaltyRTC(this.keyStore, this.host, this.port, this.tasks, this.peerTrustedKey)
                .asResponder();
        }
        else {
            this.requireInitiatorInfo();
            return new SaltyRTC(this.keyStore, this.host, this.port, this.tasks)
                .asResponder(this.initiatorPublicKey, this.authToken);
        }
    }
}
class SaltyRTC {
    constructor(permanentKey, host, port, tasks, peerTrustedKey) {
        this.peerTrustedKey = null;
        this._signaling = null;
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
        if (peerTrustedKey !== undefined) {
            this.peerTrustedKey = peerTrustedKey;
        }
        this.eventRegistry = new EventRegistry();
    }
    asInitiator() {
        if (this.peerTrustedKey !== null) {
            this._signaling = new InitiatorSignaling(this, this.host, this.port, this.tasks, this.permanentKey, this.peerTrustedKey);
        }
        else {
            this._signaling = new InitiatorSignaling(this, this.host, this.port, this.tasks, this.permanentKey);
        }
        return this;
    }
    asResponder(initiatorPubKey, authToken) {
        if (this.peerTrustedKey !== null) {
            this._signaling = new ResponderSignaling(this, this.host, this.port, this.tasks, this.permanentKey, this.peerTrustedKey);
        }
        else {
            const token = new AuthToken(authToken);
            this._signaling = new ResponderSignaling(this, this.host, this.port, this.tasks, this.permanentKey, initiatorPubKey, token);
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
        console.debug('SaltyRTC: New event:', event.type);
        const handlers = this.eventRegistry.get(event.type);
        for (let handler of handlers) {
            try {
                this.callHandler(handler, event);
            }
            catch (e) {
                console.error('SaltyRTC: Unhandled exception in', event.type, 'handler:', e);
            }
        }
    }
    callHandler(handler, event) {
        const response = handler(event);
        if (response === false) {
            this.eventRegistry.unregister(event.type, handler);
        }
    }
}

export { SaltyRTCBuilder, KeyStore, Box, Cookie, CookiePair, CombinedSequence, CombinedSequencePair, EventRegistry, CloseCode, explainCloseCode, SignalingError, ConnectionError };
