/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path='../saltyrtc.d.ts' />

import { KeyStore, Box, AuthToken } from "../keystore";
import { NextCombinedSequence } from "../csn";
import { SignalingChannelNonce } from "../nonce";
import { Responder } from "../peers";
import { ProtocolError, InternalError } from "../exceptions";
import { Signaling } from "./common";
import { decryptKeystore, decryptAuthtoken, isResponderId } from "./helpers";
import { byteToHex } from "../utils";

export class InitiatorSignaling extends Signaling {

    protected logTag: string = 'Initiator:';

    // Keep track of responders connected to the server
    protected responders: Map<number, Responder> = null;

    // Once the handshake is done, this is the chosen responder
    protected responder: Responder = null;

    /**
     * Create a new initiator signaling instance.
     */
    constructor(client: saltyrtc.SaltyRTC, host: string, port: number,
                permanentKey: KeyStore, responderTrustedKey?: Uint8Array) {
        super(client, host, port, permanentKey, responderTrustedKey);
        this.role = 'initiator';
        if (responderTrustedKey === undefined) {
            this.authToken = new AuthToken();
        }
    }

    /**
     * The initiator needs to use its own public permanent key as connection path.
     **/
    protected getWebsocketPath(): string {
        return this.permanentKey.publicKeyHex;
    }

