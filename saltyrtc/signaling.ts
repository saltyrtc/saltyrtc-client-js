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

interface CachedSignalingMessage {
    message: SignalingMessage,
    encrypt: boolean,
}

interface SignalingMessage {
    type: 'hello-client' | 'reset' | 'offer' | 'candidate',
    session?: string,
    data?: any; // TODO: type
}

export class Signaling {
    static CONNECT_MAX_RETRIES = 10;
    static CONNECT_RETRY_INTERVAL = 10000;
    static SALTYRTC_WS_SUBPROTOCOL = 'saltyrtc-1.0';

    private $rootScope: any;

    private saltyrtc: SaltyRTC;
    private keyStore: KeyStore;
    private session: Session;
    private host: string;
    private port: number;

    private state: State = State.Unknown;
    private path: string = null;
    private url: string = null;
    private cached: CachedSignalingMessage[];

    private ws: WebSocket = null;

    private responders: number[] = [];

    constructor(saltyrtc: SaltyRTC, host: string, port: number, keyStore: KeyStore, session: Session) {
        super();
        this.saltyrtc = saltyrtc;
        this.keyStore = keyStore;
        this.session = session;
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
        let url = 'wss://' + this.host + ':' + this.port + '/';
        let path = this.keyStore.getPublicKey();
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
        // Decode server-hello
        let bytes = new Uint8Array(buffer);
        if (bytes[0] !== saltyrtc.ReceiverByte.Server) {
            console.error('Signaling: Invalid server-hello message, bad receiver byte:', bytes[0]);
            throw 'bad-receiver-byte';
        }
        let serverHello = msgpack.decode(bytes.slice(1)) as saltyrtc.ServerHello;

        // Validate data
        if (serverHello.type !== 'server-hello') {
            console.error('Signaling: Invalid server-hello message, bad type field:', serverHello);
            throw 'bad-message-type';
        }

        // Store server public key
        this.keyStore.otherKey = serverHello.key;

        // Generate cookie
        let cookie;
        do {
            cookie = nacl.randomBytes(24);
        } while (cookie === serverHello.my_cookie);

        // Build client-auth packet
        let clientAuth: saltyrtc.ClientAuth = {
            type: 'client-auth',
            my_cookie: cookie,
            your_cookie: serverHello.my_cookie,
        };
        let box = this.keyStore.encrypt(msgpack.encode(clientAuth));

        // Send client-auth
        this.ws.send(this.buildPacket(box.toArray(), saltyrtc.ReceiverByte.Initiator));

        // Get server-auth
        let serverAuth = await this.recvMessage(saltyrtc.ReceiverByte.Server, 'server-auth') as saltyrtc.ServerAuth;

        // Validate cookie
        if (serverAuth.your_cookie != cookie) {
            console.error('Signaling: Bad cookie in server-auth message');
            console.debug('Their response:', serverAuth.your_cookie, ', my cookie:', cookie);
            throw 'bad-cookie';
        }

        this.responders = serverAuth.responders;
    }

    /**
     * Do the initiator p2p handshake.
     */
    private async initiatorHandshake(): Promise<void> {
        // TODO
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
     * optionally decrypt it, validate it and return the deserialized MsgPack
     * object.
     *
     * If the receiver byte and message type don't match, the promise is
     * rejected.
     */
    private async recvMessage(receiverByte: number,
                              type: saltyrtc.MessageType,
                              decrypt: boolean = true)
                              : Promise<saltyrtc.Message> {
        // Wait for message
        let raw: Uint8Array = await this.recvMessageData();

        // Validate receiver byte
        if (raw[0] !== receiverByte) {
            console.error('Signaling: Invalid', type, 'message, bad receiver byte:', receiverByte);
            throw 'bad-receiver-byte';
        }

        // Extract data
        let data: Uint8Array = raw.slice(1);

        // If necessary, decrypt
        if (decrypt !== false) {
            let box = Box.fromArray(data);
            data = this.keyStore.decrypt(box);
        }

        // Decode
        let msg = msgpack.decode(data) as saltyrtc.Message;

        // Validate type
        if (msg.type !== type) {
            console.error('Signaling: Invalid', type, 'message, bad type field:', msg);
            throw 'bad-message-type';
        }

        return msg;
    }

    /**
     * Build and return a packet containing the specified data, tagged with the
     * specified receiver byte.
     */
    private buildPacket(data: Uint8Array, receiverByte: number): Uint8Array {
        let buf = new Uint8Array(data.length + 1);
        buf[0] = receiverByte;
        buf.set(data, 1);
        return buf;
    }

    /**
     * Reset/close the connection.
     *
     * - Close WebSocket if still open
     * - Set `this.ws` to `null`
     * - Set `this.status` to `Unknown`
     * - Clear the cache
     */
    private resetConnection(): void {
        let oldState = this.state;
        this.state = State.Unknown;

        // Close WebSocket instance
        if (this.ws !== null && oldState === State.Open) {
            console.debug('Signaling: Disconnecting WebSocket');
            this.ws.close();
        }
        this.ws = null;

        // Clear cached messages
        this.clearCache();
    }

    /**
     * Clear cached messages
     */
    private clearCache(): void {
        this.cached = [];
    }

    /**
     * WebSocket onopen handler.
     */
    private onOpen = (ev: Event) => {
        console.info('Signaling: Opened connection');
        this.state = State.Open;
        this.saltyrtc.onConnected(ev);
    };

    /**
     * WebSocket onerror handler.
     */
    private onError = (ev: ErrorEvent) => {
        console.error('Signaling: General WebSocket error', ev);
        this.state = this.getStateFromSocket();
        this.saltyrtc.onConnectionError(ev);
    };

    /**
     * WebSocket onclose handler.
     */
    private onClose = (ev: CloseEvent) => {
        console.info('Signaling: Closed connection');
        this.state = State.Closed;
        this.saltyrtc.onConnectionClosed(ev);
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
