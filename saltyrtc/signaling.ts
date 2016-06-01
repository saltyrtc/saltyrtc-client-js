/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path='messages.d.ts' />
/// <reference path='types/RTCPeerConnection.d.ts' />
/// <reference path='types/msgpack-lite.d.ts' />
/// <reference path='types/tweetnacl.d.ts' />

import { Session } from "./session";
import { KeyStore, AuthToken, Box } from "./keystore";
import { SaltyRTC } from "./client";
import { SignalingChannelNonce as Nonce } from "./nonce";
import { concat } from "./utils";

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

interface Packet {
    message: saltyrtc.Message,
    nonce: Nonce,
}

class Responder {
    // Permanent key of the responder
    public permanentKey: Uint8Array = null;

    // Session key of the responder
    public sessionKey: Uint8Array = null;

    // Our own session keystore
    public keyStore: KeyStore = new KeyStore();

    // Cookies
    public ourCookie: Uint8Array = null;
    public theirCookie: Uint8Array = null;

    // Handshake state
    public state: 'new' | 'token-received' | 'key-received' = 'new';
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
    public state: State = State.Unknown;

    // Main class
    private client: SaltyRTC;

    // Keys
    private serverKey: Uint8Array = null;
    private permanentKey: KeyStore;
    private sessionKey: KeyStore = null;
    private authToken: AuthToken = new AuthToken();

    // Session
    private session: Session;

    // Signaling
    private cookie: Uint8Array = null;
    private serverCookie: Uint8Array = null;
    private PeerCookie: Uint8Array = null;
    private overflow: number = 0;
    private sequenceNumber: number = 0;
    private address: number = Signaling.SALTYRTC_ADDR_INITIATOR;
    private responders: Map<number, Responder> = new Map<number, Responder>();
    private responder: number = null;

