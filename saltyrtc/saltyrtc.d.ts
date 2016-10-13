/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

declare namespace saltyrtc {

    interface Box {
        length: number;
        data: Uint8Array;
        nonce: Uint8Array;
        toUint8Array(): Uint8Array;
    }

    interface KeyStore {
        publicKeyHex: string;
        publicKeyBytes: Uint8Array;
        secretKeyHex: string;
        secretKeyBytes: Uint8Array;
        encrypt(bytes: Uint8Array, nonce: Uint8Array, otherKey: Uint8Array): Box;
        decrypt(box: Box, otherKey: Uint8Array): Uint8Array;
    }

    interface AuthToken {
        keyBytes: Uint8Array;
        keyHex: string;
        encrypt(bytes: Uint8Array, nonce: Uint8Array): Box;
        decrypt(box: Box): Uint8Array;
    }

    interface Message {
        type: string;
    }

    interface SignalingMessage extends Message {
        type: messages.MessageType;
    }

    type SignalingState = 'new' | 'ws-connecting' | 'server-handshake' | 'peer-handshake' | 'task' | 'closing' | 'closed';

    type HandoverState = {local: boolean, peer: boolean};

    type SignalingChannel = 'websocket' | 'datachannel';

    type SignalingRole = 'initiator' | 'responder';

    interface SaltyRTCEvent {
        type: string;
        data?: any;
    }

    type EventHandler = (event: Event) => void;
    type SaltyEventHandler = (event: SaltyRTCEvent) => boolean | void;
    type MessageEventHandler = (event: RTCMessageEvent) => void;

    interface Signaling {
        handoverState: HandoverState;
        role: SignalingRole;

        getState(): SignalingState;
        setState(state: SignalingState): void;

        /**
         * Send a task message through the websocket.
         *
         * @throws SignalingError if message could not be sent.
         */
        sendTaskMessage(msg: messages.TaskMessage): void;

        /**
         * Encrypt data for the peer.
         *
         * @param data The bytes to be encrypted.
         * @param nonce The bytes to be used as NaCl nonce.
         */
        encryptForPeer(data: Uint8Array, nonce: Uint8Array): Box;

        /**
         * Decrypt data from the peer.
         *
         * @param box The encrypted box.
         */
        decryptFromPeer(box: Box): Uint8Array;

        /**
         * Handle incoming signaling messages from the peer.
         *
         * This method can be used by tasks to pass in messages that arrived through their signaling channel.
         *
         * @param decryptedBytes The decrypted message bytes.
         * @throws SignalingError if the message is invalid.
         */
        onSignalingPeerMessage(decryptedBytes: Uint8Array): void;

        /**
         * Send a close message to the peer.
         *
         * This method may only be called once the client-to-client handshakes has been completed.
         *
         * Note that sending a close message does not reset the connection. To do that,
         * `resetConnection` needs to be called explicitly.
         *
         * @param reason The close code.
         */
        sendClose(reason: number): void;

        /**
         * Close and reset the connection with the specified close code.
         * @param reason The close code to use.
         */
        resetConnection(reason: number): void;
    }

    interface Task {
        /**
         * Initialize the task with the task data from the peer.
         *
         * The task should keep track internally whether it has been initialized or not.
         *
         * @param signaling The signaling instance.
         * @param data The data sent by the peer in the 'auth' message.
         * @throws ValidationError if task data is invalid.
         */
        init(signaling: Signaling, data: Object): void;

        /**
         * Used by the signaling class to notify task that the peer handshake is over.
         *
         * This is the point where the task can take over.
         */
        onPeerHandshakeDone(): void;

        /**
         * This method is called by SaltyRTC when a task related message
         * arrives through the WebSocket.
         *
         * @param message The deserialized MessagePack message.
         */
        onTaskMessage(message: messages.TaskMessage): void;

        /**
         * Send bytes through the task signaling channel.
         *
         * This method should only be called after the handover.
         */
        sendSignalingMessage(payload: Uint8Array);

        /**
         * Return the task protocol name.
         */
        getName(): string;

        /**
         * Return the list of supported message types.
         *
         * Incoming mssages with this type will be passed to the task.
         */
        getSupportedMessageTypes(): string[];

        /**
         * Return the task data used for negotiation in the `auth` message.
         */
        getData(): Object;

        /**
         * This method is called by the signaling class when sending and receiving 'close' messages.
         */
        close(reason: number): void;
    }

    interface SaltyRTCBuilder {
        connectTo(host: string, port: number): SaltyRTCBuilder;
        withKeyStore(keyStore: KeyStore): SaltyRTCBuilder;
        withTrustedPeerKey(peerTrustedKey: Uint8Array): SaltyRTCBuilder;
        initiatorInfo(initiatorPublicKey: Uint8Array, authToken: Uint8Array): SaltyRTCBuilder;

