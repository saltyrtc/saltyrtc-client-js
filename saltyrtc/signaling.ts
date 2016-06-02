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

import { KeyStore, AuthToken, Box } from "./keystore";
import { Cookie, CookiePair } from "./cookie";
import { SaltyRTC } from "./client";
import { SignalingChannelNonce as Nonce } from "./nonce";
import { concat, randomUint32, byteToHex } from "./utils";

/**
 * Possible states for SaltyRTC connection.
 */
export type State = 'unknown' | 'ws-connecting' | 'ws-open' |
                    'server-handshake' | 'peer-handshake' |
                    'open' | 'closing' | 'closed';

const enum CloseCode {
    // The endpoint is going away
    GoingAway = 1001,
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
    nonce: Nonce,
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
    // Permanent key of the responder
    public permanentKey: Uint8Array = null;

    // Session key of the responder
    public sessionKey: Uint8Array = null;

    // Our own session keystore
    public keyStore: KeyStore = new KeyStore();

    // Cookies (TODO: CookiePair)
    public ourCookie: Cookie = null;
    public theirCookie: Cookie = null;

    // Handshake state
    public state: 'new' | 'token-received' | 'key-received' = 'new';

    // Sequence number
    public combinedSequence: CombinedSequence = new CombinedSequence();
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
    static SALTYRTC_ADDR_UNKNOWN = 0x00;
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
    public state: State = 'unknown';

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
    private responder: number = null;

    // Signaling: Responder
    private initiatorConnected: boolean = null;
    private initiatorCombinedSequence = new CombinedSequence();

    /**
     * Create a new signaling instance.
     *
     * If the authToken and path are specified, then the class will act as a
     * responder, otherwise as an initiator.
     */
    constructor(client: SaltyRTC, host: string, port: number,
                permanentKey: KeyStore,
                path?: string,
                authToken?: AuthToken) {
        this.client = client;
        this.permanentKey = permanentKey;
        this.host = host;
        this.port = port;
        if (typeof authToken !== 'undefined' && typeof path !== 'undefined') {
            // We're a responder
            this.role = 'responder';
            this.logTag = 'Responder:';
            this.path = path;
            this.authToken = authToken;
        } else {
            // We're an initiator
            this.role = 'initiator';
            this.logTag = 'Initiator:';
        }
    }

    /**
     * Return the public permanent key as hex string.
     */
    public get publicKeyHex(): string {
        return this.permanentKey.publicKeyHex;
    }

    /**
     * Return the auth token as Uint8Array.
     */
    public get authTokenBytes(): Uint8Array {
        return this.authToken.keyBytes;
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
        let path = this.path || this.permanentKey.publicKeyHex;
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
        this.state = 'server-handshake';
        await this.serverHandshake(ev.data);
        this.state = 'peer-handshake';
        if (this.role === 'responder' && this.initiatorConnected === true) {
            this.sendToken();
        }
        this.ws.addEventListener('message', this.onPeerHandshakeMessage);
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
            this.validateNonce(nonce, this.address, 0x00);

            // Validate data
            if (serverHello.type !== 'server-hello') {
                console.error(this.logTag, 'Invalid server-hello message, bad type field:', serverHello);
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

            let message: saltyrtc.ClientHello = {
                type: 'client-hello',
                key: this.permanentKey.publicKeyArray,
            };
            let packet: Uint8Array = this.buildPacket(message, Signaling.SALTYRTC_ADDR_SERVER, false);
            console.debug(this.logTag, 'Sending client-hello');
            this.ws.send(packet);
        }

        { // Send client-auth

            let message: saltyrtc.ClientAuth = {
                type: 'client-auth',
                your_cookie: this.cookiePair.theirs.asArray(),
            };
            let packet: Uint8Array = this.buildPacket(message, Signaling.SALTYRTC_ADDR_SERVER);
            console.debug(this.logTag, 'Sending client-auth');
            this.ws.send(packet);

            // Set previously unknown address to 0x01 (initiator)
            this.address = Signaling.SALTYRTC_ADDR_INITIATOR;
        }

        { // Receive server-auth

            // Wait for message
            let bytes: Uint8Array = await this.recvMessageData();

            // Validate length
            if (bytes.byteLength <= 24) {
                console.error(this.logTag, 'Received message with only', bytes.byteLength, 'bytes length');
                throw 'bad-message-length';
            }

            // Decrypt message
            let box = Box.fromUint8Array(bytes, nacl.box.nonceLength);
            let decrypted = this.permanentKey.decrypt(box, this.serverKey);

            // Now that the nonce integrity is guaranteed by decrypting,
            // create a `Nonce` instance.
            let nonce = Nonce.fromArrayBuffer(box.nonce.buffer);

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
            let message = this.decodeMessage(decrypted, 'server-auth') as saltyrtc.ServerAuth;

            // Validate cookie
            if (!Cookie.from(message.your_cookie).equals(this.cookiePair.ours)) {
                console.error(this.logTag, 'Bad cookie in server-auth message');
                console.debug(this.logTag, 'Their response:', message.your_cookie,
                                           ', our cookie:', this.cookiePair.ours.asArray());
                throw 'bad-cookie';
            }

            // Store responders
            if (this.role == 'initiator') {
                this.responders = new Map<number, Responder>();
                for (let id of message.responders) {
                    this.responders.set(id, new Responder());
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
        let message: saltyrtc.Token = {
            type: 'token',
            key: this.permanentKey.publicKeyArray,
        };
        let packet: Uint8Array = this.buildPacket(message, Signaling.SALTYRTC_ADDR_INITIATOR);
        console.debug(this.logTag, 'Sending token');
        this.ws.send(packet);
    }

    /**
     * Return a promise for the next WebSocket message event.
     */
    private recvMessageEvent(): Promise<MessageEvent> {
        return new Promise((resolve) => {
            let handler = (ev: MessageEvent) => {
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
    private validateNonce(nonce: Nonce, destination?: number, source?: number): void {
        // Validate destination
        if (typeof destination !== 'undefined' && nonce.destination !== destination) {
            console.error(this.logTag, 'Nonce destination is', nonce.destination, 'but we\'re', this.address);
            throw 'bad-nonce-destination';
        }

        // Validate source
        if (typeof source !== 'undefined' && nonce.source !== source) {
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
    private decodeMessage(data: Uint8Array, type?: saltyrtc.MessageType): saltyrtc.Message {
        // Decode
        let msg = msgpack.decode(data) as saltyrtc.Message;

        if (typeof msg.type === 'undefined') {
            console.error(this.logTag, 'Failed to decode msgpack data.');
            throw 'bad-message';
        }

        // Validate type
        if (typeof type !== 'undefined' && msg.type !== type) {
            console.error(this.logTag, 'Invalid', type, 'message, bad type field:', msg);
            throw 'bad-message-type';
        }

        return msg;
    }

    /**
     * Build and return a packet containing the specified message for the
     * specified receiver.
     */
    private buildPacket(message: saltyrtc.Message, receiver: number, encrypt=true): Uint8Array {
        // Create nonce
        let cookie, csn, nonce, nonceBytes;
        if (receiver === Signaling.SALTYRTC_ADDR_SERVER) {
            cookie = this.cookiePair.ours;
            csn = this.serverCombinedSequence.next();
        } else if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR) {
            cookie = this.cookiePair.ours;
            csn = this.initiatorCombinedSequence.next();
        } else if (receiver >= 0x02 && receiver <= 0xff) {
            let responder = this.responders.get(receiver);
            cookie = responder.ourCookie;
            csn = responder.combinedSequence;
        } else {
            throw 'bad-receiver';
        }
        nonce = new Nonce(cookie, csn.overflow, csn.sequenceNumber, this.address, receiver);
        nonceBytes = new Uint8Array(nonce.toArrayBuffer());

        // Encode message
        let data: Uint8Array = msgpack.encode(message);

        // Encrypt if desired
        if (encrypt !== false) {
            let box;
            if (receiver === Signaling.SALTYRTC_ADDR_SERVER) {
                box = this.permanentKey.encrypt(data, nonceBytes, this.serverKey);
            } else if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR) {
                box = this.authToken.encrypt(data, nonceBytes);
            } else {
                throw 'not-yet-implemented';
            }
            return box.toUint8Array();
        } else {
            return concat(nonceBytes, data);
        }
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
        this.state = 'unknown';
        this.serverCombinedSequence = new CombinedSequence();

        // Close WebSocket instance
        if (this.ws !== null) {
            console.debug(this.logTag, 'Disconnecting WebSocket');
            this.ws.close();
        }
        this.ws = null;
    }

    /**
     * WebSocket onopen handler.
     */
    private onOpen = (ev: Event) => {
        console.info(this.logTag, 'Opened connection');
        this.state = 'ws-open';
        this.client.onConnected(ev);
    };

    /**
     * WebSocket onerror handler.
     */
    private onError = (ev: ErrorEvent) => {
        console.error(this.logTag, 'General WebSocket error', ev);
        this.state = this.getStateFromSocket();
        this.client.onConnectionError(ev);
    };

    /**
     * WebSocket onclose handler.
     */
    private onClose = (ev: CloseEvent) => {
        console.info(this.logTag, 'Closed connection');
        this.state = 'closed';
        switch (ev.code) {
            case CloseCode.GoingAway:
                console.error(this.logTag, 'Server is being shut down');
                break;
            case CloseCode.SubprotocolError:
                console.error(this.logTag, 'No shared sub-protocol could be found');
                break;
            case CloseCode.PathFull:
                console.error(this.logTag, 'Path full (no free responder byte)');
                break;
            case CloseCode.ProtocolError:
                console.error(this.logTag, 'Protocol error');
                break;
            case CloseCode.InternalError:
                console.error(this.logTag, 'Internal server error');
                break;
            case CloseCode.Handover:
                console.info(this.logTag, 'Handover to data channel');
                break;
            case CloseCode.Dropped:
                console.warn(this.logTag, 'Dropped by initiator');
                break;
        }
        this.client.onConnectionClosed(ev);
    };

    /**
     * Websocket onmessage handler during peer handshake phase.
     *
     * This event handler is registered after the server handshake is done,
     * and removed once the peer handshake is done.
     */
    private onPeerHandshakeMessage = (ev: MessageEvent) => {
        console.debug(this.logTag, 'Incoming WebSocket message');

        // Abort function
        let abort = () => {
            console.error(this.logTag, 'Resetting connection.');
            this.ws.removeEventListener('message', this.onPeerHandshakeMessage);
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
                    console.error(this.logTag, 'Decryption failed.');
                    abort();
                } else {
                    throw err;
                }
            }
        }

        // Assert message type function
        let assertType = (message: saltyrtc.Message, type: saltyrtc.MessageType) => {
            if (message.type !== type) {
                console.error(this.logTag, 'Expected message type "', type, '" but got "', message.type, '".');
                abort();
            }
        }

        let buffer = ev.data;
        let bytes = new Uint8Array(buffer);

        // Peek at nonce.
        // Important: At this point the nonce is not yet authenticated,
        // so don't trust it yet!
        let unsafeNonce = Nonce.fromArrayBuffer(buffer.slice(0, 24));
        this.validateNonce(unsafeNonce, this.address);

        // Dispatch messages according to source.
        // Note that we can trust the source flag as soon as we have decrypted
        // (and thus authenticated) the message.
        if (unsafeNonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
            // Decrypt message
            let box = Box.fromUint8Array(bytes, nacl.box.nonceLength);
            let decrypted = this.permanentKey.decrypt(box, this.serverKey);

            // Decode message
            let message = this.decodeMessage(decrypted);
            console.debug(this.logTag, 'Received', message.type);

            if (message.type === 'new-responder') {
                // A new responder wants to connect. Store id.
                let responderId = (message as saltyrtc.NewResponder).id;
                if (!this.responders.has(responderId)) {
                    this.responders.set(responderId, new Responder());
                } else {
                    console.warn(this.logTag, 'Got new-responder message for an already known responder.');
                }
            } else {
                console.warn(this.logTag, 'Ignored server message of type "', message.type, '".');
            }
        } else if (unsafeNonce.source >= 0x02 && unsafeNonce.source <= 0xff) {
            // In order to know what key to use for decryption, we need to check the state of the responder.
            let responder = this.responders.get(unsafeNonce.source);
            if (typeof responder === 'undefined') {
                console.error(this.logTag, 'Received message from unknown responder (', unsafeNonce.source, ')');
                return;
            }

            if (responder.state === 'new') {
                // If the state is 'new', then we expect a 'token' message,
                // encrypted with the authentication token.
                let box = Box.fromUint8Array(bytes, nacl.secretbox.nonceLength);
                let decrypted = decrypt(box, this.authToken);
                let message = this.decodeMessage(decrypted) as saltyrtc.Token;
                console.debug(this.logTag, 'Received', message.type);
                assertType(message, 'token');

                // Store responder permanent key
                responder.permanentKey = Uint8Array.from(message.key);
                responder.state = 'token-received';
            } else if (responder.state === 'token-received') {
                // If the state is 'token-received', we expect a 'key' message,
                // encrypted with our permanent key.
                let box = Box.fromUint8Array(bytes, nacl.box.nonceLength);
                let decrypted = decrypt(box, this.permanentKey, responder.permanentKey);
                let message = this.decodeMessage(decrypted) as saltyrtc.Key;
                console.debug(this.logTag, 'Received', message.type);
                assertType(message, 'key');

                // Store responder session key and cookie
                let nonce = unsafeNonce;
                responder.sessionKey = Uint8Array.from(message.key);
                responder.theirCookie = nonce.cookie;
                responder.state = 'key-received';
            } else if (responder.state === 'key-received') {
                // If the state is 'key-received', we expect a 'auth' message,
                // encrypted with our session key.
                let box = Box.fromUint8Array(bytes, nacl.box.nonceLength);
                let decrypted = decrypt(box, responder.keyStore, responder.sessionKey);
                let message = this.decodeMessage(decrypted) as saltyrtc.Auth;
                console.debug(this.logTag, 'Received', message.type);
                assertType(message, 'auth');

                // Verify the cookie
                let nonce = unsafeNonce;
                if (nonce.cookie !== responder.ourCookie) {
                    console.error(this.logTag, 'Invalid cookie in auth message.');
                    abort();
                }

                // Store responder id and session key
                console.debug(this.logTag, 'Responder ', nonce.source, ' authenticated.');
                this.responder = nonce.source;
                this.sessionKey = responder.keyStore;

                // Drop all other responders
                console.debug(this.logTag, 'Dropping ', this.responders.size - 1, ' other responders.');
                for (let id of this.responders.keys()) {
                    if (id !== this.responder) {
                        let message: saltyrtc.DropResponder = {
                            type: 'drop-responder',
                            id: id,
                        };
                        let packet: Uint8Array = this.buildPacket(message, Signaling.SALTYRTC_ADDR_SERVER);
                        console.debug(this.logTag, 'Sending drop-responder', id);
                        this.ws.send(packet);
                    }
                    this.responders.delete(id);
                }

                // Deregister handshake
                console.info(this.logTag, 'Responder handshake done.');
                this.ws.removeEventListener('message', this.onPeerHandshakeMessage);
                this.ws.addEventListener('message', this.onMessage);
            }
        } else {
            console.error(this.logTag, 'Invalid source byte in nonce:', unsafeNonce.source);
            abort();
        }
    };

    /**
     * A message was received.
     */
    private onMessage = (ev: MessageEvent) => {
        console.info(this.logTag, 'Message received!');
    }

    /**
     * Return state based on websocket `readyState` attribute.
     */
    private getStateFromSocket(): State {
        switch (this.ws.readyState) {
            case WebSocket.CONNECTING:
                return 'ws-connecting';
            case WebSocket.OPEN:
                return 'unknown';
            case WebSocket.CLOSING:
                return 'closing';
            case WebSocket.CLOSED:
                return 'closed';
        }
        return 'unknown';
    }

}
