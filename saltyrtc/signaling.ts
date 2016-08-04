/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path='saltyrtc.d.ts' />
/// <reference path='types/RTCPeerConnection.d.ts' />
/// <reference path='types/msgpack-lite.d.ts' />
/// <reference path='types/tweetnacl.d.ts' />

import { KeyStore, AuthToken, Box } from "./keystore";
import { Cookie, CookiePair } from "./cookie";
import { SaltyRTC } from "./client";
import { SignalingChannelNonce, DataChannelNonce } from "./nonce";
import { SecureDataChannel } from "./datachannel";
import { concat, randomUint32, byteToHex, u8aToHex } from "./utils";

/**
 * Possible states for SaltyRTC connection.
 */
export type State = 'new' | 'ws-connecting' |
                    'server-handshake' | 'peer-handshake' |
                    'open' | 'closing' | 'closed';

const enum CloseCode {
    // Normal closing of WebSocket
    ClosingNormal = 1000,
    // The endpoint is going away
    GoingAway,
    // No shared sub-protocol could be found
    SubprotocolError,
    // No free responder byte
    PathFull = 3000,
    // Invalid message, invalid path length, ...
    ProtocolError,
    // Syntax error, ...
    InternalError,
    // Handover to Data Channel
    Handover,
    // Dropped by initiator (for an initiator that means another initiator has
    // connected to the path, for a responder it means that an initiator
    // requested to drop the responder)
    Dropped,
}

interface SignalingMessage {
    type: 'hello-client' | 'reset' | 'offer' | 'candidate',
    session?: string,
    data?: any; // TODO: type
}

interface Packet {
    message: saltyrtc.Message,
    nonce: SignalingChannelNonce,
}

class CombinedSequence {
    private static SEQUENCE_NUMBER_MAX = 0x100000000; // 1<<32
    private static OVERFLOW_MAX = 0x100000; // 1<<16

    private sequenceNumber: number;
    private overflow: number;

    constructor() {
        this.sequenceNumber = randomUint32();
        this.overflow = 0;
    }

    /**
     * Return next sequence number and overflow.
     *
     * May throw an error if overflow number overflows. This is extremely
     * unlikely and must be treated as a protocol error.
     */
    public next(): {sequenceNumber: number, overflow: number} {
        if (this.sequenceNumber + 1 >= CombinedSequence.SEQUENCE_NUMBER_MAX) {
            // Sequence number overflow
            this.sequenceNumber = 0;
            this.overflow += 1;
            if (this.overflow  >= CombinedSequence.OVERFLOW_MAX) {
                // Overflow overflow
                console.error('Overflow number just overflowed!');
                throw new Error('overflow-overflow');
            }
        } else {
            this.sequenceNumber += 1;
        }
        return {
            sequenceNumber: this.sequenceNumber,
            overflow: this.overflow,
        };
    }

}

class Responder {
    // Responder id
    private _id: number;
    public get id(): number { return this._id; }

    // Permanent key of the responder
    public permanentKey: Uint8Array = null;

    // Session key of the responder
    public sessionKey: Uint8Array = null;

    // Our own session keystore
    public keyStore: KeyStore = new KeyStore();

    // Handshake state
    public state: 'new' | 'token-received' | 'key-received' = 'new';

    // Sequence number
    public combinedSequence: CombinedSequence = new CombinedSequence();

    constructor(id: number) {
        this._id = id;
    }

}

/**
 * Signaling class.
 */
export class Signaling {
    static SALTYRTC_WS_SUBPROTOCOL = 'saltyrtc-1.0';
    static SALTYRTC_ADDR_UNKNOWN = 0x00;
    static SALTYRTC_ADDR_SERVER = 0x00;
    static SALTYRTC_ADDR_INITIATOR = 0x01;

    // WebSocket
    private host: string;
    private port: number;
    private protocol: string = 'wss';
    private ws: WebSocket = null;

    // WebRTC / ORTC
    private dc: RTCDataChannel = null;

    // Msgpack
    private msgpackOptions: Object = {
        codec: msgpack.createCodec({binarraybuffer: true}),
    };

    // Connection state
    private _state: State = 'new';
    public signalingChannel: saltyrtc.SignalingChannel = 'websocket';

    // Main class
    private client: SaltyRTC;

    // Keys
    private serverKey: Uint8Array = null;
    private permanentKey: KeyStore;
    private sessionKey: KeyStore = null;
    private authToken: AuthToken = new AuthToken();

    // Signaling
    private role: 'initiator' | 'responder' = null;
    private logTag: string = 'Signaling:';
    private address: number = Signaling.SALTYRTC_ADDR_UNKNOWN;
    private cookiePair: CookiePair = null;
    private serverCombinedSequence = new CombinedSequence();

    // Signaling: Initiator
    private responders: Map<number, Responder> = null;
    private responder: Responder = null;

