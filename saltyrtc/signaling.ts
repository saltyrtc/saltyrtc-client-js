/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path='messages.d.ts' />
/// <reference path='types/RTCPeerConnection.d.ts' />
/// <reference path='types/msgpack-lite.d.ts' />

import { Session } from "./session";
import { KeyStore, Box } from "./keystore";
import { SaltyRTC } from "./client";
import { SignalingChannelNonce as Nonce } from "./nonce";
import { concat } from "./utils";

var nacl: any; // TODO

/**
 * Possible states for SaltyRTC connection.
 */
export const enum State {
    // Websocket is connecting
    Connecting = 0,
    // Websocket is open
    Open,
    // Websocket is closing
    Closing,
    // Websocket is closed
    Closed,
    // Status is unknown
    Unknown = 99
}

interface SignalingMessage {
    type: 'hello-client' | 'reset' | 'offer' | 'candidate',
    session?: string,
    data?: any; // TODO: type
}

/**
 * Signaling class.
 *
 * Note: This class currently assumes the side of the initiator. Responder will
 * need to be added later on.
 */
export class Signaling {
    static CONNECT_MAX_RETRIES = 10;
    static CONNECT_RETRY_INTERVAL = 10000;
    static SALTYRTC_WS_SUBPROTOCOL = 'saltyrtc-1.0';
    static SALTYRTC_ADDR_SERVER = 0x00;
    static SALTYRTC_ADDR_INITIATOR = 0x01;

    private $rootScope: any;

    // WebSocket
    private host: string;
    private port: number;
    private protocol: string = 'wss';
    private path: string = null;
    private ws: WebSocket = null;

    // Connection state
    private state: State = State.Unknown;

    // Main class
    private client: SaltyRTC;

    // Keystore and session
    private keyStore: KeyStore;
    private session: Session;

    // Signaling
    private cookie: Uint8Array = null;
    private serverCookie: Uint8Array = null;
    private PeerCookie: Uint8Array = null;
    private overflow: number = 0;
    private sequenceNumber: number = 0;
    private address: number = Signaling.SALTYRTC_ADDR_INITIATOR;
    private responders: number[] = [];

    constructor(client: SaltyRTC, host: string, port: number, keyStore: KeyStore, session: Session) {
        this.client = client;
        this.keyStore = keyStore;
        this.session = session;
        this.host = host;
        this.port = port;
    }

    /**
     * Open a connection to the signaling server and do the handshake.
     */
    public connect(): void {
        this.resetConnection();
        this.initWebsocket();
    }

    /**
     * Open a new WebSocket connection to the signaling server.
     */
    private initWebsocket() {
        let url = this.protocol + '://' + this.host + ':' + this.port + '/';
        let path = this.keyStore.publicKeyHex;
        let ws = new WebSocket(url + path, Signaling.SALTYRTC_WS_SUBPROTOCOL);

        // Set binary type
        ws.binaryType = 'arraybuffer';

        // Set event handlers
        ws.addEventListener('open', this.onOpen);
        ws.addEventListener('error', this.onError);
        ws.addEventListener('close', this.onClose);

        // We assign the handshake method to the message event listener directly
        // to make sure that we don't miss any message.
        ws.addEventListener('message', this.handshake);

        // Store connection on instance
        this.state = State.Connecting;
        console.debug('Signaling: Opening WebSocket connection to path', path);
        this.ws = ws;
    }

    /**
     * Do a full server- and p2p-handshake.
     *
     * This method is not invoked directly, but instead used as callback for
     * the `onMessage` event.
     */
    private async handshake(ev: MessageEvent) {
        this.ws.removeEventListener('message', this.handshake);
        await this.serverHandshake(ev.data);
        await this.initiatorHandshake();
    }

    /**
     * Do the server handshake.
     *
     * The `buffer` argument contains the `server-hello` packet.
     */
    private async serverHandshake(buffer: ArrayBuffer): Promise<void> {

        { // Process server-hello

            // First packet is unencrypted. Decode it directly.
            let nonce = Nonce.fromArrayBuffer(buffer.slice(0, 24));
            let payload = new Uint8Array(buffer.slice(24));
            let serverHello = msgpack.decode(payload) as saltyrtc.ServerHello;

            // Validate nonce
            this.validateNonce(nonce, 0x00);

            // Validate data
            if (serverHello.type !== 'server-hello') {
                console.error('Signaling: Invalid server-hello message, bad type field:', serverHello);
                throw 'bad-message-type';
            }

            // Store server public key and cookie
            this.keyStore.otherKey = serverHello.key;
            this.serverCookie = nonce.cookie;
        }

        { // Generate cookie

            let cookie;
            do {
                cookie = nacl.randomBytes(24);
            } while (cookie === this.serverCookie);
            this.cookie = cookie;
        }

        { // Send client-auth

            let message: saltyrtc.ClientAuth = {
                type: 'client-auth',
                your_cookie: this.serverCookie,
            };
            let packet: Uint8Array = this.buildPacket(message, Signaling.SALTYRTC_ADDR_SERVER);
            this.ws.send(packet);
        }

        { // Receive server-auth

            let packet = await this.recvMessage(Signaling.SALTYRTC_ADDR_SERVER, 'server-auth');
            let message = packet.message as saltyrtc.ServerAuth;

            // Validate cookie
            if (message.your_cookie != this.cookie) {
                console.error('Signaling: Bad cookie in server-auth message');
                console.debug('Their response:', message.your_cookie, ', my cookie:', this.cookie);
                throw 'bad-cookie';
            }

            // Store responders
            this.responders = message.responders;
        }
    }

