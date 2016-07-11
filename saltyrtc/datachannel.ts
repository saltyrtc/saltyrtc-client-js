/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path="types/RTCPeerConnection.d.ts" />
/// <reference path="saltyrtc.d.ts" />

import { KeyStore, Box } from "./keystore";
import { Chunkifier, Unchunkifier } from "./chunkifier";
import { SaltyRTC } from "./client";


/**
 * Wrapper around a regular DataChannel.
 *
 * This type wraps the original DataChannel and provides the same interface.
 */
export class SecureDataChannel implements saltyrtc.SecureDataChannel {
    private dc: RTCDataChannel;
    private saltyrtc: SaltyRTC;
    private _onmessage: saltyrtc.MessageEventHandler;
    private logTag = 'SecureDataChannel:';

    constructor(dc: RTCDataChannel, saltyrtc: SaltyRTC) {
        if (dc.binaryType !== 'arraybuffer') {
            throw new Error('Currently SaltyRTC can only handle data channels ' +
                            'with `binaryType` set to `arraybuffer`.');
        }
        this.dc = dc;
        this.saltyrtc = saltyrtc;
        this.dc.onmessage = this.onEncryptedMessage;
    }

    public send(data: string | Blob | ArrayBuffer | ArrayBufferView) {
        this.saltyrtc.sendData('dc-' + this.dc.id.toString(), data, this.dc);
    }

    private onEncryptedMessage = (event: RTCMessageEvent) => {
        // If _onmessage is not defined, exit immediately.
        if (this._onmessage === undefined) {
            return;
        }

        // Event object is read-only, so we need to clone it.
        const fakeEvent = {};
        for (const x in event) {
            fakeEvent[x] = event[x];
        }

        // Overwrite data with decoded data
        console.debug(this.logTag, 'Decrypt data...');
        fakeEvent['data'] = this.saltyrtc.decryptData(event.data);

        // Call original handler
        this._onmessage.bind(this.dc)(fakeEvent);
    }

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