    // Signaling: Responder
    private initiatorPermanentKey: Uint8Array = null;
    private initiatorSessionKey: Uint8Array = null;
    private initiatorConnected: boolean = null;
    private initiatorHandshakeState: 'new' | 'token-sent' | 'key-sent' | 'auth-received' = null;
    private initiatorCombinedSequence = new CombinedSequence();

    /**
     * Create a new signaling instance.
     *
     * If the authToken and path are specified, then the class will act as a
     * responder, otherwise as an initiator.
     */
    constructor(client: SaltyRTC, host: string, port: number,
                permanentKey: KeyStore,
                initiatorPubKey?: Uint8Array,
                authToken?: AuthToken) {
        this.client = client;
        this.permanentKey = permanentKey;
        this.host = host;
        this.port = port;
        if (typeof authToken !== 'undefined' && typeof initiatorPubKey !== 'undefined') {
            // We're a responder
            this.role = 'responder';
            this.logTag = 'Responder:';
            this.initiatorPermanentKey = initiatorPubKey;
            this.authToken = authToken;
        } else {
            // We're an initiator
            this.role = 'initiator';
            this.logTag = 'Initiator:';
        }
    }

    /**
     * Register a signaling state change.
     */
    public set state(newState: saltyrtc.State) {
        this._state = newState;

        // Notify listeners
        this.client.emit({type: 'state-change', data: newState});
    }

    /**
     * Return current state.
     */
    public get state(): saltyrtc.State {
        return this._state;
    }

    /**
     * Return the public permanent key as Uint8Array.
     */
    public get permanentKeyBytes(): Uint8Array {
        return this.permanentKey.publicKeyBytes;
    }

    /**
     * Return the auth token as Uint8Array.
     */
    public get authTokenBytes(): Uint8Array {
        return this.authToken.keyBytes;
    }

    /**
     * Encode msgpack data.
     */
    private msgpackEncode(data: Object) {
        return msgpack.encode(data, this.msgpackOptions);
    }

    /**
     * Decode msgpack data.
     */
    private msgpackDecode(data: Uint8Array) {
        return msgpack.decode(data, this.msgpackOptions);
    }

    /**
     * Open a connection to the signaling server and do the handshake.
     */
    public connect(): void {
        this.resetConnection();
        this.initWebsocket();
    }

    /**
     * Disconnect from the signaling server.
     */
    public disconnect(): void {
        // Close WebSocket instance
        if (this.ws !== null) {
            console.debug(this.logTag, 'Disconnecting WebSocket');
            this.ws.close();
        }
        this.ws = null;

        // TODO: Close dc

        this.state = 'closed';
    }

    /**
     * Open a new WebSocket connection to the signaling server.
     */
    private initWebsocket() {
        const url = this.protocol + '://' + this.host + ':' + this.port + '/';
        let path;
        if (this.role == 'initiator') {
            path = this.permanentKey.publicKeyHex;
        } else {
            path = u8aToHex(this.initiatorPermanentKey);
        }
        this.ws = new WebSocket(url + path, Signaling.SALTYRTC_WS_SUBPROTOCOL);

        // Set binary type
        this.ws.binaryType = 'arraybuffer';

        // Set event handlers
        this.ws.addEventListener('open', this.onOpen);
        this.ws.addEventListener('error', this.onError);
        this.ws.addEventListener('close', this.onClose);

        // We assign the handshake method to the message event listener directly
        // to make sure that we don't miss any message.
        this.ws.addEventListener('message', this.onInitServerHandshake);

        // Store connection on instance
        this.state = 'ws-connecting';
        console.debug(this.logTag, 'Opening WebSocket connection to', url + path);
    }

    /**
     * Do a full server- and p2p-handshake.
     *
     * This method is not invoked directly, but instead used as callback for
     * the `onMessage` event.
     */
    private onInitServerHandshake = async (ev: MessageEvent) => {
        console.debug(this.logTag, 'Start server handshake');
        this.ws.removeEventListener('message', this.onInitServerHandshake);

        // Do server handshake
        // The state is already updated in onOpen, but let's make sure it's set correctly.
        this.state = 'server-handshake';
        try {
            await this.serverHandshake(ev.data);
        } catch(e) {
            console.error('Error occured during server handshake:', e);
            this.resetConnection(CloseCode.ProtocolError);
            return;
        }

        // Initiate peer handshake
        this.state = 'peer-handshake';
        if (this.role === 'responder') {
            this.initiatorHandshakeState = 'new';
            if (this.initiatorConnected === true) {
                this.sendToken();
            }
        }
        this.ws.addEventListener('message', this.onPeerHandshakeMessage);
    }

