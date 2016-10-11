/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path='../saltyrtc.d.ts' />

import { KeyStore, AuthToken } from "../keystore";
import { SignalingChannelNonce } from "../nonce";
import { NextCombinedSequence } from "../csn";
import { Initiator } from "../peers";
import {ProtocolError, InternalError, SignalingError} from "../exceptions";
import { u8aToHex, byteToHex } from "../utils";
import { Signaling } from "./common";
import { decryptKeystore, isResponderId } from "./helpers";
import {CloseCode} from "../closecode";

export class ResponderSignaling extends Signaling {

    protected logTag: string = 'Responder:';

    // TODO: initiator class
    protected initiator: Initiator = null;

    /**
     * Create a new responder signaling instance.
     */
    constructor(client: saltyrtc.SaltyRTC, host: string, port: number, tasks: saltyrtc.Task[],
                permanentKey: KeyStore, initiatorPubKey: Uint8Array, authToken?: AuthToken) {
        super(client, host, port, tasks, permanentKey, authToken === undefined ? initiatorPubKey : undefined);
        this.role = 'responder';
        this.initiator = new Initiator(initiatorPubKey);
        if (authToken !== undefined) {
            this.authToken = authToken;
        } else {
            // If we trust the initiator, don't send a token message
            this.initiator.handshakeState = 'token-sent';
        }
    }

    /**
     * The responder needs to use the initiator public permanent key as connection path.
     **/
    protected getWebsocketPath(): string {
        return u8aToHex(this.initiator.permanentKey);
    }

