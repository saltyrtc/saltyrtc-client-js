/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path="types/RTCPeerConnection.d.ts" />

declare namespace saltyrtc {

    interface Box {
        //constructor(nonce: Uint8Array, data: Uint8Array, nonceLength: number);
        length: number;
        data: Uint8Array;
        nonce: Uint8Array;
        //static fromUint8Array(array: Uint8Array, nonceLength: number): Box;
        toUint8Array(): Uint8Array;
    }

    interface KeyStore {
        //constructor();
        publicKeyHex: string;
        publicKeyBytes: Uint8Array;
        secretKeyHex: string;
        secretKeyBytes: Uint8Array;
        encrypt(bytes: Uint8Array, nonce: Uint8Array, otherKey: Uint8Array): Box;
        decrypt(box: Box, otherKey: Uint8Array): Uint8Array;
    }

    interface AuthToken {
        //constructor(bytes?: Uint8Array);
        keyBytes: Uint8Array;
        keyHex: string;
        encrypt(bytes: Uint8Array, nonce: Uint8Array): Box;
        decrypt(box: Box): Uint8Array;
    }

    interface Message {
        type: messages.MessageType,
    }

    type State = 'new' | 'ws-connecting' | 'server-handshake' | 'peer-handshake' | 'open' | 'closing' | 'closed';

    type SignalingChannel = 'websocket' | 'datachannel';

    type SignalingRole = 'initiator' | 'responder';

    interface SaltyRTCEvent {
        type: string;
        data?: any;
    }

    type EventHandler = (event: Event) => void;
    type SaltyEventHandler = (event: SaltyRTCEvent) => boolean | void;
    type MessageEventHandler = (event: RTCMessageEvent) => void;

    interface SecureDataChannel extends RTCDataChannel {
        send(data: string | Blob | ArrayBuffer | ArrayBufferView): void;
        label: string;
        ordered: boolean;
        maxPacketLifeTime: number;
        maxRetransmits: number;
        protocol: string;
        negotiated: boolean;
        id: number;
        readyState: RTCDataChannelState;
        bufferedAmount: number;
        bufferedAmountLowThreshold: number;
        binaryType: RTCBinaryType;
        onopen: EventHandler;
        onbufferedamountlow: EventHandler;
        onerror: EventHandler;
        onclose: EventHandler;
        onmessage: MessageEventHandler;
        close(): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
        dispatchEvent(e: Event): boolean;
    }

    interface SaltyRTCBuilder {
        connectTo(host: string, port: number): SaltyRTCBuilder;
        withKeyStore(keyStore: KeyStore): SaltyRTCBuilder;
        initiatorInfo(initiatorPublicKey: Uint8Array, authToken: Uint8Array): SaltyRTCBuilder;

        asInitiator(): SaltyRTC;
        asResponder(): SaltyRTC;
    }

    interface SaltyRTC {
        state: State;
        signalingChannel: SignalingChannel;

        permanentKeyBytes: Uint8Array;
        permanentKeyHex: string;
        authTokenBytes: Uint8Array;
        authTokenHex: string;

        connect(): void;
        disconnect(): void;
        sendSignalingData(dataType: string, data: any): void;
        decryptSignalingData(data: ArrayBuffer): any;
        handover(pc: RTCPeerConnection): Promise<{}>;
        wrapDataChannel(dc: RTCDataChannel): SecureDataChannel;

        // Event handling
        on(event: string | string[], handler: SaltyEventHandler): void;
        once(event: string | string[], handler: SaltyEventHandler): void;
        off(event: string | string[], handler?: SaltyEventHandler): void;
        emit(event: SaltyRTCEvent): void;
    }

}

declare namespace saltyrtc.messages {

    type MessageType = 'server-hello' | 'client-hello' | 'client-auth'
                     | 'server-auth' | 'new-initiator' | 'new-responder'
                     | 'drop-responder' | 'send-error' | 'token' | 'key'
                     | 'auth' | 'restart' | 'data';

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#server-hello
    interface ServerHello extends Message {
        type: 'server-hello',
        key: ArrayBuffer,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#client-hello
    interface ClientHello extends Message {
        type: 'client-hello',
        key: ArrayBuffer,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#client-auth
    interface ClientAuth extends Message {
        type: 'client-auth',
        your_cookie: ArrayBuffer,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#server-auth
    interface ServerAuth extends Message {
        type: 'server-auth',
        your_cookie: ArrayBuffer,
        initiator_connected?: boolean,
        responders?: number[],
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#new-initiator
    interface NewInitiator extends Message {
        type: 'new-initiator',
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#new-responder
    interface NewResponder extends Message {
        type: 'new-responder',
        id: number,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#drop-responder
    interface DropResponder extends Message {
        type: 'drop-responder',
        id: number,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#send-error
    interface SendError extends Message {
        type: 'send-error',
        hash: ArrayBuffer,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#token
    interface Token extends Message {
        type: 'token',
        key: ArrayBuffer,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#key
    interface Key extends Message {
        type: 'key',
        key: ArrayBuffer,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#auth
    interface Auth extends Message {
        type: 'auth',
        your_cookie: ArrayBuffer,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#restart
    interface Restart extends Message {
        type: 'restart',
    }

    interface Data extends Message {
        type: 'data',
        data_type?: string,
        data: any,
    }

}