    /**
     * Do the server handshake.
     *
     * The `buffer` argument contains the `server-hello` packet.
     *
     * If an exception is thrown in this method, it will be converted to a
     * protocol error.
     */
    private async serverHandshake(buffer: ArrayBuffer): Promise<void> {

        { // Process server-hello

            // First packet is unencrypted. Decode it directly.
            const nonce = SignalingChannelNonce.fromArrayBuffer(buffer.slice(0, 24));
            const payload = new Uint8Array(buffer.slice(24));
            const serverHello = this.msgpackDecode(payload) as saltyrtc.messages.ServerHello;

            // Validate nonce
            this.validateNonce(nonce, this.address, Signaling.SALTYRTC_ADDR_SERVER);

            // Validate data
            if (serverHello.type !== 'server-hello') {
                console.error(this.logTag, 'Invalid server-hello message, bad type:', serverHello);
                throw 'bad-message-type';
            }

            // Store server public key
            this.serverKey = new Uint8Array(serverHello.key);

            // Generate cookie
            let cookie: Cookie;
            do {
                cookie = new Cookie();
            } while (cookie.equals(nonce.cookie));
            this.cookiePair = new CookiePair(cookie, nonce.cookie);
        }

        // In the case of the responder, send client-hello
        if (this.role == 'responder') {
            const message: saltyrtc.messages.ClientHello = {
                type: 'client-hello',
                key: this.permanentKey.publicKeyBytes.buffer,
            };
            const packet: Uint8Array = this.buildPacket(message, Signaling.SALTYRTC_ADDR_SERVER, false);
            console.debug(this.logTag, 'Sending client-hello');
            this.ws.send(packet);
        }

        { // Send client-auth

            const message: saltyrtc.messages.ClientAuth = {
                type: 'client-auth',
                your_cookie: this.cookiePair.theirs.asArrayBuffer(),
            };
            const packet: Uint8Array = this.buildPacket(message, Signaling.SALTYRTC_ADDR_SERVER);
            console.debug(this.logTag, 'Sending client-auth');
            this.ws.send(packet);
        }

        { // Receive server-auth

            // Wait for message
            const bytes: Uint8Array = await this.recvMessageData();

            // Decrypt message
            const box = Box.fromUint8Array(bytes, nacl.box.nonceLength);
            const decrypted = this.permanentKey.decrypt(box, this.serverKey);

            // Now that the nonce integrity is guaranteed by decrypting,
            // create a `SignalingChannelNonce` instance.
            const nonce = SignalingChannelNonce.fromArrayBuffer(box.nonce.buffer);

            // Validate nonce and set proper address.
            if (this.role == 'initiator') {
                // Initiator
                this.address = Signaling.SALTYRTC_ADDR_INITIATOR;
                this.validateNonce(nonce, this.address, Signaling.SALTYRTC_ADDR_SERVER);
            } else {
                // Responder
                this.validateNonce(nonce, undefined, Signaling.SALTYRTC_ADDR_SERVER);
                if (nonce.destination > 0xff || nonce.destination < 0x02) {
                    console.error(this.logTag, 'Invalid nonce destination:', nonce.destination);
                    throw 'bad-nonce-destination';
                }
                this.address = nonce.destination;
                console.debug(this.logTag, 'Server assigned address', byteToHex(this.address));
                this.logTag = 'Responder[' + byteToHex(this.address) + ']:';
            }

            // Decode message
            // TODO: Maybe the address needs to be set *after* decoding the message?
            const message = this.decodeMessage(decrypted, 'server-auth') as saltyrtc.messages.ServerAuth;

            // Validate cookie
            const cookie = Cookie.fromArrayBuffer(message.your_cookie);
            if (!cookie.equals(this.cookiePair.ours)) {
                console.error(this.logTag, 'Bad cookie in server-auth message');
                console.debug(this.logTag, 'Their response:', message.your_cookie,
                                           ', our cookie:', this.cookiePair.ours);
                throw 'bad-cookie';
            }

            // Store responders
            if (this.role == 'initiator') {
                this.responders = new Map<number, Responder>();
                for (let id of message.responders) {
                    // Make sure that responder id is different from own id
                    if (id === this.address) {
                        console.error(this.logTag, 'Responder id matches own address.');
                        throw 'address-conflict';
                    }
                    this.responders.set(id, new Responder(id));
                    this.client.emit({type: 'new-responder', data: id});
                }
                console.debug(this.logTag, this.responders.size, 'responders connected');
            } else {
                this.initiatorConnected = message.initiator_connected;
                console.debug(this.logTag, 'Initiator', this.initiatorConnected ? '' : 'not', 'connected');
            }
        }
    }

    /**
     * Send a 'token' message to the initiator.
     */
    private sendToken(): void {
        const message: saltyrtc.messages.Token = {
            type: 'token',
            key: this.permanentKey.publicKeyBytes.buffer,
        };
        const packet: Uint8Array = this.buildPacket(message, Signaling.SALTYRTC_ADDR_INITIATOR);
        console.debug(this.logTag, 'Sending token');
        if (this.role === 'responder') {
            this.initiatorHandshakeState = 'token-sent';
        }
        this.ws.send(packet);
    }

    /**
     * Return a promise for the next WebSocket message event.
     */
    private recvMessageEvent(): Promise<MessageEvent> {
        return new Promise((resolve) => {
            const handler = (ev: MessageEvent) => {
                this.ws.removeEventListener('message', handler);
                resolve(ev);
            };
            this.ws.addEventListener('message', handler);
        });
    }

