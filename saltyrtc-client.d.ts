/**
 * Copyright (C) 2016-2018 Threema GmbH
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

    interface HandoverState {
        local: boolean;
        peer: boolean;
        readonly any: boolean;
        readonly both: boolean;
        onBoth: () => void;
        reset(): void;
    }

    type SignalingChannel = 'websocket' | 'datachannel';

    type SignalingRole = 'initiator' | 'responder';

    interface SaltyRTCEvent {
        type: string;
        data?: any;
    }
    type SaltyRTCEventHandler = (event: SaltyRTCEvent) => boolean | void;

    type TaskData = { [index:string] : any };

    interface Signaling {
        handoverState: HandoverState;
        role: SignalingRole;

        getState(): SignalingState;
        setState(state: SignalingState): void;

        /**
         * Send a task message through the websocket or - if handover has
         * already happened - through the task channel.
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
         *
         * If no reason is passed in, this will be treated as a quiet
         * reset - no listeners will be notified.
         *
         * @param reason The close code to use.
         */
        resetConnection(reason?: number): void;
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
        init(signaling: Signaling, data: TaskData): void;

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
         * Send a signaling message through the task signaling channel.
         *
         * This method should only be called after the handover.
         *
         * @param payload The *unencrypted* message bytes. Message will be encrypted by the task.
         * @throws SignalingError if something goes wrong.
         */
        sendSignalingMessage(payload: Uint8Array): void;

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
        getData(): TaskData;

        /**
         * Close any task connections that may be open.
         *
         * This method is called by the signaling class in two cases:
         *
         * - When sending and receiving 'close' messages
         * - When the user explicitly requests to close the connection
         */
        close(reason: number): void;
    }

    type ServerInfoFactory = (initiatorPublicKey: string) => {host: string, port: number};

    interface SaltyRTCBuilder {
        connectTo(host: string, port: number): SaltyRTCBuilder;
        connectWith(serverInfo: ServerInfoFactory): SaltyRTCBuilder;
        withKeyStore(keyStore: KeyStore): SaltyRTCBuilder;
        withTrustedPeerKey(peerTrustedKey: Uint8Array | string): SaltyRTCBuilder;
        withServerKey(serverKey: Uint8Array | string): SaltyRTCBuilder;
        initiatorInfo(initiatorPublicKey: Uint8Array | string, authToken: Uint8Array | string): SaltyRTCBuilder;
        usingTasks(tasks: Task[]): SaltyRTCBuilder;
        withPingInterval(interval: number): SaltyRTCBuilder;

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

        getTask(): Task;

        connect(): void;
        disconnect(): void;

        sendApplicationMessage(data: any): void;

        // Event handling
        on(event: string | string[], handler: SaltyRTCEventHandler): void;
        once(event: string | string[], handler: SaltyRTCEventHandler): void;
        off(event: string | string[], handler?: SaltyRTCEventHandler): void;
        emit(event: SaltyRTCEvent): void;
    }

    interface EventRegistry {
        /**
         * Register an event handler for the specified event(s).
         */
        register(eventType: string | string[], handler: SaltyRTCEventHandler): void;

        /**
         * Unregister an event handler for the specified event(s).
         * If no handler is specified, all handlers for the specified event(s) are removed.
         */
        unregister(eventType: string | string[], handler?: SaltyRTCEventHandler): void;

        /**
         * Return all event handlers for the specified event(s).
         *
         * The return value is always an array. If the event does not exist, the
         * array will be empty.
         *
         * Even if a handler is registered for multiple events, it is only returned once.
         */
        get(eventType: string | string[]): SaltyRTCEventHandler[];
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

    interface SignalingError extends Error {
        closeCode: number;
    }

    interface ConnectionError extends Error {
    }

}

declare namespace saltyrtc.messages {

    type MessageType = 'server-hello' | 'client-hello' | 'client-auth'
                     | 'server-auth' | 'new-initiator' | 'new-responder'
                     | 'drop-responder' | 'send-error' | 'token' | 'key'
                     | 'auth' | 'restart' | 'close' | 'application';

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
        your_key?: ArrayBuffer | null;
        subprotocols: string[];
        ping_interval: number;
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
        reason?: number;
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#send-error
    interface SendError extends SignalingMessage {
        type: 'send-error';
        id: ArrayBuffer;
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
        data: { [index:string] : any };
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

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#close-message
    interface Close extends SignalingMessage {
        type: 'close';
        reason: number;
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#application-message
    interface Application extends Message {
        type: 'application';
        data: any;
    }

    /**
     * A task message must include the type. It may contain arbitrary other data.
     */
    interface TaskMessage extends Message {
        type: string;
        [others: string]: any; // Make this an open interface
    }

}

declare namespace saltyrtc.static {

    interface SaltyRTCBuilder {
        new(): saltyrtc.SaltyRTCBuilder;
    }

    interface KeyStore {
        new(publicKey?: Uint8Array | string, secretKey?: Uint8Array | string): saltyrtc.KeyStore;
    }

    interface Box {
        new(nonce: Uint8Array, data: Uint8Array, nonceLength: number): saltyrtc.Box;
        fromUint8Array(array: Uint8Array, nonceLength: number): saltyrtc.Box;
    }

    interface Cookie {
        COOKIE_LENGTH: number;
        new(bytes?: Uint8Array): saltyrtc.Cookie;
        fromArrayBuffer(buffer: ArrayBuffer): saltyrtc.Cookie;
    }

    interface CookiePair {
        new(ours?: saltyrtc.Cookie, theirs?: saltyrtc.Cookie): saltyrtc.CookiePair;
    }

    interface CombinedSequence {
        SEQUENCE_NUMBER_MAX: number;
        OVERFLOW_MAX: number;
        new(): saltyrtc.CombinedSequence;
    }

    interface CombinedSequencePair {
        new(ours?: saltyrtc.CombinedSequence, theirs?: number): saltyrtc.CombinedSequencePair;
    }

    interface EventRegistry {
        new(): saltyrtc.EventRegistry;
    }

    interface SignalingError {
        new(closeCode: number, message: string): saltyrtc.SignalingError;
    }

    interface ConnectionError {
        new(message: string): saltyrtc.ConnectionError;
    }

    /**
     * Static list of close codes.
     */
    interface CloseCode {
        ClosingNormal: number;
        GoingAway: number;
        NoSharedSubprotocol: number;
        PathFull: number;
        ProtocolError: number;
        InternalError: number;
        Handover: number;
        DroppedByInitiator: number;
        InitiatorCouldNotDecrypt: number;
        NoSharedTask: number;
        InvalidKey: number;
    }
}

declare var saltyrtcClient: {
    SaltyRTCBuilder: saltyrtc.static.SaltyRTCBuilder;
    KeyStore: saltyrtc.static.KeyStore;
    Box: saltyrtc.static.Box;
    Cookie: saltyrtc.static.Cookie;
    CookiePair: saltyrtc.static.CookiePair;
    CombinedSequence: saltyrtc.static.CombinedSequence;
    CombinedSequencePair: saltyrtc.static.CombinedSequencePair;
    EventRegistry: saltyrtc.static.EventRegistry;
    CloseCode: saltyrtc.static.CloseCode;
    explainCloseCode: (code: number) => string;
    SignalingError: saltyrtc.static.SignalingError;
    ConnectionError: saltyrtc.static.ConnectionError;
};