        asInitiator(): SaltyRTC;
        asResponder(): SaltyRTC;
    }

    interface SaltyRTC {
        state: SignalingState;

        keyStore: KeyStore;
        permanentKeyBytes: Uint8Array;
        permanentKeyHex: string;
        authTokenBytes: Uint8Array;
        authTokenHex: string;
        peerPermanentKeyBytes: Uint8Array;
        peerPermanentKeyHex: string;

        connect(): void;
        disconnect(): void;

        // Event handling
        on(event: string | string[], handler: SaltyEventHandler): void;
        once(event: string | string[], handler: SaltyEventHandler): void;
        off(event: string | string[], handler?: SaltyEventHandler): void;
        emit(event: SaltyRTCEvent): void;
    }

    interface EventRegistry {
        /**
         * Register an event handler for the specified event(s).
         */
        register(eventType: string | string[], handler: SaltyEventHandler): void;

        /**
         * Unregister an event handler for the specified event(s).
         * If no handler is specified, all handlers for the specified event(s) are removed.
         */
        unregister(eventType: string | string[], handler?: SaltyEventHandler): void;

        /**
         * Return all event handlers for the specified event(s).
         *
         * The return value is always an array. If the event does not exist, the
         * array will be empty.
         *
         * Even if a handler is registered for multiple events, it is only returned once.
         */
        get(eventType: string | string[]): SaltyEventHandler[];
    }

    interface Cookie {
        bytes: Uint8Array;
        asArrayBuffer(): ArrayBuffer;
        equals(otherCookie: Cookie): boolean;
    }

    interface CookiePair {
        ours: Cookie;
        theirs: Cookie;
    }

    type NextCombinedSequence = { sequenceNumber: number, overflow: number };

    interface CombinedSequence {
        next(): NextCombinedSequence;
    }

    interface CombinedSequencePair {
        ours: CombinedSequence;
        theirs: number;
    }

}

declare namespace saltyrtc.messages {

    type MessageType = 'server-hello' | 'client-hello' | 'client-auth'
                     | 'server-auth' | 'new-initiator' | 'new-responder'
                     | 'drop-responder' | 'send-error' | 'token' | 'key'
                     | 'auth' | 'restart' | 'data';

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#server-hello
    interface ServerHello extends SignalingMessage {
        type: 'server-hello';
        key: ArrayBuffer;
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#client-hello
    interface ClientHello extends SignalingMessage {
        type: 'client-hello';
        key: ArrayBuffer;
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#client-auth
    interface ClientAuth extends SignalingMessage {
        type: 'client-auth';
        your_cookie: ArrayBuffer;
        subprotocols: string[];
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#server-auth
    interface ServerAuth extends SignalingMessage {
        type: 'server-auth';
        your_cookie: ArrayBuffer;
        signed_keys?: ArrayBuffer;
        initiator_connected?: boolean;
        responders?: number[];
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#new-initiator
    interface NewInitiator extends SignalingMessage {
        type: 'new-initiator';
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#new-responder
    interface NewResponder extends SignalingMessage {
        type: 'new-responder';
        id: number;
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#drop-responder
    interface DropResponder extends SignalingMessage {
        type: 'drop-responder';
        id: number;
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#send-error
    interface SendError extends SignalingMessage {
        type: 'send-error';
        hash: ArrayBuffer;
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#token-message
    interface Token extends SignalingMessage {
        type: 'token';
        key: ArrayBuffer;
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#key-message
    interface Key extends SignalingMessage {
        type: 'key';
        key: ArrayBuffer;
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#auth-message
    interface Auth extends SignalingMessage {
        type: 'auth';
        your_cookie: ArrayBuffer;
        data: Object;
    }
    interface InitiatorAuth extends Auth {
        task: string;
    }
    interface ResponderAuth extends Auth {
        tasks: string[];
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#restart
    interface Restart extends SignalingMessage {
        type: 'restart';
    }

    interface Data extends SignalingMessage {
        type: 'data';
        data_type?: string;
        data: any;
    }

    /**
     * A task message must include the type. It may contain arbitrary other data.
     */
    interface TaskMessage extends Message {
        type: string;
    }

}

declare namespace saltyrtc.static {

    interface KeyStore {
        new(publicKey?: Uint8Array, secretKey?: Uint8Array): saltyrtc.KeyStore;
    }

    interface SaltyRTCBuilder {
        new(): saltyrtc.SaltyRTCBuilder;
    }

}

declare var saltyrtc: {
    KeyStore: saltyrtc.static.KeyStore;
    SaltyRTCBuilder: saltyrtc.static.SaltyRTCBuilder;
};