    protected getNextCsn(receiver: number): NextCombinedSequence {
        if (receiver === Signaling.SALTYRTC_ADDR_SERVER) {
            return this.serverCsn.next();
        } else if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR) {
            return this.initiator.csn.next();
        } else if (isResponderId(receiver)) {
            throw new ProtocolError('Responder may not send messages to other responders: ' + receiver);
        } else {
            throw new ProtocolError('Bad receiver byte: ' + receiver);
        }
    }

    /**
     * Encrypt data for the initiator.
     */
    protected encryptHandshakeDataForPeer(receiver: number, messageType: string,
                                          payload: Uint8Array, nonceBytes: Uint8Array): saltyrtc.Box {
        // Validate receiver
        if (isResponderId(receiver)) {
            throw new ProtocolError('Responder may not encrypt messages for other responders: ' + receiver);
        } else if (receiver !== Signaling.SALTYRTC_ADDR_INITIATOR) {
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

    protected getPeerAddress(): number {
        if (this.initiator !== null) {
            return this.initiator.id;
        }
        return null;
    }

    protected getPeerSessionKey(): Uint8Array {
        if (this.initiator !== null) {
            return this.initiator.sessionKey;
        }
        return null;
    }

    protected getPeerPermanentKey(): Uint8Array {
        if (this.initiator !== null) {
            return this.initiator.permanentKey;
        }
        return null;
    }

    protected onPeerHandshakeMessage(box: saltyrtc.Box, nonce: SignalingChannelNonce): void {
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
                case 'new-initiator':
                    console.debug(this.logTag, 'Received new-initiator');
                    this.handleNewInitiator(msg as saltyrtc.messages.NewInitiator);
                    break;
                default:
                    throw new ProtocolError('Received unexpected server message: ' + msg.type);
            }

        // Handle peer messages
        } else if (nonce.source === Signaling.SALTYRTC_ADDR_INITIATOR) {
            payload = this.decryptInitiatorMessage(box);

            // Dispatch message
            let msg: saltyrtc.Message;
            switch (this.initiator.handshakeState) {
                case 'new':
                    throw new ProtocolError('Unexpected peer handshake message');
                case 'key-sent':
                    // Expect key message
                    msg = this.decodeMessage(payload, 'key', true);
                    console.debug(this.logTag, 'Received key');
                    this.handleKey(msg as saltyrtc.messages.Key);
                    this.sendAuth(nonce);
                    break;
                case 'auth-sent':
                    // Expect auth message
                    msg = this.decodeMessage(payload, 'auth', true);
                    console.debug(this.logTag, 'Received auth');
                    this.handleAuth(msg as saltyrtc.messages.Auth, nonce);

                    // We're connected!
                    this.setState('task');
                    console.info(this.logTag, 'Peer handshake done');

                    break;
                default:
                    throw new SignalingError(CloseCode.InternalError, 'Unknown initiator handshake state');
            }

        // Handle unknown source
        } else {
            throw new SignalingError(CloseCode.InternalError,
                'Message source is neither the server nor the initiator');
        }
    }

    /**
     * Decrypt messages from the initiator.
     *
     * @param box encrypted box containing messag.e
     * @returns The decrypted message bytes.
     * @throws SignalingError
     */
    private decryptInitiatorMessage(box: saltyrtc.Box): Uint8Array {
        switch (this.initiator.handshakeState) {
            case 'new':
            case 'token-sent':
            case 'key-received':
                throw new ProtocolError('Received message in ' + this.initiator.handshakeState + ' state.');
            case 'key-sent':
                // Expect a key message, encrypted with the permanent keys
                return decryptKeystore(box, this.permanentKey, this.initiator.permanentKey, 'key');
            case 'auth-sent':
            case 'auth-received':
                // Otherwise, it must be encrypted with the session key
                return decryptKeystore(box, this.sessionKey, this.initiator.sessionKey, 'initiator session');
            default:
                throw new ProtocolError('Invalid handshake state: ' + this.initiator.handshakeState);
        }
    }

    protected sendClientHello(): void {
        const message: saltyrtc.messages.ClientHello = {
            type: 'client-hello',
            key: this.permanentKey.publicKeyBytes.buffer,
        };
        const packet: Uint8Array = this.buildPacket(message, Signaling.SALTYRTC_ADDR_SERVER, false);
        console.debug(this.logTag, 'Sending client-hello');
        this.ws.send(packet);
        this.serverHandshakeState = 'hello-sent';
    }

    protected handleServerAuth(msg: saltyrtc.messages.ServerAuth, nonce: SignalingChannelNonce): void {
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

    /**
     * Handle an incoming new-initiator message.
     */
    private handleNewInitiator(msg: saltyrtc.messages.NewInitiator): void {
        // A new initiator connected.
        this.initiator.connected = true;
        // Only send token if we don't trust the initiator.
        if (this.peerTrustedKey === null) {
            this.sendToken();
        }
    }

    /**
     * Init the peer handshake.
     *
     * If the initiator is already connected, send a token.
     * Otherwise, do nothing and wait for a new-initiator message.
     */
    protected initPeerHandshake(): void {
        if (this.initiator.connected) {
            // Only send token if we don't trust the initiator.
            if (this.peerTrustedKey === null) {
                this.sendToken();
            }
            this.sendKey();
        }
    }

    /**
     * Send a 'token' message to the initiator.
     */
    protected sendToken(): void {
        const message: saltyrtc.messages.Token = {
            type: 'token',
            key: this.permanentKey.publicKeyBytes.buffer,
        };
        const packet: Uint8Array = this.buildPacket(message, Signaling.SALTYRTC_ADDR_INITIATOR);
        console.debug(this.logTag, 'Sending token');
        this.ws.send(packet);
        this.initiator.handshakeState = 'token-sent';
    }

    /**
     * Send our public session key to the initiator.
     */
    private sendKey(): void {
        // Generate our own session key
        this.sessionKey = new KeyStore();

        // Send public key to initiator
        const replyMessage: saltyrtc.messages.Key = {
            type: 'key',
            key: this.sessionKey.publicKeyBytes.buffer,
        };
        const packet: Uint8Array = this.buildPacket(replyMessage, Signaling.SALTYRTC_ADDR_INITIATOR);
        console.debug(this.logTag, 'Sending key');
        this.ws.send(packet);
        this.initiator.handshakeState = 'key-sent';
    }

    /**
     * The initiator sends his public session key.
     */
    private handleKey(msg: saltyrtc.messages.Key): void {
        this.initiator.sessionKey = new Uint8Array(msg.key);
        this.initiator.handshakeState = 'key-received';
    }

    /**
     * Repeat the initiator's cookie.
     */
    private sendAuth(nonce: SignalingChannelNonce): void {
        // Ensure again that cookies are different
        if (nonce.cookie.equals(this.cookiePair.ours)) {
            throw new ProtocolError('Their cookie and our cookie are the same.');
        }

        // Send auth
        const message: saltyrtc.messages.Auth = {
            type: 'auth',
            your_cookie: nonce.cookie.asArrayBuffer(),
        };
        const packet: Uint8Array = this.buildPacket(message, Signaling.SALTYRTC_ADDR_INITIATOR);
        console.debug(this.logTag, 'Sending auth');
        this.ws.send(packet);
        this.initiator.handshakeState = 'auth-sent';
    }

    /**
     * The initiator repeats our cookie.
     */
    private handleAuth(msg: saltyrtc.messages.Auth, nonce: SignalingChannelNonce): void {
        // Validate cookie
        this.validateRepeatedCookie(msg);

        // TODO: Tasks

        // Ok!
        console.debug(this.logTag, 'Initiator authenticated');
        this.initiator.cookie = nonce.cookie;
        this.initiator.handshakeState = 'auth-received';
    }
}