    /**
     * Like `recvMessageEvent`, but only return the `data` inside the message
     * event instead of the entire `MessageEvent` object.
     */
    private async recvMessageData(): Promise<Uint8Array> {
        const ev = await this.recvMessageEvent();
        return new Uint8Array(ev.data);
    }

    /**
     * Validate destination and optionally source of nonce.
     *
     * Possible exceptions:
     * - bad-nonce-source
     * - bad-nonce-destination
     */
    private validateNonce(nonce: SignalingChannelNonce, destination?: number, source?: number): void {
        // Validate destination
        if (destination !== undefined && nonce.destination !== destination) {
            console.error(this.logTag, 'Nonce destination is', nonce.destination, 'but we\'re', this.address);
            throw 'bad-nonce-destination';
        }

        // Validate source
        if (source !== undefined && nonce.source !== source) {
            console.error(this.logTag, 'Nonce source is', nonce.source, 'but should be', source);
            throw 'bad-nonce-source';
        }

        // TODO: sequence & overflow & cookie
    }

    /**
     * Decode the decrypted message and validate type.
     *
     * If the type is specified and does not match the message, throw an
     * exception.
     *
     * Possible exceptions:
     * - bad-message
     * - bad-message-type
     */
    private decodeMessage(data: Uint8Array, type?: saltyrtc.messages.MessageType): saltyrtc.Message {
        // Decode
        const msg = this.msgpackDecode(data) as saltyrtc.Message;

        if (typeof msg.type === 'undefined') {
            console.error(this.logTag, 'Failed to decode msgpack data.');
            throw 'bad-message';
        }

        // Validate type
        if (typeof type !== 'undefined' && msg.type !== type) {
            console.error(this.logTag, 'Invalid', type, 'message, bad type:', msg);
            throw 'bad-message-type';
        }

        return msg;
    }

    /**
     * Build and return a packet containing the specified message for the
     * specified receiver.
     */
    private buildPacket(message: saltyrtc.Message, receiver: number, encrypt=true): Uint8Array {
        // Choose proper sequence number
        let csn;
        if (receiver === Signaling.SALTYRTC_ADDR_SERVER) {
            csn = this.serverCombinedSequence.next();
        } else if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR) {
            csn = this.initiatorCombinedSequence.next();
        } else if (receiver >= 0x02 && receiver <= 0xff) {
            if (this.responder && this.responder.id === receiver) {
                csn = this.responder.combinedSequence.next();
            } else {
                csn = this.responders.get(receiver).combinedSequence.next();
            }
        } else {
            throw 'bad-receiver';
        }

        // Create nonce
        const nonce = new SignalingChannelNonce(
            this.cookiePair.ours, csn.overflow, csn.sequenceNumber, this.address, receiver);
        const nonceBytes = new Uint8Array(nonce.toArrayBuffer());

        // Encode message
        const data: Uint8Array = this.msgpackEncode(message);