    protected getNextCsn(receiver: number): NextCombinedSequence {
        if (receiver === Signaling.SALTYRTC_ADDR_SERVER) {
            return this.serverCsn.next();
        } else if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR) {
            throw new ProtocolError('Initiator cannot send messages to initiator');
        } else if (isResponderId(receiver)) {
            if (this.state === 'open') {
                return this.responder.csn.next();
            } else if (this.responders.has(receiver)) {
                return this.responders.get(receiver).csn.next();
            } else {
                throw new ProtocolError('Unknown responder: ' + receiver);
            }
        } else {
            throw new ProtocolError('Bad receiver byte: ' + receiver);
        }
    }

    /**
     * Encrypt data for the responder.
     */
    protected encryptForPeer(receiver: number, messageType: string,
                             payload: Uint8Array, nonceBytes: Uint8Array): Box {
        // Validate receiver
        if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR) {
            throw new ProtocolError('Initiator cannot encrypt messages for initiator');
        } else if (!isResponderId(receiver)) {
            throw new ProtocolError('Bad receiver byte: ' + receiver);
        }

        // Find correct responder
        let responder: Responder;
        if (this.state === 'open') {
            responder = this.responder;
        } else if (this.responders.has(receiver)) {
            responder = this.responders.get(receiver);
        } else {
            throw new ProtocolError('Unknown responder: ' + receiver);
        }

        // Encrypt
        switch (messageType) {
            case 'key':
                return this.permanentKey.encrypt(payload, nonceBytes, responder.permanentKey);
            default:
                return responder.keyStore.encrypt(payload, nonceBytes, responder.sessionKey);
        }
    }

    protected getPeerAddress(): number {
        if (this.responder !== null) {
            return this.responder.id;
        }
        return null;
    }

    protected getPeerSessionKey(): Uint8Array {
        if (this.responder !== null) {
            return this.responder.sessionKey;
        }
        return null;
    }

    protected getPeerPermanentKey(): Uint8Array {
        if (this.responder !== null) {
            return this.responder.permanentKey;
        }
        return null;
    }

    /**
     * Store a new responder.
     *
     * If we trust the responder, send our session key.
     *
     * @throws ProtocolError if the responder id matches our own address.
     */
    protected processNewResponder(responderId: number): void {
        if (!this.responders.has(responderId)) {
            // Check for address conflict
            if (responderId === this.address) {
                throw new ProtocolError('Responder id matches own address.');
            }

            // Create responder instance
            const responder = new Responder(responderId);

            // If we trust the responder...
            if (this.peerTrustedKey !== null) {
                // ...don't expect a token message.
                responder.handshakeState = 'token-received';

                // Set the public permanent key.
                responder.permanentKey = this.peerTrustedKey;
            }

            // Store responder
            this.responders.set(responderId, responder);

            // Notify listeners
            this.client.emit({type: 'new-responder', data: responderId});

            // If we trust the responder, send our session key directly.
            if (this.peerTrustedKey !== null) {
                this.sendKey(responder);
            }
        } else {
            console.warn(this.logTag, 'Got new-responder message for an already known responder.');
        }
    }

    protected onPeerHandshakeMessage(box: Box, nonce: SignalingChannelNonce): void {
        // Validate nonce destination
        // TODO: Can we do this earlier?
        if (nonce.destination != this.address) {
            throw new ProtocolError('Message destination does not match our address');
        }

        let payload: Uint8Array;

        // Handle server messages
        if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
            // Nonce claims to come from server.
            // Try to decrypt data accordingly.
            payload = decryptKeystore(box, this.permanentKey, this.serverKey, 'server');

            const msg: saltyrtc.Message = this.decodeMessage(payload, 'server');
            switch (msg.type) {
                case 'new-responder':
                    console.debug(this.logTag, 'Received new-responder');
                    this.handleNewResponder(msg as saltyrtc.messages.NewResponder);
                    break;
                default:
                    throw new ProtocolError('Received unexpected server message: ' + msg.type);
            }

        // Handle peer messages
        } else if (isResponderId(nonce.source)) {
            // Get responder instance
            const responder: Responder = this.responders.get(nonce.source);
            if (responder === null) {
                throw new ProtocolError('Unknown message sender: ' + nonce.source);
            }

            // Dispatch message
            let msg: saltyrtc.Message;
            switch (responder.handshakeState) {
                case 'new':
                    // Expect token message, encrypted with authentication token
                    payload = decryptAuthtoken(box, this.authToken, 'token');
                    msg = this.decodeMessage(payload, 'token', true);
                    console.debug(this.logTag, 'Received token');
                    this.handleToken(msg as saltyrtc.messages.Token, responder);
                    this.sendKey(responder);
                    break;
                case 'token-received':
                    // Expect key message, encrypted with our permanent key
                    const peerPublicKey = this.peerTrustedKey || responder.permanentKey;
                    try {
                        payload = decryptKeystore(box, this.permanentKey, peerPublicKey, 'key');
                    } catch (e) {
                        if (e instanceof ProtocolError && this.peerTrustedKey !== null) {
                            // Decryption failed.
                            // We trust a responder, but this particular responder used a different key.
                            console.debug(this.logTag, 'Decrypting key message failed.');
                            this.dropResponder(responder.id);
                            break;
                        }
                        throw e;
                    }
                    msg = this.decodeMessage(payload, 'key', true);
                    console.debug(this.logTag, 'Received key');
                    this.handleKey(msg as saltyrtc.messages.Key, responder);
                    this.sendAuth(responder, nonce);
                    break;
                case 'key-received':
                    // Expect auth message, encrypted with our session key
                    // Note: The session key related to the responder is
                    // responder.keyStore, not this.sessionKey!
                    payload = decryptKeystore(box, responder.keyStore, responder.sessionKey, 'auth');
                    msg = this.decodeMessage(payload, 'auth', true);
                    console.debug(this.logTag, 'Received auth');
                    this.handleAuth(msg as saltyrtc.messages.Auth, responder);
                    this.dropResponders();
                    // We're connected!
                    this.state = 'open';
                    console.info(this.logTag, 'Peer handshake done');
                    this.client.emit({type: 'connected'}); // TODO: Can we get rid of this event?
                    break;
                default:
                    throw new InternalError('Unknown responder handshake state');
            }

        // Handle unknown source
        } else {
            throw new InternalError('Message source is neither the server nor a responder');
        }
    }

    protected sendClientHello(): void {
        // No-op as initiator.
    }

    protected handleServerAuth(msg: saltyrtc.messages.ServerAuth, nonce: SignalingChannelNonce): void {
        this.address = Signaling.SALTYRTC_ADDR_INITIATOR;
        this.validateNonce(nonce, this.address, Signaling.SALTYRTC_ADDR_SERVER);
        this.validateRepeatedCookie(msg);

        // Store responders
        this.responders = new Map<number, Responder>();
        for (let id of msg.responders) {
            this.processNewResponder(id);
        }
        console.debug(this.logTag, this.responders.size, 'responders connected');

        this.serverHandshakeState = 'done';
    }

    protected initPeerHandshake(): void {
        // No-op as initiator.
    }

    /**
     * Handle an incoming new-responder message.
     */
    private handleNewResponder(msg: saltyrtc.messages.NewResponder): void {
        // A new responder wants to connect. Store id.
        this.processNewResponder(msg.id);
    }

    /**
     * A responder sends his public permanent key.
     */
    private handleToken(msg: saltyrtc.messages.Token, responder: Responder): void {
        responder.permanentKey = new Uint8Array(msg.key);
        responder.handshakeState = 'token-received';
    }

    /**
     * Send our public session key to the responder.
     */
    private sendKey(responder: Responder): void {
        const message: saltyrtc.messages.Key = {
            type: 'key',
            key: responder.keyStore.publicKeyBytes.buffer,
        };
        const packet: Uint8Array = this.buildPacket(message, responder.id);
        console.debug(this.logTag, 'Sending key');
        this.ws.send(packet);
    }

    /**
     * A responder sends his public session key.
     */
    private handleKey(msg: saltyrtc.messages.Key, responder: Responder): void {
        responder.sessionKey = new Uint8Array(msg.key);
        responder.handshakeState = 'key-received';
    }

    /**
     * Repeat the responder's cookie.
     */
    private sendAuth(responder: Responder, nonce: SignalingChannelNonce): void {
        // Ensure again that cookies are different
        if (nonce.cookie.equals(this.cookiePair.ours)) {
            throw new ProtocolError('Their cookie and our cookie are the same.');
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

    /**
     * A responder repeats our cookie.
     */
    private handleAuth(msg: saltyrtc.messages.Auth, responder: Responder): void {
        // Validate cookie
        this.validateRepeatedCookie(msg);

        // Ok!
        console.debug(this.logTag, 'Responder', responder.hexId, 'authenticated');

        // Store responder details and session key
        this.responder = this.responders.get(responder.id);
        this.sessionKey = responder.keyStore;

        // Remove responder from responders list
        this.responders.delete(responder.id);
    }

    /**
     * Drop all responders.
     */
    private dropResponders(): void {
        console.debug(this.logTag, 'Dropping', this.responders.size, 'other responders.');
        for (let id of this.responders.keys()) {
            this.dropResponder(id);
        }
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
        this.responders.delete(responderId);
    }
}