    /**
     * Do the initiator p2p handshake.
     */
    private async initiatorHandshake(): Promise<void> {
    }

    /**
     * Return a promise for the next WebSocket message event.
     */
    private recvMessageEvent(): Promise<MessageEvent> {
        return new Promise((resolve) => {
            function handler(ev: MessageEvent) {
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
        let ev = await this.recvMessageEvent();
        return new Uint8Array(ev.data);
    }

    /**
     * Wait for the next WebSocket message. When it arrives, retrieve the data,
     * decrypt it, validate it and return the deserialized MsgPack object as
     * well as the nonce.
     *
     * If the address type and message type don't match, or of nonce validation
     * fails, the promise is rejected.
     */
    private async recvMessage(source: number,
                              type?: saltyrtc.MessageType)
                              : Promise<{message: saltyrtc.Message, nonce: Nonce}> {
        // Wait for message
        let bytes: Uint8Array = await this.recvMessageData();

        // Validate length
        if (bytes.byteLength <= 24) {
            console.error('Signaling: Received message with only', bytes.byteLength, 'bytes length');
            throw 'bad-message-length';
        }

        // Return decoded message
        return this.decodePacket(bytes, source, type);
    }

    /**
     * Validate length, source and destination of nonce.
     */
    private validateNonce(nonce: Nonce, source: number): void {
        // Validate destination
        if (nonce.destination != this.address) {
            console.error('Signaling: Nonce destination is', nonce.destination, 'but we\'re', this.address);
            throw 'bad-nonce-destination';
        }

        // Validate source
        if (nonce.source != source) {
            console.error('Signaling: Nonce source is', nonce.source, 'but should be', source);
            throw 'bad-nonce-source';
        }

        // TODO: sequence & overflow
    }

    /**
     * Decrypt the packet, decode it and validate type and nonce.
     *
     * If the type is specified and does not match the message, throw an
     * exception.
     */
    private decodePacket(data: Uint8Array,
                         source: number,
                         type?: saltyrtc.MessageType)
                         : {message: saltyrtc.Message, nonce: Nonce} {
        // Decrypt
        let box = Box.fromArray(data);
        let raw = this.keyStore.decrypt(box);

        // Validate nonce
        let nonce = Nonce.fromArrayBuffer(box.nonce.buffer)
        this.validateNonce(nonce, source);

        // Decode
        let msg = msgpack.decode(raw) as saltyrtc.Message;

        // Validate type
        if (typeof type !== 'undefined' && msg.type !== type) {
            console.error('Signaling: Invalid', type, 'message, bad type field:', msg);
            throw 'bad-message-type';
        }

        return {message: msg, nonce: nonce};
    }

    /**
     * Build and return a packet containing the specified message for the
     * specified receiver.
     */
    private buildPacket(message: saltyrtc.Message, receiver: number): Uint8Array {
        // Create nonce
        let nonce = new Nonce(this.cookie, this.overflow, this.sequenceNumber,
                              this.address, receiver);
        let nonceBytes = new Uint8Array(nonce.toArrayBuffer());

        // Encode message
        let data = msgpack.encode(message);

        // Encrypt
        let box = this.keyStore.encrypt(data, nonceBytes);

        return box.toArray();
    }

    /**
     * Reset/close the connection.
     *
     * - Close WebSocket if still open
     * - Set `this.ws` to `null`
     * - Set `this.status` to `Unknown`
     * - Reset `this.sequenceNumber` to 0
     * - Clear the cache
     */
    private resetConnection(): void {
        let oldState = this.state;
        this.state = State.Unknown;
        this.sequenceNumber = 0;

        // Close WebSocket instance
        if (this.ws !== null && oldState === State.Open) {
            console.debug('Signaling: Disconnecting WebSocket');
            this.ws.close();
        }
        this.ws = null;
    }

    /**
     * WebSocket onopen handler.
     */
    private onOpen = (ev: Event) => {
        console.info('Signaling: Opened connection');
        this.state = State.Open;
        this.client.onConnected(ev);
    };

    /**
     * WebSocket onerror handler.
     */
    private onError = (ev: ErrorEvent) => {
        console.error('Signaling: General WebSocket error', ev);
        this.state = this.getStateFromSocket();
        this.client.onConnectionError(ev);
    };

    /**
     * WebSocket onclose handler.
     */
    private onClose = (ev: CloseEvent) => {
        console.info('Signaling: Closed connection');
        this.state = State.Closed;
        this.client.onConnectionClosed(ev);
    };

    /**
     * Websocket onmessage handler.
     */
    private onMessage = (ev: MessageEvent) => {
        console.debug('Signaling: Received message');
    };

    /**
     * Return state based on websocket `readyState` attribute.
     */
    private getStateFromSocket(): State {
        switch (this.ws.readyState) {
            case WebSocket.CONNECTING:
                return State.Connecting;
            case WebSocket.OPEN:
                return State.Open;
            case WebSocket.CLOSING:
                return State.Closing;
            case WebSocket.CLOSED:
                return State.Closed;
        }
        return State.Unknown;
    }

}