        // Encrypt if desired
        if (encrypt !== false) {
            let box;
            if (receiver === Signaling.SALTYRTC_ADDR_SERVER) {
                box = this.permanentKey.encrypt(data, nonceBytes, this.serverKey);
            } else if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR) {
                if (message.type === 'token') {
                    box = this.authToken.encrypt(data, nonceBytes);
                } else if (message.type === 'key') {
                    box = this.permanentKey.encrypt(data, nonceBytes, this.initiatorPermanentKey);
                } else {
                    box = this.sessionKey.encrypt(data, nonceBytes, this.initiatorSessionKey);
                }
            } else if (receiver >= 0x02 && receiver <= 0xff) {
                let responder;
                if (this.responder && this.responder.id === receiver) {
                    responder = this.responder;
                } else {
                    responder = this.responders.get(receiver);
                }
                if (message.type === 'key'){
                    box = this.permanentKey.encrypt(data, nonceBytes, responder.permanentKey);
                } else {
                    box = responder.keyStore.encrypt(data, nonceBytes, responder.sessionKey);
                }
            } else {
                throw 'bad-receiver';
            }
            return box.toUint8Array();
        } else {
            return concat(nonceBytes, data);
        }
    }

    /**
     * Get the session key of the peer.
     */
    private get peerSessionKey(): Uint8Array {
        if (this.role == 'initiator') {
            return this.responder.sessionKey;
        } else {
            return this.initiatorSessionKey;
        }
    }

    /**
     * Encrypt arbitrary data for the peer using the session keys.
     */
    public encryptData(data: ArrayBuffer, sdc: SecureDataChannel): Box {
        // Choose proper CSN
        let csn;
        if (this.role == 'initiator') {
            csn = this.responder.combinedSequence.next();
        } else {
            csn = this.initiatorCombinedSequence.next();
        }

        // Create nonce
        const nonce = new DataChannelNonce(
            this.cookiePair.ours,
            sdc.id,
            csn.overflow,
            csn.sequenceNumber
        );

        // Encrypt
        return this.sessionKey.encrypt(
            new Uint8Array(data),
            new Uint8Array(nonce.toArrayBuffer()),
            this.peerSessionKey
        );
    }

    /**
     * Decrypt data from the peer using the session keys.
     */
    public decryptData(box: Box): ArrayBuffer {
        const decryptedBytes = this.sessionKey.decrypt(box, this.peerSessionKey);

        // We need to return an ArrayBuffer, but we can't directly return
        // `decryptedBytes.buffer` because the `Uint8Array` could be a view
        // into the underlying buffer. Therefore we return a view into the
        // ArrayBuffer instead.
        const start = decryptedBytes.byteOffset;
        const end = start + decryptedBytes.byteLength;
        return decryptedBytes.buffer.slice(start, end);
    }

    /**
     * Reset/close the connection.
     *
     * - Close WebSocket if still open
     * - Set `this.ws` to `null`
     * - Set `this.status` to `new`
     * - Reset the server combined sequence
     */
    private resetConnection(closeCode: CloseCode = CloseCode.ClosingNormal): void {
        this.state = 'new';
        this.serverCombinedSequence = new CombinedSequence();

        // Close WebSocket instance
        if (this.ws !== null) {
            console.debug(this.logTag, 'Disconnecting WebSocket (close code ' + closeCode + ')');
            this.ws.close(closeCode);
        }
        this.ws = null;

        // TODO: Close dc
    }

    /**
     * WebSocket onopen handler.
     */
    private onOpen = (ev: Event) => {
        console.info(this.logTag, 'Opened connection');
        this.state = 'server-handshake';
    };

    /**
     * WebSocket onerror handler.
     */
    private onError = (ev: ErrorEvent) => {
        console.error(this.logTag, 'General WebSocket error', ev);
        // TODO: Do we need to update the state here?
        this.client.emit({type: 'connection-error', data: ev});
    };

    /**
     * WebSocket onclose handler.
     */
    private onClose = (ev: CloseEvent) => {
        if (ev.code === CloseCode.Handover) {
            console.info(this.logTag, 'Closed WebSocket connection due to handover');
        } else {
            console.info(this.logTag, 'Closed WebSocket connection');
            this.state = 'closed';
            const log = (reason) => console.error(this.logTag, 'Server closed connection:', reason);
            switch (ev.code) {
                case CloseCode.GoingAway:
                    log('Server is being shut down');
                    break;
                case CloseCode.SubprotocolError:
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
                case CloseCode.Dropped:
                    log('Dropped by initiator');
                    break;
            }
            this.client.emit({type: 'connection-closed', data: ev});
        }
    };

    /**
     * Websocket onmessage handler during peer handshake phase.
     *
     * This event handler is registered after the server handshake is done,
     * and removed once the peer handshake is done.
     */
    private onPeerHandshakeMessage = (ev: MessageEvent) => {
        // Abort function
        const abort = () => {
            console.error(this.logTag, 'Resetting connection.');
            this.ws.removeEventListener('message', this.onPeerHandshakeMessage);
            this.resetConnection(CloseCode.ProtocolError);
            throw new Error('Aborting due to a protocol error');
        }

        // Decrypt function
        // The `otherKey` param may be undefined if the `keyStore` is an `AuthToken`
        const decrypt = (box: Box, keyStore: KeyStore | AuthToken, otherKey?: Uint8Array) => {
            try {
                return keyStore.decrypt(box, otherKey);
            } catch (err) {
                if (err === 'decryption-failed') {
                    console.error(this.logTag, 'Decryption failed.');
                    abort();
                } else {
                    throw err;
                }
            }
        }

        // Assert message type function
        const assertType = (message: saltyrtc.Message, type: saltyrtc.messages.MessageType) => {
            if (message.type !== type) {
                console.error(this.logTag, 'Expected message type "', type, '" but got "', message.type, '".');
                abort();
            }
        }

        const buffer = ev.data;
        const bytes = new Uint8Array(buffer);

        // Peek at nonce.
        // Important: At this point the nonce is not yet authenticated,
        // so don't trust it yet!
        const unsafeNonce = SignalingChannelNonce.fromArrayBuffer(buffer.slice(0, 24));
        this.validateNonce(unsafeNonce, this.address);

        // Dispatch messages according to source.
        // Note that we can trust the source flag as soon as we have decrypted
        // (and thus authenticated) the message.
        if (unsafeNonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
            // Decrypt message
            const box = Box.fromUint8Array(bytes, nacl.box.nonceLength);
            const decrypted = this.permanentKey.decrypt(box, this.serverKey);

            // Decode message
            const message = this.decodeMessage(decrypted);
            console.debug(this.logTag, 'Received', message.type);

            if (message.type === 'new-responder') {
                // TODO: What if we're not an initiator?

                // A new responder wants to connect. Store id.
                const id = (message as saltyrtc.messages.NewResponder).id;
                if (!this.responders.has(id)) {
                    if (id === this.address) {
                        console.error(this.logTag, 'Responder id matches own address.');
                        abort();
                    }
                    this.responders.set(id, new Responder(id));
                    this.client.emit({type: 'new-responder', data: id});
                } else {
                    console.warn(this.logTag, 'Got new-responder message for an already known responder.');
                }
            } else if (message.type === 'new-initiator') {
                // TODO: What if we're not a responder?
                // A new initiator connected.
                this.initiatorConnected = true;
                this.sendToken();
            } else {
                console.warn(this.logTag, 'Ignored server message of type "', message.type, '".');
            }
        } else if (unsafeNonce.source === Signaling.SALTYRTC_ADDR_INITIATOR) {
            // We're the responder.
            if (this.role !== 'responder') {
                console.error('Source byte from initiator, but we\'re not the responder.');
                abort();
            }

            // Construct a box
            const box = Box.fromUint8Array(bytes, nacl.box.nonceLength);

            // Decrypt. The 'key' messages are encrypted with a different key than the rest.
            let decrypted;
            if (this.initiatorHandshakeState == 'token-sent') {
                // If the state is 'token-sent', then we expect a 'key' message,
                // encrypted with the permanent key.
                decrypted = decrypt(box, this.permanentKey, this.initiatorPermanentKey);
            } else {
                // Otherwise, it must be encrypted with the session key.
                decrypted = decrypt(box, this.sessionKey, this.initiatorSessionKey);
            }

            // Get nonce
            const nonce = SignalingChannelNonce.fromArrayBuffer(box.nonce.buffer);

            // Decode message
            const message: saltyrtc.Message = this.decodeMessage(decrypted);
            console.debug(this.logTag, 'Received', message.type);

            if (this.initiatorHandshakeState == 'token-sent') {
                assertType(message, 'key');

                // We got a public session key from the initiator. Store...
                this.initiatorSessionKey = new Uint8Array((message as saltyrtc.messages.Key).key);

                // ...and reply with our own session key.
                this.sessionKey = new KeyStore();
                const replyMessage: saltyrtc.messages.Key = {
                    type: 'key',
                    key: this.sessionKey.publicKeyBytes.buffer,
                };
                const packet: Uint8Array = this.buildPacket(replyMessage, Signaling.SALTYRTC_ADDR_INITIATOR);
                console.debug(this.logTag, 'Sending key');
                this.ws.send(packet);
                this.initiatorHandshakeState = 'key-sent';
            } else if (this.initiatorHandshakeState == 'key-sent') {
                assertType(message, 'auth');

                // Verify the cookie
                const cookie = Cookie.fromArrayBuffer((message as saltyrtc.messages.Auth).your_cookie);
                if (!cookie.equals(this.cookiePair.ours)) {
                    console.error(this.logTag, 'Invalid cookie in auth message.');
                    console.debug(this.logTag, 'Theirs:', cookie.bytes);
                    console.debug(this.logTag, 'Ours:', this.cookiePair.ours.bytes);
                    abort();
                }

                // OK!
                console.debug(this.logTag, 'Initiator authenticated.');

                // Deregister handshake
                console.info(this.logTag, 'Initiator handshake done.');

                // Update state
                // TODO: This state change is not really needed
                this.initiatorHandshakeState = 'auth-received';

                // Ensure that cookies are different
                if (nonce.cookie.equals(this.cookiePair.ours)) {
                    console.error(this.logTag, 'Their cookie and our cookie are the same.');
                    abort();
                }

                // Respond with our own auth message
                const replyMessage: saltyrtc.messages.Auth = {
                    type: 'auth',
                    your_cookie: nonce.cookie.asArrayBuffer(),
                };
                const packet: Uint8Array = this.buildPacket(replyMessage, Signaling.SALTYRTC_ADDR_INITIATOR);
                console.debug(this.logTag, 'Sending auth');
                this.ws.send(packet);

                // Update message handler
                this.ws.removeEventListener('message', this.onPeerHandshakeMessage);
                this.ws.addEventListener('message', this.onPeerMessage);

                // We're connected!
                this.state = 'open';
                this.onConnected();
            }
        } else if (unsafeNonce.source >= 0x02 && unsafeNonce.source <= 0xff) {
            // We're the initiator.
            if (this.role !== 'initiator') {
                console.error('Source byte from responder, but we\'re not the initiator.');
                abort();
            }

            // Get responder
            const responder = this.responders.get(unsafeNonce.source);
            if (typeof responder === 'undefined') {
                console.error(this.logTag, 'Received message from unknown responder (', unsafeNonce.source, ')');
                return;
            }

            // In order to know what key to use for decryption, we need to check the state of the responder.
            if (responder.state === 'new') {
                {
                    // If the state is 'new', then we expect a 'token' message,
                    // encrypted with the authentication token.
                    const box = Box.fromUint8Array(bytes, nacl.secretbox.nonceLength);
                    const decrypted = decrypt(box, this.authToken);
                    const message = this.decodeMessage(decrypted) as saltyrtc.messages.Token;
                    console.debug(this.logTag, 'Received', message.type);
                    assertType(message, 'token');

                    // Store responder permanent key
                    responder.permanentKey = new Uint8Array(message.key);
                    responder.state = 'token-received';
                }
                {
                    // Send key
                    const message: saltyrtc.messages.Key = {
                        type: 'key',
                        key: responder.keyStore.publicKeyBytes.buffer,
                    };
                    const packet: Uint8Array = this.buildPacket(message, responder.id);
                    console.debug(this.logTag, 'Sending key');
                    this.ws.send(packet);
                }
            } else if (responder.state === 'token-received') {
                {
                    // If the state is 'token-received', we expect a 'key' message,
                    // encrypted with our permanent key.
                    const box = Box.fromUint8Array(bytes, nacl.box.nonceLength);
                    const decrypted = decrypt(box, this.permanentKey, responder.permanentKey);
                    const message = this.decodeMessage(decrypted) as saltyrtc.messages.Key;
                    console.debug(this.logTag, 'Received', message.type);
                    assertType(message, 'key');

                    // Store responder session key
                    responder.sessionKey = new Uint8Array(message.key);
                    responder.state = 'key-received';
                }
                {
                    // Ensure that cookies are different
                    const nonce = unsafeNonce;
                    if (nonce.cookie.equals(this.cookiePair.ours)) {
                        console.error(this.logTag, 'Their cookie and our cookie are the same.');
                        abort();
                    }

                    // Send auth
                    const message: saltyrtc.messages.Auth = {
                        type: 'auth',
                        your_cookie: nonce.cookie.asArrayBuffer(),
                    };
                    const packet: Uint8Array = this.buildPacket(message, responder.id);
                    console.debug(this.logTag, 'Sending auth');
                    this.ws.send(packet);
                }
            } else if (responder.state === 'key-received') {
                // If the state is 'key-received', we expect an 'auth' message,
                // encrypted with our session key.
                const box = Box.fromUint8Array(bytes, nacl.box.nonceLength);
                const decrypted = decrypt(box, responder.keyStore, responder.sessionKey);
                const message = this.decodeMessage(decrypted) as saltyrtc.messages.Auth;
                console.debug(this.logTag, 'Received', message.type);
                assertType(message, 'auth');

                // Verify the cookie
                const cookie = Cookie.fromArrayBuffer((message as saltyrtc.messages.Auth).your_cookie);
                if (!cookie.equals(this.cookiePair.ours)) {
                    console.error(this.logTag, 'Invalid cookie in auth message.');
                    console.debug(this.logTag, 'Theirs:', cookie.bytes);
                    console.debug(this.logTag, 'Ours:', this.cookiePair.ours.bytes);
                    abort();
                }

                // Store responder id and session key
                const nonce = unsafeNonce;
                console.debug(this.logTag, 'Responder', nonce.source, 'authenticated.');
                this.responder = this.responders.get(nonce.source);
                this.responders.delete(nonce.source);
                this.sessionKey = responder.keyStore;

                // Drop all other responders
                console.debug(this.logTag, 'Dropping', this.responders.size, 'other responders.');
                for (let id of this.responders.keys()) {
                    this.dropResponder(id);
                    this.responders.delete(id);
                }

                // Deregister handshake
                console.info(this.logTag, 'Responder handshake done.');
                this.ws.removeEventListener('message', this.onPeerHandshakeMessage);
                this.ws.addEventListener('message', this.onPeerMessage);

                // We're connected!
                this.state = 'open';
                this.onConnected();
            }
        } else {
            console.error(this.logTag, 'Invalid source byte in nonce:', unsafeNonce.source);
            abort();
        }
    };

    /**
     * We're connected!
     */
    private onConnected = () => {
        this.client.emit({type: 'connected'});
    }

    /**
     * A p2p message was received.
     *
     * This handler is registered *after* the handshake is done.
     *
     * Note that although this method is called `onPeerMessage`, it's still
     * possible that server messages arrive, e.g. a `send-error` message.
     */
    private onPeerMessage = (ev: MessageEvent) => {
        console.info(this.logTag, 'Message received!');

        // Parse data
        const box = Box.fromUint8Array(new Uint8Array(ev.data), nacl.box.nonceLength);
        const nonce = SignalingChannelNonce.fromArrayBuffer(box.nonce.buffer);

        // Validate nonce (excluding source byte)
        this.validateNonce(nonce, this.address);

        let message;

        // Process server messages
        if (nonce.source == Signaling.SALTYRTC_ADDR_SERVER) {
            message = this.decryptServerMessage(box);
            switch (message.type) {
                case 'send-error':
                    throw 'not-yet-implemented';
                default:
                    console.error(this.logTag, 'Invalid server message type:', message.type);
            }
            return;

        // Process peer messages
        } else {

            // Make sure that a responder is defined
            if (this.role === 'initiator' && this.responder === null) {
                this.resetConnection(CloseCode.ProtocolError);
                throw new Error('Received peer message, but responder is null.')
            }

            // Validate source byte
            if (this.role === 'responder' && nonce.source !== Signaling.SALTYRTC_ADDR_INITIATOR) {
                console.warn(this.logTag, 'Received message from other responder. ' +
                                           'This is probably a server error.');
                return;
            }
            if (this.role === 'initiator' && nonce.source !== this.responder.id) {
                console.warn(this.logTag, 'Received message from responder '
                                          + byteToHex(nonce.source) + '. Ignoring.');
                this.dropResponder(nonce.source);
                return;
            }

            // Process peer messages
            message = this.decryptPeerMessage(box);
            switch (message.type) {
                case 'data':
                    const dataMessage = message as saltyrtc.messages.Data;
                    this.client.emit({type: 'data', data: dataMessage.data});
                    if (typeof dataMessage.data_type === 'string') {
                        this.client.emit({type: 'data:' + dataMessage.data_type, data: dataMessage.data});
                    }
                    break;
                case 'restart':
                    throw 'not-yet-implemented';
                default:
                    console.error(this.logTag, 'Invalid peer message type:', message.type);
            }
        }
    }

    /**
     * Decrypt and decode a P2P message.
     *
     * TODO: Separate cookie / csn per data channel.
     */
    public decryptPeerMessage(box: Box): saltyrtc.Message {
        try {
            let decrypted;
            if (this.role == 'initiator') {
                decrypted = this.sessionKey.decrypt(box, this.responder.sessionKey);
            } else {
                decrypted = this.sessionKey.decrypt(box, this.initiatorSessionKey);
            }
            return this.decodeMessage(decrypted);
        } catch(e) {
            if (e === 'decryption-failed') {
                const nonce = SignalingChannelNonce.fromArrayBuffer(box.nonce.buffer);
                throw new Error('Could not decrypt peer message from ' + byteToHex(nonce.source));
            } else {
                throw e;
            }
        }
    }

    /**
     * Decrypt and decode a server message.
     */
    public decryptServerMessage(box: Box): saltyrtc.Message {
        try {
            const decrypted = this.permanentKey.decrypt(box, this.serverKey);
            return this.decodeMessage(decrypted);
        } catch(e) {
            if (e === 'decryption-failed') {
                throw new Error('Could not decrypt server message');
            } else {
                throw e;
            }
        }
    }

    /**
     * Send a signaling data message to the peer, encrypted with the session key.
     */
    public sendSignalingData(data: saltyrtc.messages.Data) {
        if (this.state !== 'open') {
            console.error(this.logTag, 'Trying to send a message, but connection state is', this.state);
            throw 'bad-state';
        }

        // Determine peer address
        const peerAddress = this.role === 'responder' ? Signaling.SALTYRTC_ADDR_INITIATOR : this.responder.id;

        // Send message
        const packet: Uint8Array = this.buildPacket(data, peerAddress);
        console.debug(this.logTag, 'Sending', data.data_type, 'data message through', this.signalingChannel);
        switch (this.signalingChannel) {
            case 'websocket':
                this.ws.send(packet);
                break;
            case 'datachannel':
                this.dc.send(packet);
                break;
            default:
                throw new Error('Invalid signaling channel: ' + this.signalingChannel);
        }
    }

    /**
     * Initiate the handover from WebSocket to WebRTC DataChannel.
     *
     * Possible promise rejections errors:
     *
     * - connection-error: A data channel error occured.
     * - connection-closed: The data channel was closed.
     */
    public handover(pc: RTCPeerConnection): Promise<{}> {
            console.debug(this.logTag, 'Starting handover');

        // TODO (https://github.com/saltyrtc/saltyrtc-meta/issues/3): Negotiate channel id
        this.dc = pc.createDataChannel('saltyrtc', {
            id: 0,
            negotiated: true,
            ordered: true,
            protocol: this.ws.protocol,
        });

        return new Promise((resolve, reject) => {
            this.dc.onopen = (ev: Event) => {
                // Data channel is open.
                console.info(this.logTag, 'Handover to data channel finished');
                this.signalingChannel = 'datachannel';
                this.client.emit({type: 'handover'});

                // Close the websocket after a short delay.
                const linger_ms = 1000;
                window.setTimeout(() => {
                    this.ws.close(CloseCode.Handover);
                    resolve();
                }, linger_ms);
            };
            this.dc.onerror = (ev: Event) => {
                console.error(this.logTag, 'Data channel error:', ev);
                this.client.emit({type: 'connection-error', data: ev});
                reject('connection-error');
            };
            this.dc.onclose = (ev: Event) => {
                console.info(this.logTag, 'Closed DataChannel connection');
                this.client.emit({type: 'connection-closed', data: ev});
                reject('connection-closed');
            };
        });
    }

    /**
     * Send a drop-responder request to the server.
     */
    private dropResponder(responderId: number) {
        const message: saltyrtc.messages.DropResponder = {
            type: 'drop-responder',
            id: responderId,
        };
        const packet: Uint8Array = this.buildPacket(message, Signaling.SALTYRTC_ADDR_SERVER);
        console.debug(this.logTag, 'Sending drop-responder', byteToHex(responderId));
        this.ws.send(packet);
    }

}
