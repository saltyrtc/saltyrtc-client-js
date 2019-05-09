/**
 * Copyright (C) 2016-2018 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import { CloseCode } from '../closecode';
import { ProtocolError, SignalingError, ValidationError } from '../exceptions';
import { AuthToken, KeyStore } from '../keystore';
import { Nonce } from '../nonce';
import { Responder, Server } from '../peers';
import { arrayToBuffer, byteToHex } from '../utils';
import { Signaling } from './common';
import { isResponderId } from './helpers';

export class InitiatorSignaling extends Signaling {

    protected logTag: string = '[SaltyRTC.Initiator]';

    // Keep track of responders connected to the server
    protected responderCounter = 0;
    protected responders: Map<number, Responder> = null;

    // Once the handshake is done, this is the chosen responder
    protected responder: Responder = null;

    /**
     * Create a new initiator signaling instance.
     */
    constructor(client: saltyrtc.SaltyRTC, host: string, port: number, serverKey: Uint8Array,
                tasks: saltyrtc.Task[], pingInterval: number,
                permanentKey: saltyrtc.KeyStore, responderTrustedKey?: Uint8Array) {
        super(client, host, port, serverKey, tasks, pingInterval, permanentKey, responderTrustedKey);
        this.role = 'initiator';
        if (responderTrustedKey === undefined) {
            this.authToken = new AuthToken(undefined, this.log);
        }
    }

    /**
     * The initiator needs to use its own public permanent key as connection path.
     */
    protected getWebsocketPath(): string {
        return this.permanentKey.publicKeyHex;
    }

    /**
     * Encrypt data for the responder.
     */
    protected encryptHandshakeDataForPeer(receiver: number, messageType: string,
                                          payload: Uint8Array, nonceBytes: Uint8Array): saltyrtc.Box {
        // Validate receiver
        if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR) {
            throw new ProtocolError('Initiator cannot encrypt messages for initiator');
        } else if (!isResponderId(receiver)) {
            throw new ProtocolError('Bad receiver byte: ' + receiver);
        }

        // Find correct responder
        let responder: Responder;
        if (this.getState() === 'task') {
            responder = this.responder;
        } else if (this.responders.has(receiver)) {
            responder = this.responders.get(receiver);
        } else {
            throw new ProtocolError('Unknown responder: ' + receiver);
        }

        // Encrypt
        switch (messageType) {
            case 'key':
                return responder.permanentSharedKey.encrypt(payload, nonceBytes);
            default:
                return responder.sessionSharedKey.encrypt(payload, nonceBytes);
        }
    }

    protected getPeer(): Responder | null {
        if (this.responder !== null) {
            return this.responder;
        }
        return null;
    }

    /**
     * Get the responder instance with the specified id.
     */
    protected getPeerWithId(id: number): Server | Responder | null {
        if (id === Signaling.SALTYRTC_ADDR_SERVER) {
            return this.server;
        } else if (isResponderId(id)) {
            if (this.state === 'task' && this.responder !== null && this.responder.id === id) {
                return this.responder;
            } else if (this.responders.has(id)) {
                return this.responders.get(id);
            }
            return null;
        } else {
            throw new ProtocolError('Invalid peer id: ' + id);
        }
    }

    /**
     * Handle signaling error during peer handshake.
     */
    protected handlePeerHandshakeSignalingError(e: SignalingError, source: number | null): void {
        // Simply drop the responder.
        if (source !== null) {
            this.dropResponder(source, e.closeCode);
        }
    }

    /**
     * Store a new responder.
     *
     * @throws SignalingError
     */
    protected processNewResponder(responderId: number): void {
        // Discard previous responder (if any)
        if (this.responders.has(responderId)) {
            this.log.warn(this.logTag, 'Previous responder discarded (server ' +
                `should have sent 'disconnected' message): ${responderId}`);
            this.responders.delete(responderId);
        }

        // Create responder instance
        const responder = new Responder(responderId, this.responderCounter++);

        // If we trust the responder...
        if (this.peerTrustedKey !== null) {
            // ...don't expect a token message.
            responder.handshakeState = 'token-received';

            // Set the public permanent key.
            responder.setPermanentSharedKey(this.peerTrustedKey, this.permanentKey);
        }

        // Store responder
        this.responders.set(responderId, responder);

        // If we almost reached the limit (254 - 2), drop the oldest responder that hasn't sent any valid data so far.
        if (this.responders.size > 252) {
            this.dropOldestInactiveResponder();
        }

        // Notify listeners
        this.client.emit({type: 'new-responder', data: responderId});
    }

    /**
     * Drop the oldest inactive responder.
     */
    private dropOldestInactiveResponder(): void {
        this.log.warn(this.logTag, 'Dropping oldest inactive responder');
        let drop = null;
        for (const r of this.responders.values()) {
            if (r.handshakeState === 'new') {
                if (drop === null) {
                    drop = r;
                } else if (r.counter < drop.counter) {
                    drop = r;
                }
            }
        }
        if (drop !== null) {
            this.dropResponder(drop.id, CloseCode.DroppedByInitiator);
        }
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
                case 'new-responder':
                    this.log.debug(this.logTag, 'Received new-responder',
                        byteToHex((msg as saltyrtc.messages.NewResponder).id));
                    this.handleNewResponder(msg as saltyrtc.messages.NewResponder);
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
        } else if (isResponderId(nonce.source)) {
            // Get responder instance
            const responder: Responder = this.responders.get(nonce.source);
            if (responder === null) {
                throw new ProtocolError('Unknown message source: ' + nonce.source);
            }

            // Dispatch message
            let msg: saltyrtc.Message;
            switch (responder.handshakeState) {
                case 'new':
                    if (this.peerTrustedKey !== null) {
                        throw new SignalingError(CloseCode.InternalError,
                            'Handshake state is "new" even though a trusted key is available');
                    }

                    // Expect token message, encrypted with authentication token
                    try {
                        payload = this.authToken.decrypt(box);
                    } catch (e) {
                        this.log.warn(this.logTag, 'Could not decrypt token message: ', e);
                        this.dropResponder(responder.id, CloseCode.InitiatorCouldNotDecrypt);
                        return;
                    }

                    msg = this.decodeMessage(payload, 'token', true);
                    this.log.debug(this.logTag, 'Received token');
                    this.handleToken(msg as saltyrtc.messages.Token, responder);
                    break;
                case 'token-received':
                    // Expect key message, encrypted with our permanent key
                    if (this.peerTrustedKey !== null) {
                        try {
                            // Note: We don't use a SharedKeyStore here since this is done only once.
                            payload = this.permanentKey.decrypt(box, this.peerTrustedKey);
                        } catch (e) {
                            // Decryption failed.
                            // We trust a responder, but this particular responder used a different key.
                            this.log.warn(this.logTag, 'Could not decrypt key message');
                            this.dropResponder(responder.id, CloseCode.InitiatorCouldNotDecrypt);
                            return;
                        }
                    } else {
                        payload = responder.permanentSharedKey.decrypt(box);
                    }
                    msg = this.decodeMessage(payload, 'key', true);
                    this.log.debug(this.logTag, 'Received key');
                    this.handleKey(msg as saltyrtc.messages.Key, responder);
                    this.sendKey(responder);
                    break;
                case 'key-sent':
                    // Expect auth message, encrypted with our session key
                    try {
                        payload = responder.sessionSharedKey.decrypt(box);
                    } catch (e) {
                        if (e.name === 'CryptoError' && e.code === 'decryption-failed') {
                            throw new SignalingError(
                                CloseCode.ProtocolError, 'Could not decrypt auth message.');
                        } else {
                            throw e;
                        }
                    }
                    msg = this.decodeMessage(payload, 'auth', true);
                    this.log.debug(this.logTag, 'Received auth');
                    this.handleAuth(msg as saltyrtc.messages.ResponderAuth, responder, nonce);
                    this.sendAuth(responder, nonce);

                    // We're connected!
                    this.responder = this.responders.get(responder.id);

                    // Remove responder from responders list
                    this.responders.delete(responder.id);

                    // Drop other responders
                    this.dropResponders(CloseCode.DroppedByInitiator);

                    // Peer handshake done
                    this.setState('task');
                    this.log.info(this.logTag, 'Peer handshake done');
                    this.task.onPeerHandshakeDone();

                    break;
                default:
                    throw new SignalingError(CloseCode.InternalError, 'Unknown responder handshake state');
            }

        // Handle unknown source
        } else {
            throw new SignalingError(CloseCode.InternalError, 'Message source is neither the server nor a responder');
        }
    }

    protected sendClientHello(): void {
        // No-op as initiator.
    }

    protected handleServerAuth(msg: saltyrtc.messages.ServerAuth, nonce: Nonce): void {
        this.address = Signaling.SALTYRTC_ADDR_INITIATOR;

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

        // Store responders
        this.responders = new Map<number, Responder>();
        for (const id of msg.responders) {
            if (!isResponderId(id)) {
                throw new ProtocolError('Responder id ' + id + ' must be in the range 0x02-0xff');
            }
            this.processNewResponder(id);
        }
        this.log.debug(this.logTag, this.responders.size, 'responders connected');

        this.server.handshakeState = 'done';
    }

    protected initPeerHandshake(): void {
        // No-op as initiator.
    }

    /**
     * Handle an incoming new-responder message.
     */
    private handleNewResponder(msg: saltyrtc.messages.NewResponder): void {
        // Validate responder id
        if (!isResponderId(msg.id)) {
            throw new ProtocolError('Responder id ' + msg.id + ' must be in the range 0x02-0xff');
        }

        // Process responder
        this.processNewResponder(msg.id);
    }

    /**
     * A responder sends his public permanent key.
     */
    private handleToken(msg: saltyrtc.messages.Token, responder: Responder): void {
        responder.setPermanentSharedKey(new Uint8Array(msg.key), this.permanentKey);
        responder.handshakeState = 'token-received';
    }

    /**
     * A responder sends his public session key.
     */
    private handleKey(msg: saltyrtc.messages.Key, responder: Responder): void {
        // Generate our own session key & generate the shared session key
        responder.setLocalSessionKey(new KeyStore(undefined, this.log));
        responder.setSessionSharedKey(new Uint8Array(msg.key));
        responder.handshakeState = 'key-received';
    }

    /**
     * Send our public session key to the responder.
     */
    private sendKey(responder: Responder): void {
        const message: saltyrtc.messages.Key = {
            type: 'key',
            key: arrayToBuffer(responder.localSessionKey.publicKeyBytes),
        };
        const packet: Uint8Array = this.buildPacket(message, responder);
        this.log.debug(this.logTag, 'Sending key');
        this.ws.send(packet);
        responder.handshakeState = 'key-sent';
    }

    /**
     * Repeat the responder's cookie.
     */
    private sendAuth(responder: Responder, nonce: Nonce): void {
        // Ensure again that cookies are different
        if (nonce.cookie.equals(responder.cookiePair.ours)) {
            throw new ProtocolError('Their cookie and our cookie are the same.');
        }

        // Prepare task data
        const taskData: saltyrtc.TaskData = {};
        taskData[this.task.getName()] = this.task.getData();

        // Send auth
        const message: saltyrtc.messages.InitiatorAuth = {
            type: 'auth',
            your_cookie: arrayToBuffer(nonce.cookie.bytes),
            task: this.task.getName(),
            data: taskData,
        };
        const packet: Uint8Array = this.buildPacket(message, responder);
        this.log.debug(this.logTag, 'Sending auth');
        this.ws.send(packet);

        // Update state
        responder.handshakeState = 'auth-sent';
    }

    /**
     * A responder repeats our cookie and sends a list of acceptable tasks.
     *
     * @throws SignalingError
     */
    private handleAuth(msg: saltyrtc.messages.ResponderAuth, responder: Responder, nonce: Nonce): void {
        // Validate repeated cookie
        this.validateRepeatedCookie(responder, new Uint8Array(msg.your_cookie));

        // Validate task info
        try {
            InitiatorSignaling.validateTaskInfo(msg.tasks, msg.data);
        } catch (e) {
            if (e.name === 'ValidationError') {
                throw new ProtocolError('Peer sent invalid task info: ' + e.message);
            }
            throw e;
        }

        // Select task
        const task: saltyrtc.Task = InitiatorSignaling.chooseCommonTask(this.tasks, msg.tasks);
        if (task === null) {
            const requested = this.tasks.map((t) => t.getName());
            const offered = msg.tasks;
            this.log.debug(this.logTag, 'We requested:', requested, 'Peer offered:', offered);
            this.client.emit({type: 'no-shared-task', data: {requested: requested, offered: offered}});
            throw new SignalingError(CloseCode.NoSharedTask, 'No shared task could be found');
        } else {
            this.log.debug(this.logTag, 'Task', task.getName(), 'has been selected');
        }

        // Initialize task
        this.initTask(task, msg.data[task.getName()]);

        // Ok!
        this.log.debug(this.logTag, 'Responder', responder.hexId, 'authenticated');

        // Store cookie
        responder.cookiePair.theirs = nonce.cookie;

        // Update state
        responder.handshakeState = 'auth-received';
    }

    /**
     * Validate task info. Throw a ValidationError if validation fails.
     * @param names List of task names
     * @param data Task data
     * @throws ValidationError
     */
    private static validateTaskInfo(names: string[], data: object): void {
        if (names.length < 1) {
            throw new ValidationError('Task names must not be empty');
        }
        if (Object.keys(data).length < 1) {
            throw new ValidationError('Task data must not be empty');
        }
        if (names.length !== Object.keys(data).length) {
            throw new ValidationError('Task data must contain an entry for every task');
        }
        for (const task of names) {
            if (!data.hasOwnProperty(task)) {
                throw new ValidationError('Task data must contain an entry for every task');
            }
        }
    }

    /**
     * Choose the first task in our own list of supported tasks that is also contained in the list
     * of supported tasks provided by the peer.
     *
     * @returns The selected task, or null if no common task could be found.
     */
    private static chooseCommonTask(ourTasks: saltyrtc.Task[], theirTasks: string[]): saltyrtc.Task {
        for (const task of ourTasks) {
            if (theirTasks.indexOf(task.getName()) !== -1) {
                return task;
            }
        }
        return null;
    }

    /**
     * Handle a send error.
     */
    protected _handleSendError(receiver: number): void {
        // Validate receiver byte
        if (!isResponderId(receiver)) {
            throw new ProtocolError('Outgoing c2c messages must have been sent to a responder');
        }

        let notify = false;
        if (this.responder === null) { // We're not yet authenticated
            // Get responder
            const responder: Responder = this.responders.get(receiver);
            if (responder === null || responder === undefined) {
                this.log.warn(this.logTag, 'Got send-error message for unknown responder', receiver);
            } else {
                notify = true;
                // Drop information about responder
                this.responders.delete(receiver);
            }
        } else { // We're authenticated
            if (this.responder.id === receiver) {
                notify = true;
                this.resetConnection(CloseCode.ProtocolError);
                // TODO: Maybe keep ws connection open and wait for reconnect (#63)
            } else {
                this.log.warn(this.logTag, 'Got send-error message for unknown responder', receiver);
            }
        }

        if (notify === true) {
            this.client.emit({type: 'signaling-connection-lost', data: receiver});
        }
    }

    /**
     * Drop all responders.
     */
    private dropResponders(reason: number): void {
        this.log.debug(this.logTag, 'Dropping', this.responders.size, 'other responders.');
        for (const id of this.responders.keys()) {
            this.dropResponder(id, reason);
        }
    }

    /**
     * Send a drop-responder request to the server.
     */
    private dropResponder(responderId: number, reason: number) {
        const message: saltyrtc.messages.DropResponder = {
            type: 'drop-responder',
            id: responderId,
            reason: reason,
        };
        const packet: Uint8Array = this.buildPacket(message, this.server);
        this.log.debug(this.logTag, 'Sending drop-responder', byteToHex(responderId));
        this.ws.send(packet);
        this.responders.delete(responderId);
    }
}