    constructor(client: SaltyRTC, host: string, port: number, permanentKey: KeyStore, session: Session) {
        this.client = client;
        this.permanentKey = permanentKey;
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
        let path = this.permanentKey.publicKeyHex;
        let ws = new WebSocket(url + path, Signaling.SALTYRTC_WS_SUBPROTOCOL);

        // Set binary type
        ws.binaryType = 'arraybuffer';

        // Set event handlers
        ws.addEventListener('open', this.onOpen);
        ws.addEventListener('error', this.onError);
        ws.addEventListener('close', this.onClose);

        // We assign the handshake method to the message event listener directly
        // to make sure that we don't miss any message.
        ws.addEventListener('message', this.onInitServerHandshake);

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
    private async onInitServerHandshake(ev: MessageEvent) {
        this.ws.removeEventListener('message', this.onInitServerHandshake);
        await this.serverHandshake(ev.data);
        this.ws.addEventListener('message', this.onResponderHandshakeMessage);
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
            this.serverKey = serverHello.key;
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

            // Wait for message
            let bytes: Uint8Array = await this.recvMessageData();

            // Validate length
            if (bytes.byteLength <= 24) {
                console.error('Signaling: Received message with only', bytes.byteLength, 'bytes length');
                throw 'bad-message-length';
            }

            // Decrypt message
            let box = Box.fromArray(bytes, nacl.box.nonceLength);
            let decrypted = this.permanentKey.decrypt(box, this.serverKey);

            // Now that the nonce integrity is guaranteed by decrypting,
            // create a `Nonce` instance and validate it
            let nonce = Nonce.fromArrayBuffer(box.nonce.buffer)
            this.validateNonce(nonce, Signaling.SALTYRTC_ADDR_SERVER);

            // Decode message
            let message = this.decodeMessage(decrypted, 'server-auth') as saltyrtc.ServerAuth;

            // Validate cookie
            if (message.your_cookie != this.cookie) {
                console.error('Signaling: Bad cookie in server-auth message');
                console.debug('Their response:', message.your_cookie, ', my cookie:', this.cookie);
                throw 'bad-cookie';
            }

            // Store responders
            for (let id of message.responders) {
                this.responders.set(id, new Responder());
            }
        }
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
     * Validate destination and optionally source of nonce.
     *
     * Possible exceptions:
     * - bad-nonce-source
     * - bad-nonce-destination
     */
    private validateNonce(nonce: Nonce, source?: number): void {
        // Validate destination
        if (nonce.destination != this.address) {
            console.error('Signaling: Nonce destination is', nonce.destination, 'but we\'re', this.address);
            throw 'bad-nonce-destination';
        }

        // Validate source
        if (typeof source !== 'undefined' && nonce.source != source) {
            console.error('Signaling: Nonce source is', nonce.source, 'but should be', source);
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
    private decodeMessage(data: Uint8Array, type?: saltyrtc.MessageType): saltyrtc.Message {
        // Decode
        let msg = msgpack.decode(data) as saltyrtc.Message;

        if (typeof msg.type === 'undefined') {
            console.error('Signaling: Failed to decode msgpack data.');
            throw 'bad-message';
        }

        // Validate type
        if (typeof type !== 'undefined' && msg.type !== type) {
            console.error('Signaling: Invalid', type, 'message, bad type field:', msg);
            throw 'bad-message-type';
        }

        return msg;
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
        let box;
        if (receiver === 0x00) {
            box = this.permanentKey.encrypt(data, nonceBytes, this.serverKey);
        } else {
            throw 'not-yet-implemented';
        }

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
     * Websocket onmessage handler during responder handshake phase.
     *
     * This event handler is registered after the server handshake is done,
     * and removed once the responder handshake is done.
     */
    private onResponderHandshakeMessage = (ev: MessageEvent) => {
        console.debug('Signaling: Received message');

        // Abort function
        let abort = () => {
            console.error('Resetting connection.');
            this.ws.removeEventListener('message', this.onResponderHandshakeMessage);
            this.resetConnection();
            throw 'abort';
        }

        // Decrypt function
        // The `otherKey` param may be undefined if the `keyStore` is an `AuthToken`
        let decrypt = (box: Box, keyStore: KeyStore | AuthToken, otherKey?: Uint8Array) => {
            try {
                return keyStore.decrypt(box, otherKey);
            } catch (err) {
                if (err === 'decryption-failed') {
                    console.error('Signaling: Decryption failed.');
                    abort();
                } else {
                    throw err;
                }
            }
        }

        // Assert message type function
        let assertType = (message: saltyrtc.Message, type: saltyrtc.MessageType) => {
            if (message.type !== type) {
                console.error('Signaling: Expected message type "', type, '" but got "', message.type, '".');
                abort();
            }
        }

        let buffer = ev.data;

        // Peek at nonce.
        // Important: At this point the nonce is not yet authenticated,
        // so don't trust it yet!
        let unsafeNonce = Nonce.fromArrayBuffer(buffer.slice(0, 24));
        this.validateNonce(unsafeNonce);

        // Dispatch messages according to source.
        // Note that we can trust the source flag as soon as we have decrypted
        // (and thus authenticated) the message.
        if (unsafeNonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
            // Decrypt message
            let box = Box.fromArray(buffer, nacl.box.nonceLength);
            let decrypted = this.permanentKey.decrypt(box, this.serverKey);

            // Decode message
            let message = this.decodeMessage(decrypted);

            if (message.type === 'new-responder') {
                // A new responder wants to connect. Store id.
                let responderId = (message as saltyrtc.NewResponder).id;
                if (!this.responders.has(responderId)) {
                    this.responders.set(responderId, new Responder());
                } else {
                    console.warn('Signaling: Got new-responder message for an already known responder.');
                }
            } else {
                console.warn('Signaling: Ignored server message of type "', message.type, '".');
            }
        } else if (unsafeNonce.source > Signaling.SALTYRTC_ADDR_INITIATOR && unsafeNonce.source <= 0xFF) {
            // In order to know what key to use for decryption, we need to check the state of the responder.
            let responder = this.responders.get(unsafeNonce.source);
            if (typeof responder === 'undefined') {
                console.error('Signaling: Received message from unknown responder (', unsafeNonce.source, ')');
                return;
            }

            if (responder.state === 'new') {
                // If the state is 'new', then we expect a 'token' message,
                // encrypted with the authentication token.
                let box = Box.fromArray(buffer, nacl.secretbox.nonceLength);
                let decrypted = decrypt(box, this.authToken);
                let message = this.decodeMessage(decrypted) as saltyrtc.Token;
                assertType(message, 'token');

                // Store responder permanent key
                responder.permanentKey = message.key;
                responder.state = 'token-received';
            } else if (responder.state === 'token-received') {
                // If the state is 'token-received', we expect a 'key' message,
                // encrypted with our permanent key.
                let box = Box.fromArray(buffer, nacl.box.nonceLength);
                let decrypted = decrypt(box, this.permanentKey, responder.permanentKey);
                let message = this.decodeMessage(decrypted) as saltyrtc.Key;
                assertType(message, 'key');

                // Store responder session key and cookie
                let nonce = unsafeNonce;
                responder.sessionKey = message.key;
                responder.theirCookie = nonce.cookie;;
                responder.state = 'key-received';
            } else if (responder.state === 'key-received') {
                // If the state is 'key-received', we expect a 'auth' message,
                // encrypted with our session key.
                let box = Box.fromArray(buffer, nacl.box.nonceLength);
                let decrypted = decrypt(box, responder.keyStore, responder.sessionKey);
                let message = this.decodeMessage(decrypted) as saltyrtc.Auth;
                assertType(message, 'auth');

                // Verify the cookie
                let nonce = unsafeNonce;
                if (nonce.cookie !== responder.ourCookie) {
                    console.error('Signaling: Invalid cookie in auth message.');
                    abort();
                }

                // Store responder id and session key
                console.debug('Signaling: Responder ', nonce.source, ' authenticated.');
                this.responder = nonce.source;
                this.sessionKey = responder.keyStore;

                // Drop all other responders
                console.debug('Signaling: Dropping ', this.responders.size - 1, ' other responders.');
                for (let id of this.responders.keys()) {
                    if (id != this.responder) {
                        let message: saltyrtc.DropResponder = {
                            type: 'drop-responder',
                            id: id,
                        };
                        let packet: Uint8Array = this.buildPacket(message, Signaling.SALTYRTC_ADDR_SERVER);
                        this.ws.send(packet);
                    }
                    this.responders.delete(id);
                }

                // Deregister handshake
                console.info('Signaling: Responder handshake done.');
                this.ws.removeEventListener('message', this.onResponderHandshakeMessage);
                this.ws.addEventListener('message', this.onMessage);
            }
        } else {
            console.error('Signaling: Invalid source byte in nonce:', unsafeNonce.source);
            abort();
        }
    };

    /**
     * A message was received.
     */
    private onMessage = (ev: MessageEvent) => {
        console.info('Message received!');
    }

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
