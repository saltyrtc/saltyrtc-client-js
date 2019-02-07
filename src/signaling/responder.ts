/**
 * Copyright (C) 2016-2018 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import { CloseCode } from '../closecode';
import { ProtocolError, SignalingError, ValidationError } from '../exceptions';
import { KeyStore } from '../keystore';
import { Nonce } from '../nonce';
import { Initiator, Server } from '../peers';
import { arrayToBuffer, byteToHex } from '../utils';
import { Signaling } from './common';
import { isResponderId } from './helpers';

export class ResponderSignaling extends Signaling {

    protected logTag: string = '[SaltyRTC.Responder]';

    protected initiator: Initiator = null;

    /**
     * Create a new responder signaling instance.
     */
    constructor(client: saltyrtc.SaltyRTC, host: string, port: number, serverKey: Uint8Array,
                tasks: saltyrtc.Task[], pingInterval: number,
                permanentKey: saltyrtc.KeyStore, initiatorPubKey: Uint8Array, authToken?: saltyrtc.AuthToken) {
        super(client, host, port, serverKey, tasks, pingInterval,
              permanentKey, authToken === undefined ? initiatorPubKey : undefined);
        this.role = 'responder';
        this.initiator = new Initiator(initiatorPubKey, this.permanentKey);
        if (authToken !== undefined) {
            this.authToken = authToken;
        } else {
            // If we trust the initiator, don't send a token message
            this.initiator.handshakeState = 'token-sent';
        }
    }

    /**
     * The responder needs to use the initiator public permanent key as connection path.
     */
    protected getWebsocketPath(): string {
        return this.initiator.permanentSharedKey.remotePublicKeyHex;
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
                return this.initiator.permanentSharedKey.encrypt(payload, nonceBytes);
            default:
                const sessionSharedKey = this.getPeer().sessionSharedKey;
                if (sessionSharedKey === null) {
                    throw new ProtocolError('Trying to encrypt for peer using session key, but session key is null');
                }
                return sessionSharedKey.encrypt(payload, nonceBytes);
        }
    }

    protected getPeer(): Initiator | null {
        if (this.initiator !== null) {
            return this.initiator;
        }
        return null;
    }

    /**
     * Get the responder instance with the specified id.
     */
    protected getPeerWithId(id: number): Server | Initiator | null {
        if (id === Signaling.SALTYRTC_ADDR_SERVER) {
            return this.server;
        } else if (id === Signaling.SALTYRTC_ADDR_INITIATOR) {
            return this.initiator;
        } else {
            throw new ProtocolError('Invalid peer id: ' + id);
        }
    }

    /**
     * Handle signaling error during peer handshake.
     */
    protected handlePeerHandshakeSignalingError(e: SignalingError, source: number | null): void {
        // Close the connection to the server
        this.resetConnection(e.closeCode);
    }

    protected onPeerHandshakeMessage(box: saltyrtc.Box, nonce: Nonce): void {
        // Validate nonce destination
        if (nonce.destination !== this.address) {
            throw new ProtocolError('Message destination does not match our address');
        }

        let payload: Uint8Array;

        // Handle server messages
        if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
            // Nonce claims to come from server.
            // Try to decrypt data accordingly.
            try {
                payload = this.server.sessionSharedKey.decrypt(box);
            } catch (e) {
                if (e.name === 'CryptoError' && e.code === 'decryption-failed') {
                    throw new SignalingError(
                        CloseCode.ProtocolError, 'Could not decrypt server message.');
                } else {
                    throw e;
                }
            }

            const msg: saltyrtc.Message = this.decodeMessage(payload, 'server');
            switch (msg.type) {
                case 'new-initiator':
                    this.log.debug(this.logTag, 'Received new-initiator');
                    this.handleNewInitiator();
                    break;
                case 'send-error':
                    this.log.debug(this.logTag, 'Received send-error message');
                    this.handleSendError(msg as saltyrtc.messages.SendError);
                    break;
                case 'disconnected':
                    this.log.debug(this.logTag, 'Received disconnected message');
                    this.handleDisconnected(msg as saltyrtc.messages.Disconnected);
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
                    this.log.debug(this.logTag, 'Received key');
                    this.handleKey(msg as saltyrtc.messages.Key);
                    this.sendAuth(nonce);
                    break;
                case 'auth-sent':
                    // Expect auth message
                    msg = this.decodeMessage(payload, 'auth', true);
                    this.log.debug(this.logTag, 'Received auth');
                    this.handleAuth(msg as saltyrtc.messages.InitiatorAuth, nonce);

                    // We're connected!
                    this.setState('task');
                    this.log.info(this.logTag, 'Peer handshake done');

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
                try {
                    return this.initiator.permanentSharedKey.decrypt(box);
                } catch (e) {
                    if (e.name === 'CryptoError' && e.code === 'decryption-failed') {
                        throw new SignalingError(
                            CloseCode.ProtocolError, 'Could not decrypt key message.');
                    } else {
                        throw e;
                    }
                }
            case 'auth-sent':
            case 'auth-received':
                // Otherwise, it must be encrypted with the session key
                try {
                    return this.initiator.sessionSharedKey.decrypt(box);
                } catch (e) {
                    if (e.name === 'CryptoError' && e.code === 'decryption-failed') {
                        throw new SignalingError(
                            CloseCode.ProtocolError, 'Could not decrypt initiator session message.');
                    } else {
                        throw e;
                    }
                }
            default:
                throw new ProtocolError('Invalid handshake state: ' + this.initiator.handshakeState);
        }
    }

    protected sendClientHello(): void {
        const message: saltyrtc.messages.ClientHello = {
            type: 'client-hello',
            key: arrayToBuffer(this.permanentKey.publicKeyBytes),
        };
        const packet: Uint8Array = this.buildPacket(message, this.server, false);
        this.log.debug(this.logTag, 'Sending client-hello');
        this.ws.send(packet);
        this.server.handshakeState = 'hello-sent';
    }

    protected handleServerAuth(msg: saltyrtc.messages.ServerAuth, nonce: Nonce): void {
        if (nonce.destination > 0xff || nonce.destination < 0x02) {
            this.log.error(this.logTag, 'Invalid nonce destination:', nonce.destination);
            throw new ValidationError('Invalid nonce destination: ' + nonce.destination);
        }
        this.address = nonce.destination;
        this.log.debug(this.logTag, 'Server assigned address', byteToHex(this.address));
        this.logTag = '[SaltyRTC.Responder.' + byteToHex(this.address) + ']';

        // Validate repeated cookie
        this.validateRepeatedCookie(this.server, new Uint8Array(msg.your_cookie));

        // Validate server public key
        if (this.serverPublicKey != null) {
            try {
                this.validateSignedKeys(new Uint8Array(msg.signed_keys), nonce, this.serverPublicKey);
            } catch (e) {
                if (e.name === 'ValidationError') {
                    throw new ProtocolError('Verification of signed_keys failed: ' + e.message);
                }
                throw e;
            }
        } else if (msg.signed_keys !== null && msg.signed_keys !== undefined) {
            this.log.warn(this.logTag, "Server sent signed keys, but we're not verifying them.");
        }

        this.initiator.connected = msg.initiator_connected;
        this.log.debug(this.logTag, 'Initiator', this.initiator.connected ? '' : 'not', 'connected');

        this.server.handshakeState = 'done';
    }

    /**
     * Handle an incoming new-initiator message.
     */
    private handleNewInitiator(): void {
        this.initiator = new Initiator(
            this.initiator.permanentSharedKey.remotePublicKeyBytes, this.permanentKey);
        this.initiator.connected = true;
        this.initPeerHandshake();
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
            key: arrayToBuffer(this.permanentKey.publicKeyBytes),
        };
        const packet: Uint8Array = this.buildPacket(message, this.initiator);
        this.log.debug(this.logTag, 'Sending token');
        this.ws.send(packet);
        this.initiator.handshakeState = 'token-sent';
    }

    /**
     * Send our public session key to the initiator.
     */
    private sendKey(): void {
        // Generate our own session key
        this.initiator.setLocalSessionKey(new KeyStore(undefined, this.log));

        // Send public key to initiator
        const replyMessage: saltyrtc.messages.Key = {
            type: 'key',
            key: arrayToBuffer(this.initiator.localSessionKey.publicKeyBytes),
        };
        const packet: Uint8Array = this.buildPacket(replyMessage, this.initiator);
        this.log.debug(this.logTag, 'Sending key');
        this.ws.send(packet);
        this.initiator.handshakeState = 'key-sent';
    }

    /**
     * The initiator sends his public session key.
     */
    private handleKey(msg: saltyrtc.messages.Key): void {
        // Generate the shared session key
        this.initiator.setSessionSharedKey(new Uint8Array(msg.key));
        this.initiator.handshakeState = 'key-received';
    }

    /**
     * Repeat the initiator's cookie.
     */
    private sendAuth(nonce: Nonce): void {
        // Ensure again that cookies are different
        if (nonce.cookie.equals(this.initiator.cookiePair.ours)) {
            throw new ProtocolError('Their cookie and our cookie are the same.');
        }

        // Prepare task data
        const taskData: saltyrtc.TaskData = {};
        for (const task of this.tasks) {
            taskData[task.getName()] = task.getData();
        }
        const taskNames = this.tasks.map((task) => task.getName());

        // Send auth
        const message: saltyrtc.messages.ResponderAuth = {
            type: 'auth',
            your_cookie: arrayToBuffer(nonce.cookie.bytes),
            tasks: taskNames,
            data: taskData,
        };
        const packet: Uint8Array = this.buildPacket(message, this.initiator);
        this.log.debug(this.logTag, 'Sending auth');
        this.ws.send(packet);
        this.initiator.handshakeState = 'auth-sent';
    }

    /**
     * The initiator repeats our cookie and sends the chosen task.
     */
    private handleAuth(msg: saltyrtc.messages.InitiatorAuth, nonce: Nonce): void {
        // Validate repeated cookie
        this.validateRepeatedCookie(this.initiator, new Uint8Array(msg.your_cookie));

        // Validate task data
        try {
            ResponderSignaling.validateTaskInfo(msg.task, msg.data);
        } catch (e) {
            if (e.name === 'ValidationError') {
                throw new ProtocolError('Peer sent invalid task info: ' + e.message);
            }
            throw e;
        }

        // Find selected task
        let selectedTask: saltyrtc.Task = null;
        for (const task of this.tasks) {
            if (task.getName() === msg.task) {
                selectedTask = task;
                this.log.info(this.logTag, 'Task', msg.task, 'has been selected');
                break;
            }
        }

        // Initialize task
        if (selectedTask === null) {
            throw new SignalingError(CloseCode.ProtocolError, 'Initiator selected unknown task');
        } else {
            this.initTask(selectedTask, msg.data[selectedTask.getName()]);
        }

        // Ok!
        this.log.debug(this.logTag, 'Initiator authenticated');
        this.initiator.cookiePair.theirs = nonce.cookie;
        this.initiator.handshakeState = 'auth-received';
    }

    /**
     * Validate task info. Throw ValidationError if validation fails.
     * @param name Task name
     * @param data Task data
     * @throws ValidationError
     */
    private static validateTaskInfo(name: string, data: object): void {
        if (name.length === 0) {
            throw new ValidationError('Task name must not be empty');
        }
        if (Object.keys(data).length < 1) {
            throw new ValidationError('Task data must not be empty');
        }
        if (Object.keys(data).length > 1) {
            throw new ValidationError('Task data must contain exactly 1 key');
        }
        if (!data.hasOwnProperty(name)) {
            throw new ValidationError('Task data must contain an entry for the chosen task');
        }
    }

    /**
     * Handle a send error.
     */
    protected _handleSendError(receiver: number): void {
        // Validate receiver byte
        if (receiver !== Signaling.SALTYRTC_ADDR_INITIATOR) {
            throw new ProtocolError('Outgoing c2c messages must have been sent to the initiator');
        }

        // Notify application
        this.client.emit({type: 'signaling-connection-lost', data: receiver});

        // Reset connection
        this.resetConnection(CloseCode.ProtocolError);

        // TODO: Maybe keep ws connection open and wait for reconnect (#63)
    }
}
