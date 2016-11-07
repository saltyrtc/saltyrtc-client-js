/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path='../../saltyrtc-client.d.ts' />

import { AuthToken } from "../keystore";
import { Nonce } from "../nonce";
import { Responder, Peer } from "../peers";
import { ProtocolError, SignalingError, ValidationError } from "../exceptions";
import { CloseCode } from "../closecode";
import { Signaling } from "./common";
import { decryptKeystore, isResponderId } from "./helpers";
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
    constructor(client: saltyrtc.SaltyRTC, host: string, port: number, serverKey: Uint8Array,
                tasks: saltyrtc.Task[], pingInterval: number,
                permanentKey: saltyrtc.KeyStore, responderTrustedKey?: Uint8Array) {
        super(client, host, port, serverKey, tasks, pingInterval, permanentKey, responderTrustedKey);
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
                return this.permanentKey.encrypt(payload, nonceBytes, responder.permanentKey);
            default:
                return responder.keyStore.encrypt(payload, nonceBytes, responder.sessionKey);
        }
    }

    protected getPeer(): Peer {
        if (this.responder !== null) {
            return this.responder;
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
     * @throws SignalingError
     */
    protected processNewResponder(responderId: number): void {
        // Drop responder if it's already known
        if (this.responders.has(responderId)) {
            this.responders.delete(responderId);
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
    }

    protected onPeerHandshakeMessage(box: saltyrtc.Box, nonce: Nonce): void {
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
            payload = decryptKeystore(box, this.permanentKey, this.server.sessionKey, 'server');

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
                        console.warn(this.logTag, 'Could not decrypt token message: ', e);
                        this.dropResponder(responder.id, CloseCode.InitiatorCouldNotDecrypt);
                        return;
                    }

                    msg = this.decodeMessage(payload, 'token', true);
                    console.debug(this.logTag, 'Received token');
                    this.handleToken(msg as saltyrtc.messages.Token, responder);
                    break;
                case 'token-received':
                    // Expect key message, encrypted with our permanent key
                    const peerPublicKey = this.peerTrustedKey || responder.permanentKey;
                    try {
                        payload = this.permanentKey.decrypt(box, peerPublicKey);
                    } catch (e) {
                        if (this.peerTrustedKey !== null) {
                            // Decryption failed.
                            // We trust a responder, but this particular responder used a different key.
                            console.warn(this.logTag, 'Could not decrypt key message');
                            this.dropResponder(responder.id, CloseCode.InitiatorCouldNotDecrypt);
                            return;
                        }
                        throw e;
                    }
                    msg = this.decodeMessage(payload, 'key', true);
                    console.debug(this.logTag, 'Received key');
                    this.handleKey(msg as saltyrtc.messages.Key, responder);
                    this.sendKey(responder);
                    break;
                case 'key-sent':
                    // Expect auth message, encrypted with our session key
                    // Note: The session key related to the responder is
                    // responder.keyStore, not this.sessionKey!
                    payload = decryptKeystore(box, responder.keyStore, responder.sessionKey, 'auth');
                    msg = this.decodeMessage(payload, 'auth', true);
                    console.debug(this.logTag, 'Received auth');
                    this.handleAuth(msg as saltyrtc.messages.ResponderAuth, responder, nonce);
                    this.sendAuth(responder, nonce);

                    // We're connected!
                    this.responder = this.responders.get(responder.id);
                    this.sessionKey = responder.keyStore;

                    // Remove responder from responders list
                    this.responders.delete(responder.id);

                    // Drop other responders
                    this.dropResponders(CloseCode.DroppedByInitiator);

                    // Peer handshake done
                    this.setState('task');
                    console.info(this.logTag, 'Peer handshake done');
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
        this.validateNonce(nonce, this.address, Signaling.SALTYRTC_ADDR_SERVER);

        // Validate repeated cookie
        this.validateRepeatedCookie(this.server, msg.your_cookie);

        // Store responders
        this.responders = new Map<number, Responder>();
        for (let id of msg.responders) {
            if (!isResponderId(id)) {
                throw new ProtocolError("Responder id " + id + " must be in the range 0x02-0xff");
            }
            this.processNewResponder(id);
        }
        console.debug(this.logTag, this.responders.size, 'responders connected');

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
            throw new ProtocolError("Responder id " + msg.id + " must be in the range 0x02-0xff");
        }

        // Process responder
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
     * A responder sends his public session key.
     */
    private handleKey(msg: saltyrtc.messages.Key, responder: Responder): void {
        responder.sessionKey = new Uint8Array(msg.key);
        responder.handshakeState = 'key-received';
    }

    /**
     * Send our public session key to the responder.
     */
    private sendKey(responder: Responder): void {
        const message: saltyrtc.messages.Key = {
            type: 'key',
            key: responder.keyStore.publicKeyBytes.buffer,
        };
        const packet: Uint8Array = this.buildPacket(message, responder);
        console.debug(this.logTag, 'Sending key');
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
        const taskData = {};
        taskData[this.task.getName()] = this.task.getData();

        // Send auth
        const message: saltyrtc.messages.InitiatorAuth = {
            type: 'auth',
            your_cookie: nonce.cookie.asArrayBuffer(),
            task: this.task.getName(),
            data: taskData,
        };
        const packet: Uint8Array = this.buildPacket(message, responder);
        console.debug(this.logTag, 'Sending auth');
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
        this.validateRepeatedCookie(responder, msg.your_cookie);

        // Validate task info
        try {
            InitiatorSignaling.validateTaskInfo(msg.tasks, msg.data);
        } catch (e) {
            if (e instanceof ValidationError) {
                throw new ProtocolError("Peer sent invalid task info: " + e.message);
            } throw e;
        }

        // Select task
        const task: saltyrtc.Task = InitiatorSignaling.chooseCommonTask(this.tasks, msg.tasks);
        if (task === null) {
            throw new SignalingError(CloseCode.NoSharedTask, "No shared task could be found");
        } else {
            console.log(this.logTag, "Task", task.getName(), "has been selected");
        }

        // Initialize task
        this.initTask(task, msg.data[task.getName()]);

        // Ok!
        console.debug(this.logTag, 'Responder', responder.hexId, 'authenticated');

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
    private static validateTaskInfo(names: string[], data: Object): void {
        if (names.length < 1) {
            throw new ValidationError("Task names must not be empty");
        }
        if (Object.keys(data).length < 1) {
            throw new ValidationError("Task data must not be empty");
        }
        if (names.length != Object.keys(data).length) {
            throw new ValidationError("Task data must contain an entry for every task");
        }
        for (let task of names) {
            if (!data.hasOwnProperty(task)) {
                throw new ValidationError("Task data must contain an entry for every task");
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
        for (let task of ourTasks) {
            if (theirTasks.indexOf(task.getName()) !== -1) {
                return task;
            }
        }
        return null;
    }

    /**
     * Drop all responders.
     */
    private dropResponders(reason: number): void {
        console.debug(this.logTag, 'Dropping', this.responders.size, 'other responders.');
        for (let id of this.responders.keys()) {
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
        console.debug(this.logTag, 'Sending drop-responder', byteToHex(responderId));
        this.ws.send(packet);
        this.responders.delete(responderId);
    }
}
