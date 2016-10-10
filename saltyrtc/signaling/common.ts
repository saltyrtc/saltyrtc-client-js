/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path='../saltyrtc.d.ts' />
/// <reference path='../types/RTCPeerConnection.d.ts' />
/// <reference path='../types/msgpack-lite.d.ts' />
/// <reference path='../types/tweetnacl.d.ts' />

import { KeyStore, AuthToken, Box } from "../keystore";
import { Cookie, CookiePair } from "../cookie";
import { SignalingChannelNonce, DataChannelNonce } from "../nonce";
import { CombinedSequence, NextCombinedSequence } from "../csn";
import { SecureDataChannel } from "../datachannel";
import { ProtocolError, InternalError } from "../exceptions";
import { concat, byteToHex } from "../utils";
import { isResponderId } from "./helpers";

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

/**
 * Signaling base class.
 */
export abstract class Signaling {
    static SALTYRTC_WS_SUBPROTOCOL = 'v0.saltyrtc.org';
    static SALTYRTC_ADDR_UNKNOWN = 0x00;
    static SALTYRTC_ADDR_SERVER = 0x00;
    static SALTYRTC_ADDR_INITIATOR = 0x01;

    // WebSocket
    protected host: string;
    protected port: number;
    protected protocol: string = 'wss';
    protected ws: WebSocket = null;

    // WebRTC / ORTC
    protected dc: RTCDataChannel = null;

    // Msgpack
    protected msgpackOptions: Object = {
        codec: msgpack.createCodec({binarraybuffer: true}),
    };

    // Connection state
    protected _state: saltyrtc.SignalingState = 'new';
    protected serverHandshakeState: 'new' | 'hello-sent' | 'auth-sent' | 'done' = 'new';
    public signalingChannel: saltyrtc.SignalingChannel = 'websocket';

    // Main class
    protected client: saltyrtc.SaltyRTC;

    // Keys
    protected serverKey: Uint8Array = null;
    protected permanentKey: KeyStore;
    protected sessionKey: KeyStore = null;
    protected authToken: AuthToken = null;
    protected peerTrustedKey: Uint8Array = null;

    // Signaling
    protected role: saltyrtc.SignalingRole = null;
    protected logTag: string = 'Signaling:';
    protected address: number = Signaling.SALTYRTC_ADDR_UNKNOWN;
    protected cookiePair: CookiePair = null;
    protected serverCsn = new CombinedSequence();

    /**
     * Create a new signaling instance.
     */
    constructor(client: saltyrtc.SaltyRTC, host: string, port: number,
                permanentKey: KeyStore, peerTrustedKey?: Uint8Array) {
        this.client = client;
        this.permanentKey = permanentKey;
        this.host = host;
        this.port = port;
        if (peerTrustedKey !== undefined) {
            this.peerTrustedKey = peerTrustedKey;
        }
    }

    /**
     * Register a signaling state change.
     *
     * TODO: Regular methods would probably be better.
     */
    public setState(newState: saltyrtc.SignalingState): void {
        this._state = newState;

        // Notify listeners
        this.client.emit({type: 'state-change', data: newState});
    }

    /**
     * Return current state.
     */
    public getState(): saltyrtc.SignalingState {
        return this._state;
    }

    /**
     * Return the public permanent key as Uint8Array.
     */
    public get permanentKeyBytes(): Uint8Array {
        return this.permanentKey.publicKeyBytes;
    }

    /**
     * Return the auth token as Uint8Array, or null if no auth token is initialized.
     */
    public get authTokenBytes(): Uint8Array {
        if (this.authToken !== null) {
            return this.authToken.keyBytes;
        }
        return null;
    }

    /**
     * Return the peer permanent key as Uint8Array.
     */
    public get peerPermanentKeyBytes(): Uint8Array {
        return this.getPeerPermanentKey();
    }

    /**
     * Encode msgpack data.
     */
    protected msgpackEncode(data: Object) {
        return msgpack.encode(data, this.msgpackOptions);
    }

    /**
     * Decode msgpack data.
     */
    protected msgpackDecode(data: Uint8Array) {
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

        this.setState('closed');
    }

    /**
     * Return connection path for websocket.
     */
    protected abstract getWebsocketPath(): string;

