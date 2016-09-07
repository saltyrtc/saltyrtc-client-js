/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path="types/RTCPeerConnection.d.ts" />
/// <reference path="saltyrtc.d.ts" />

import { Box } from "./keystore";
import { Signaling } from "./signaling";
import { Chunker, Unchunker } from "../libs/chunked-dc-js/src/main";


/**
 * Wrapper around a regular DataChannel.
 *
 * This type wraps the original DataChannel and provides the same interface.
 */
export class SecureDataChannel implements saltyrtc.SecureDataChannel {
    private dc: RTCDataChannel;

    private signaling: Signaling;
    private _onmessage: saltyrtc.MessageEventHandler;
    private logTag = 'SecureDataChannel:';

    // Chunking
    private static CHUNK_SIZE = 16000;
    private static CHUNK_COUNT_GC = 32;
    private static CHUNK_MAX_AGE = 60000;
    private messageNumber = 0;
    private chunkCount = 0;
    private unchunker = new Unchunker();

    constructor(dc: RTCDataChannel, signaling: Signaling) {
        if (dc.binaryType !== 'arraybuffer') {
            throw new Error('Currently SaltyRTC can only handle data channels ' +
                            'with `binaryType` set to `arraybuffer`.');
        }
        this.dc = dc;
        this.signaling = signaling;

        // Incoming dc messages are sent to the unchunker
        this.dc.onmessage = this.onChunk;

        // Complete chunks are handled
        this.unchunker.onMessage = this.onEncryptedMessage;
    }

    public send(data: string | Blob | ArrayBuffer | ArrayBufferView) {
        // Validate input data
        let buffer: ArrayBuffer;
        if (typeof data === 'string') {
            throw new Error('SecureDataChannel can only handle binary data.');
        } else if (data instanceof Blob) {
            throw new Error('SecureDataChannel does not currently support Blob data. ' +
                            'Please pass in an ArrayBuffer or a typed array (e.g. Uint8Array).');
        } else if (data instanceof Int8Array ||
                   data instanceof Uint8ClampedArray ||
                   data instanceof Int16Array ||
                   data instanceof Uint16Array ||
                   data instanceof Int32Array ||
                   data instanceof Uint32Array ||
                   data instanceof Float32Array ||
                   data instanceof Float64Array ||
                   data instanceof DataView) {
            const start = data.byteOffset || 0;
            const end = start + (data.byteLength || data.buffer.byteLength);
            buffer = data.buffer.slice(start, end);
        } else if (data instanceof Uint8Array) {
            buffer = data.buffer;
        } else if (data instanceof ArrayBuffer) {
            buffer = data;
        } else {
            throw new Error('Unknown data type. Please pass in an ArrayBuffer ' +
                            'or a typed array (e.g. Uint8Array).');
        }

        // Encrypt data
        const box: Box = this.signaling.encryptData(buffer, this);
        const encryptedBytes: Uint8Array = box.toUint8Array();

        // Split into chunks
        const chunker = new Chunker(this.messageNumber++, encryptedBytes, SecureDataChannel.CHUNK_SIZE);
        for (let chunk of chunker) {
            this.dc.send(chunk);
        }
    }

    private onChunk = (event: RTCMessageEvent) => {
        console.debug('Received chunk');

        // If type is not supported, exit immediately
        if (event.data instanceof Blob) {
            console.warn(this.logTag, 'Received message in blob format, which is not currently supported.');
            return;
        } else if (typeof event.data == 'string') {
            console.warn(this.logTag, 'Received message in string format, which is not currently supported.');
            return;
        } else if (!(event.data instanceof ArrayBuffer)) {
            console.warn(this.logTag, 'Received message in unsupported format. Please send ArrayBuffer objects.');
            return;
        }

        // Register chunk
        this.unchunker.add(event.data as ArrayBuffer, event);

        // Clean up old chunks regularly
        if (this.chunkCount++ > SecureDataChannel.CHUNK_COUNT_GC) {
            this.unchunker.gc(SecureDataChannel.CHUNK_MAX_AGE);
            this.chunkCount = 0;
        }
    };

    private onEncryptedMessage = (data: Uint8Array, context: MessageEvent[]) => {
        // If _onmessage is not defined, exit immediately.
        if (this._onmessage === undefined) {
            return;
        }

        // Create a new MessageEvent instance based on the context of the final chunk.
        const fakeEvent = {};
        for (let x in context[context.length - 1]) {
            fakeEvent[x] = event[x];
        }

        // Overwrite data with decoded data
        console.debug(this.logTag, 'Decrypt data...');
        const box = Box.fromUint8Array(new Uint8Array(data), nacl.box.nonceLength);
        fakeEvent['data'] = this.signaling.decryptData(box);

        // Call original handler
        this._onmessage.bind(this.dc)(fakeEvent);
    };

    // Readonly attributes
    get label(): string { return this.dc.label; }
    get ordered(): boolean { return this.dc.ordered; }
    get maxPacketLifeTime(): number { return this.dc.maxPacketLifeTime; }
    get maxRetransmits(): number { return this.dc.maxRetransmits; }
    get protocol(): string { return this.dc.protocol; }
    get negotiated(): boolean { return this.dc.negotiated; }
    get id(): number { return this.dc.id; }
    get readyState(): RTCDataChannelState { return this.dc.readyState; }
    get bufferedAmount(): number { return this.dc.bufferedAmount; }

    // Read/write attributes
    get bufferedAmountLowThreshold(): number { return this.dc.bufferedAmountLowThreshold; }
    set bufferedAmountLowThreshold(value: number) { this.dc.bufferedAmountLowThreshold = value; }
    get binaryType(): RTCBinaryType { return this.dc.binaryType; }
    set binaryType(value: RTCBinaryType) { this.dc.binaryType = value; }

    // Event handlers
    get onopen(): saltyrtc.EventHandler { return this.dc.onopen; }
    set onopen(value: saltyrtc.EventHandler) { this.dc.onopen = value; }
    get onbufferedamountlow(): saltyrtc.EventHandler { return this.dc.onbufferedamountlow; }
    set onbufferedamountlow(value: saltyrtc.EventHandler) { this.dc.onbufferedamountlow = value; }
    get onerror(): saltyrtc.EventHandler { return this.dc.onerror; }
    set onerror(value: saltyrtc.EventHandler) { this.dc.onerror = value; }
    get onclose(): saltyrtc.EventHandler { return this.dc.onclose; }
    set onclose(value: saltyrtc.EventHandler) { this.dc.onclose = value; }
    get onmessage(): saltyrtc.MessageEventHandler { return this.dc.onmessage; }
    set onmessage(value: saltyrtc.MessageEventHandler) { this._onmessage = value; }

    // Regular methods
    close(): void { this.dc.close(); }

    // EventTarget API (according to https://developer.mozilla.org/de/docs/Web/API/EventTarget)
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void {
        if (type === 'message') {
            throw new Error('addEventListener on message events is not currently supported by SaltyRTC.');
        } else {
            this.dc.addEventListener(type, listener, useCapture);
        }
    }
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void {
        if (type === 'message') {
            throw new Error('removeEventListener on message events is not currently supported by SaltyRTC.');
        } else {
            this.dc.removeEventListener(type, listener, useCapture);
        }
    }
    dispatchEvent(e: Event): boolean { return this.dc.dispatchEvent(e); }
}