    /**
     * Open a new WebSocket connection to the signaling server.
     */
    protected initWebsocket() {
        const url = this.protocol + '://' + this.host + ':' + this.port + '/';
        const path = this.getWebsocketPath();
        this.ws = new WebSocket(url + path, Signaling.SALTYRTC_WS_SUBPROTOCOL);

        // Set binary type
        this.ws.binaryType = 'arraybuffer';

        // Set event handlers
        this.ws.addEventListener('open', this.onOpen);
        this.ws.addEventListener('error', this.onError);
        this.ws.addEventListener('close', this.onClose);
        this.ws.addEventListener('message', this.onMessage);

        // Store connection on instance
        this.setState('ws-connecting');
        console.debug(this.logTag, 'Opening WebSocket connection to', url + path);
    }

    /**
     * WebSocket onopen handler.
     */
    protected onOpen = (ev: Event) => {
        console.info(this.logTag, 'Opened connection');
        this.setState('server-handshake');
    };

    /**
     * WebSocket onerror handler.
     */
    protected onError = (ev: ErrorEvent) => {
        console.error(this.logTag, 'General WebSocket error', ev);
        // TODO: Do we need to update the state here?
        this.client.emit({type: 'connection-error', data: ev});
    };

    /**
     * WebSocket onclose handler.
     */
    protected onClose = (ev: CloseEvent) => {
        if (ev.code === CloseCode.Handover) {
            console.info(this.logTag, 'Closed WebSocket connection due to handover');
        } else {
            console.info(this.logTag, 'Closed WebSocket connection');
            this.setState('closed');
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

    protected onMessage = (ev: MessageEvent) => {
        console.debug(this.logTag, 'New ws message (' + (ev.data as ArrayBuffer).byteLength + ' bytes)');
        try {
            // Parse buffer
            const box: Box = Box.fromUint8Array(new Uint8Array(ev.data), SignalingChannelNonce.TOTAL_LENGTH);

            // Parse nonce
            const nonce: SignalingChannelNonce = SignalingChannelNonce.fromArrayBuffer(box.nonce.buffer);

            // Dispatch message
            switch (this.getState()) {
                case 'server-handshake':
                    this.onServerHandshakeMessage(box, nonce);
                    break;
                case 'peer-handshake':
                    this.onPeerHandshakeMessage(box, nonce);
                    break;
                case 'open':
                    this.onPeerMessage(box, nonce);
                    break;
                default:
                    console.warn(this.logTag, 'Received message in', this.getState(), 'signaling state. Ignoring.');
            }
        } catch(e) {
            if (e instanceof ProtocolError) {
                console.warn(this.logTag, 'Protocol error. Resetting connection.');
                this.resetConnection(CloseCode.ProtocolError);
            } else if (e instanceof InternalError) {
                console.warn(this.logTag, 'Internal error. Resetting connection.');
                this.resetConnection(CloseCode.InternalError);
            }
            throw e;
        }
    };

    /**
     * Handle messages received during server handshake.
     */
    protected onServerHandshakeMessage(box: Box, nonce: SignalingChannelNonce): void {
        // Decrypt if necessary
        let payload: Uint8Array;
        if (this.serverHandshakeState === 'new') {
            // The very first message is unencrypted
            payload = box.data;
        } else {
            // Later, they're encrypted with our permanent key and the server key
            payload = this.permanentKey.decrypt(box, this.serverKey);
        }

        // Handle message
        const msg: saltyrtc.Message = this.decodeMessage(payload, 'server handshake');
        switch (this.serverHandshakeState) {
            case 'new':
                // Expect server-hello
                if (msg.type !== 'server-hello') {
                    throw new ProtocolError('Expected server-hello message, but got ' + msg.type);
                }
                console.debug(this.logTag, 'Received server-hello');
                // TODO: Validate nonce
                this.handleServerHello(msg as saltyrtc.messages.ServerHello, nonce);
                this.sendClientHello();
                this.sendClientAuth();
                break;
            case 'hello-sent':
                throw new ProtocolError('Received ' + msg.type + ' message before sending client-auth');
            case 'auth-sent':
                // Expect server-auth
                if (msg.type !== 'server-auth') {
                    throw new ProtocolError('Expected server-auth message, but got ' + msg.type);
                }
                console.debug(this.logTag, "Received server-auth");
                // TODO: Validate nonce
                this.handleServerAuth(msg as saltyrtc.messages.ServerAuth, nonce);
                break;
            case 'done':
                throw new InternalError('Received server handshake message even though ' +
                    'server handshake state is set to \'done\'');
            default:
                throw new InternalError('Unknown server handshake state: ' + this.serverHandshakeState);
        }

        // Check if we're done yet
        if (this.serverHandshakeState === 'done') {
            this.setState('peer-handshake');
            console.debug(this.logTag, 'Server handshake done');
            this.initPeerHandshake();
        }
    }

    /**
     * Handle messages received during peer handshake.
     */
    protected abstract onPeerHandshakeMessage(box: Box, nonce: SignalingChannelNonce): void;

    /**
     * Handle messages received from peer *after* the handshake is done.
     *
     * Note that although this method is called `onPeerMessage`, it's still
     * possible that server messages arrive, e.g. a `send-error` message.
     */
    protected onPeerMessage(box: Box, nonce: SignalingChannelNonce): void {
        // TODO: Validate nonce?

        let msg: saltyrtc.Message;

        // Process server messages
        if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
            msg = this.decryptServerMessage(box);
            // TODO: Catch problems?

            if (msg.type === 'send-error') {
                this.handleSendError(msg as saltyrtc.messages.SendError);
            } else {
                console.warn(this.logTag, 'Invalid server message type:', msg.type);
            }

        // Process peer messages
        } else {
            try {
                msg = this.decryptPeerMessage(box, false);
            } catch (e) {
                if (e === 'decryption-failed') {
                    console.warn(this.logTag, 'Could not decrypt peer message from', byteToHex(nonce.source));
                    return;
                } else { throw e; }
            }

            switch (msg.type) {
                case 'data':
                    console.debug(this.logTag, 'Received data');
                    this.handleData(msg as saltyrtc.messages.Data);
                    break;
                case 'restart':
                    console.debug(this.logTag, 'Received restart');
                    this.handleRestart(msg as saltyrtc.messages.Restart);
                    break;
                default:
                    console.warn(this.logTag, 'Received message with invalid type from peer:', msg.type);
            }
        }
    }

    /**
     * Handle an incoming server-hello message.
     */
    protected handleServerHello(msg: saltyrtc.messages.ServerHello, nonce: SignalingChannelNonce): void {
        // Store server public key
        this.serverKey = new Uint8Array(msg.key);

        // Generate cookie
        let cookie: Cookie;
        do {
            cookie = new Cookie();
        } while (cookie.equals(nonce.cookie));
        this.cookiePair = new CookiePair(cookie, nonce.cookie);
    }

    /**
     * Send a client-hello message to the server.
     */
    protected abstract sendClientHello(): void;

    /**
     * Send a client-auth message to the server.
     */
    protected sendClientAuth(): void {
        const message: saltyrtc.messages.ClientAuth = {
            type: 'client-auth',
            your_cookie: this.cookiePair.theirs.asArrayBuffer(),
        };
        const packet: Uint8Array = this.buildPacket(message, Signaling.SALTYRTC_ADDR_SERVER);
        console.debug(this.logTag, 'Sending client-auth');
        this.ws.send(packet);
        this.serverHandshakeState = 'auth-sent';
    }

    /**
     * Handle an incoming server-auth message.
     */
    protected abstract handleServerAuth(msg: saltyrtc.messages.ServerAuth, nonce: SignalingChannelNonce): void;

    /**
     * Initialize the peer handshake.
     */
    protected abstract initPeerHandshake(): void;

    /**
     * Handle an incoming data message.
     */
    protected handleData(msg: saltyrtc.messages.Data): void {
        this.client.emit({type: 'data', data: msg.data});
        if (typeof msg.data_type === 'string') {
            this.client.emit({type: 'data:' + msg.data_type, data: msg.data});
        }
    }

    /**
     * Handle an incoming restart message.
     */
    protected handleRestart(msg: saltyrtc.messages.Restart): void {
        throw new ProtocolError('Restart messages not yet implemented');
    }

    /**
     * Handle an incoming send-error message.
     */
    protected handleSendError(msg: saltyrtc.messages.SendError): void {
        throw new ProtocolError('Send error messages not yet implemented');
    }

    /**
     * Return the next CSN for the specified receiver.
     *
     * May throw a `ProtocolError`.
     */
    protected abstract getNextCsn(receiver: number): NextCombinedSequence;

    /**
     * Validate destination and optionally source of nonce.
     *
     * Possible exceptions:
     * - bad-nonce-source
     * - bad-nonce-destination
     */
    protected validateNonce(nonce: SignalingChannelNonce, destination?: number, source?: number): void {
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
     * Validate a repeated cookie in an *incoming* Auth / ServerAuth message.
     *
     * If it does not equal our own cookie, throw a ProtocolError.
     */
    protected validateRepeatedCookie(msg: {your_cookie: ArrayBuffer}): void {
        const repeatedCookie = Cookie.fromArrayBuffer(msg.your_cookie);
        if (!repeatedCookie.equals(this.cookiePair.ours)) {
            console.debug(this.logTag, 'Their cookie:', repeatedCookie.bytes);
            console.debug(this.logTag, 'Our cookie:', this.cookiePair.ours.bytes);
            throw new ProtocolError('Peer repeated cookie does not match our cookie');
        }
    }

    /**
     * Decode the decrypted message and validate type.
     *
     * If decoding fails, throw a `ProtocolError`.
     *
     * If `enforce` is set to true and the actual type does not match the
     * expected type, throw a `ProtocolError`.
     */
    protected decodeMessage(data: Uint8Array,expectedType: saltyrtc.messages.MessageType | string,
                            enforce=false): saltyrtc.Message {
        // Decode
        const msg = this.msgpackDecode(data) as saltyrtc.Message;

        if (msg.type === undefined) {
            throw new ProtocolError('Malformed ' + expectedType + ' message: Failed to decode msgpack data.');
        }

        // Validate type
        if (enforce && expectedType !== undefined && msg.type !== expectedType) {
            throw new ProtocolError('Invalid ' + expectedType + ' message, bad type: ' + msg);
        }

        return msg;
    }

    /**
     * Build and return a packet containing the specified message for the
     * specified receiver.
     *
     * Returns encrypted msgpacked bytes, ready to send.
     *
     * May throw a `ProtocolError`.
     */
    protected buildPacket(message: saltyrtc.Message, receiver: number, encrypt=true): Uint8Array {
        // Choose proper sequence number
        const csn: NextCombinedSequence = this.getNextCsn(receiver);

        // Create nonce
        const nonce = new SignalingChannelNonce(
            this.cookiePair.ours, csn.overflow, csn.sequenceNumber, this.address, receiver);
        const nonceBytes = new Uint8Array(nonce.toArrayBuffer());

        // Encode message
        const data: Uint8Array = this.msgpackEncode(message);

        // Non encrypted messages can be created by concatenation
        if (encrypt === false) {
            return concat(nonceBytes, data);
        }

        // Otherwise, encrypt packet
        let box;
        if (receiver === Signaling.SALTYRTC_ADDR_SERVER) {
            box = this.encryptForServer(data, nonceBytes);
        } else if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR || isResponderId(receiver)) {
            box = this.encryptForPeer(receiver, message.type, data, nonceBytes);
        } else {
            throw new ProtocolError('Bad receiver byte: ' + receiver);
        }
        return box.toUint8Array();
    }

    /**
     * Encrypt data for the server.
     */
    protected encryptForServer(payload: Uint8Array, nonceBytes: Uint8Array): Box {
        return this.permanentKey.encrypt(payload, nonceBytes, this.serverKey);
    }

    /**
     * Encrypt data for the specified peer.
     */
    protected abstract encryptForPeer(receiver: number, messageType: string,
                                      payload: Uint8Array, nonceBytes: Uint8Array): Box;

    /**
     * Get the address of the peer.
     *
     * May return null if peer is not yet set.
     */
    protected abstract getPeerAddress(): number;

    /**
     * Get the session key of the peer.
     *
     * May return null if peer is not yet set.
     */
    protected abstract getPeerSessionKey(): Uint8Array;

    /**
     * Get the permanent key of the peer.
     *
     * May return null if peer is not yet set.
     */
    protected abstract getPeerPermanentKey(): Uint8Array;

    /**
     * Encrypt arbitrary data for the peer using the session keys.
     */
    public encryptData(data: ArrayBuffer, sdc: SecureDataChannel): Box {
        // Choose proper CSN
        let csn: NextCombinedSequence;
        try {
            csn = this.getNextCsn(this.getPeerAddress());
        } catch(e) {
            if (e instanceof ProtocolError) {
                this.resetConnection(CloseCode.ProtocolError);
                return null;
            }
            throw e;
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
            this.getPeerSessionKey()
        );
    }

    /**
     * Decrypt data from the peer using the session keys.
     */
    public decryptData(box: Box): ArrayBuffer {
        const decryptedBytes = this.sessionKey.decrypt(box, this.getPeerSessionKey());

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
    protected resetConnection(closeCode: CloseCode = CloseCode.ClosingNormal): void {
        this.setState('new');
        this.serverCsn = new CombinedSequence();

        // Close WebSocket instance
        if (this.ws !== null) {
            console.debug(this.logTag, 'Disconnecting WebSocket (close code ' + closeCode + ')');
            this.ws.close(closeCode);
        }
        this.ws = null;

        // TODO: Close dc
    }

    /**
     * Decrypt and decode a P2P message, encrypted with the session key.
     *
     * When `convertErrors` is set to `true`, decryption errors will be
     * converted to a `ProtocolError`.
     *
     * TODO: Separate cookie / csn per data channel.
     */
    public decryptPeerMessage(box: Box, convertErrors=true): saltyrtc.Message {
        try {
            const decrypted = this.sessionKey.decrypt(box, this.getPeerSessionKey());
            return this.decodeMessage(decrypted, 'peer');
        } catch(e) {
            if (convertErrors === true && e === 'decryption-failed') {
                const nonce = SignalingChannelNonce.fromArrayBuffer(box.nonce.buffer);
                throw new ProtocolError('Could not decrypt peer message from ' + byteToHex(nonce.source));
            } else { throw e; }
        }
    }

    /**
     * Decrypt and decode a server message.
     */
    public decryptServerMessage(box: Box): saltyrtc.Message {
        try {
            const decrypted = this.permanentKey.decrypt(box, this.serverKey);
            return this.decodeMessage(decrypted, 'server');
        } catch(e) {
            if (e === 'decryption-failed') {
                throw new ProtocolError('Could not decrypt server message');
            } else { throw e; }
        }
    }

    /**
     * Send a signaling data message to the peer, encrypted with the session key.
     */
    public sendSignalingData(data: saltyrtc.messages.Data) {
        if (this.getState() !== 'open') {
            console.error(this.logTag, 'Trying to send a message, but connection state is', this.getState());
            throw 'bad-state';
        }

        // Send message
        const packet: Uint8Array = this.buildPacket(data, this.getPeerAddress());
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
            this.dc.onmessage = (ev: RTCMessageEvent) => {
                console.debug(this.logTag, 'New dc message (' + (ev.data as ArrayBuffer).byteLength + ' bytes)');
                try {
                    // Parse buffer
                    const box: Box = Box.fromUint8Array(new Uint8Array(ev.data), SignalingChannelNonce.TOTAL_LENGTH);

                    // Parse nonce
                    const nonce: SignalingChannelNonce = SignalingChannelNonce.fromArrayBuffer(box.nonce.buffer);

                    // Dispatch message
                    if (this.getState() != 'open') {
                        console.warn(this.logTag, 'Received dc message in', this.getState(), 'signaling state. Ignoring.');
                        return;
                    }
                    this.onPeerMessage(box, nonce);
                } catch(e) {
                    if (e instanceof ProtocolError) {
                        console.warn(this.logTag, 'Protocol error. Resetting connection.');
                        this.resetConnection(CloseCode.ProtocolError);
                    } else if (e instanceof InternalError) {
                        console.warn(this.logTag, 'Internal error. Resetting connection.');
                        this.resetConnection(CloseCode.InternalError);
                    }
                    throw e;
                }
            };
        });
    }

}
