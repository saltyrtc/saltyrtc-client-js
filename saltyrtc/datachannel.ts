/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path="types/angular.d.ts" />
/// <reference path="peerconnection.ts" />

import { KeyStore, Box } from "./keystore";
import { PeerConnection } from "./peerconnection";
import { randomString } from "./utils";

/**
 * A message that is sent through the data channel.
 */
interface DCMessage {
    type: "message" | "heartbeat" | "heartbeat-ack",
    data: string | Object,
}

class Chunkifier {
    private _array: Uint8Array;
    private _chunkSize: number;
    private _chunks: Uint8Array[] = null;

    constructor(array: Uint8Array, chunkSize: number) {
        this._array = array;
        this._chunkSize = chunkSize;
    }

    get chunks(): Uint8Array[] {
        return this._getChunks();
    }

    private _offset(index: number): number {
        return index * (this._chunkSize - 1);
    }

    private _hasNext(index: number): boolean {
        return this._offset(index) < this._array.length;
    }

    private _getChunks(): Uint8Array[] {
        // Generate chunks on demand
        if (this._chunks === null) {
            this._chunks = [];
            let index = 0;
            while (this._hasNext(index)) {
                // More chunks?
                let offset = this._offset(index);
                let length = Math.min(this._chunkSize, this._array.length + 1 - offset);
                let buffer = new ArrayBuffer(length);
                let view = new DataView(buffer);

                // Put more chunks indicator into buffer
                if (this._hasNext(index + 1)) {
                    view.setUint8(0, 1);
                } else {
                    view.setUint8(0, 0);
                }

                // Add array slice to buffer
                let array = new Uint8Array(buffer);
                let end = Math.min(this._offset(index + 1), this._array.length);
                let chunk = this._array.slice(offset, end);
                array.set(chunk, 1);

                // Add array to list of chunks
                this._chunks[index] = array;
                index += 1;
            }
        }
        return this._chunks;
    }
}

class Unchunkifier {
    private _events;
    private _chunks: Uint8Array[];
    private _length: number = 0;

    constructor(events) {
        this._events = events;
        this._reset();
    }

    /**
     * Add a chunk.
     */
    add(array: Uint8Array): void {
        if (array.length == 0) {
            return;
        }
        let view = new DataView(array.buffer);

        // Add to list
        this._chunks.push(array);
        this._length += (array.length - 1);

        // More chunks?
        let moreChunks = view.getUint8(0);
        if (moreChunks == 0) {
            this._done();
        } else if (moreChunks != 1) {
            throw 'Invalid chunk received: ' + moreChunks;
        }
    }

    /**
     * Reset the unchunkifier data.
     */
    private _reset(): void {
        this._chunks = [];
        this._length = 0;
    }

    private _done() {
        let message = this._merge();
        this._reset();
        this._events.onCompletedMessage(message);
    }

    private _merge() {
        let array = new Uint8Array(this._length);

        // Add all chunks apart from the first byte
        let offset = 0;
        for (var chunk of this._chunks) {
            array.set(chunk.slice(1), offset);
            offset += chunk.length - 1;
        }

        return array;
    }
}

class DataChannelEvents {
    private _dc;
    private _stopped: boolean = false;
    private _unchunkifier: Unchunkifier;
    private $rootScope: angular.IRootScopeService;

    constructor(dc: DataChannel, $rootScope: angular.IRootScopeService) {
        this._dc = dc;
        this.$rootScope = $rootScope;
        this._unchunkifier = new Unchunkifier(this);
    }

    stop(): void {
        this._stopped = true;
    }

    onOpen = () => {
        if (this._stopped === false) {
            this.$rootScope.$apply(() => this._dc.state = 'open');
        }
    };

    onError = (error) => {
        if (this._stopped === false) {
            this.$rootScope.$apply(() => {
                console.error('General Data Channel error:', error);
                this.$rootScope.$broadcast('dc:error', 'general', error);
            })
        }
    };

    onClose = () => {
        if (this._stopped === false) {
            this.$rootScope.$apply(() => this._dc.state = 'closed');
        }
    };

    onMessage = (event) => {
        if (this._stopped === false) {
            try {
                // Convert to Uint8Array and add to unchunkifier
                this._unchunkifier.add(new Uint8Array(event.data));
            } catch(error) {
                this.$rootScope.$broadcast('dc:error', 'chunk', error);
            }
        }
    };

    onCompletedMessage = (array: Uint8Array) => {
        if (this._stopped === false) {
            this.$rootScope.$apply(() => this._dc._receive(array));
        }
    };
}

export class DataChannel {
    static LABEL: string = 'saltyrtc';
    static HEARTBEAT_ACK_TIMEOUT: number = 10000;
    static MTU: number = 16384;

    // Default data channel options
    static OPTIONS: RTCDataChannelInit = {
        ordered: true,
    }

    private $rootScope: angular.IRootScopeService;
    private $timeout: angular.ITimeoutService;
    private keyStore: KeyStore;
    private peerConnection: PeerConnection;
    private _state: string = null;
    private _heartbeat: string = null;
    private _heartbeatAckTimer: angular.IPromise<void> = null;
    private _options: RTCDataChannelInit;
    private _events: DataChannelEvents = null;
    private _cached: DCMessage[] = [];
    private dc: RTCDataChannel = null;

    constructor($rootScope: angular.IRootScopeService,
                $timeout: angular.ITimeoutService,
                keyStore: KeyStore,
                peerConnection: PeerConnection) {
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.keyStore = keyStore;
        this.peerConnection = peerConnection;
        this.reset(true);
    }

    get state() {
        return this._state;
    }

    set state(newState) {
        this._setState(newState);
    }

    private _setState(state): void {
        // Ignore repeated state changes
        if (state == this._state) {
            console.debug('Ignoring repeated data channel state:', state);
            return;
        }

        // Update state and broadcast
        this._state = state;
        this.$rootScope.$broadcast('dc:state', state);

        // Open?
        if (state == 'open') {
            // Send heartbeat after 100ms
            this.$timeout(() => this._sendHeartbeat(), 100);
        }
    }

    reset(hard = false): void {
        this.state = 'unknown';

        // Close and reset event instance
        if (this._events !== null) {
            this._events.stop();
        }
        this._events = new DataChannelEvents(this, this.$rootScope);

        // Cancel and reset heartbeat ack timer
        this._cancelHeartbeatAckTimer();

        // Reset heartbeat content
        this._heartbeat = null;

        // Close data channel instance
        if (this.dc !== null) {
            console.debug('Closing data channel');
            this.dc.close();
            this.dc = null;
        }

        // Hard reset?
        if (hard === false) {
            return;
        }

        // Clear cached messages
        this.clear();

        // Reset options
        this._options = null;
    }

    /**
     * Clear cached messages.
     */
    clear(): void {
        this._cached = [];
    }

    create(options = {}) {
        this.reset();

        // Override defaults
        this._options = angular.extend(DataChannel.OPTIONS, options);

        // Create peer connection
        this.state = 'init';
        this.dc = this.peerConnection.pc.createDataChannel(DataChannel.LABEL, this._options);
        console.debug('Data Channel created');

        // Underlying data transport has been established or re-established
        this.dc.onopen = this._events.onOpen;
        // An error occurred
        this.dc.onerror = this._events.onError;
        // Underlying data transport has been closed
        this.dc.onclose = this._events.onClose;
        // A message has been received
        // Note: Data description missing, not properly documented in WebRTC working draft
        this.dc.onmessage = this._events.onMessage;
    }

    close(): boolean {
        if (this.dc !== null) {
            this.dc.close();
            return true;
        } else {
            return false;
        }
    }

    private _startHeartbeatAckTimer(delay: number = DataChannel.HEARTBEAT_ACK_TIMEOUT): void {
        this._heartbeatAckTimer = this.$timeout(() => {
            console.error('Data Channel heartbeat ack timeout');
            this.$rootScope.$broadcast('dc:error', 'timeout', 'Heartbeat ack timeout');
            this.dc.close();
        }, delay);
    }

    private _cancelHeartbeatAckTimer(): void {
        if (this._heartbeatAckTimer !== null) {
            this.$timeout.cancel(this._heartbeatAckTimer);
            this._heartbeatAckTimer = null;
        }
    }

    sendMessage(inner: string | Object): void {
        this._send({
            type: "message",
            data: inner,
        })
    }

    receiveMessage(inner): void {
        console.debug('Broadcasting data channel message');
        this.$rootScope.$broadcast('dc:message', inner);
    }

    public _sendCached(): void {  // TODO: Can this be private? If not, remove underscore
        console.debug('Sending ', this._cached.length, ' delayed data channel messages');
        for (var message of this._cached) {
            this._send(message);
        }
        this._cached = [];
    }

    // Warning: Do not call this function manually as it will interfere with the
    //          running timers and create timing issues!
    private _sendHeartbeat(content: string = randomString()): void {
        console.debug('Sending data channel heartbeat');

        // Store heartbeat
        this._heartbeat = content;

        // Start timer and send
        this._startHeartbeatAckTimer();
        this._send({
            type: 'heartbeat',
            data: content,
        })
    }

    _receiveHeartbeatAck(content: string): void {
        // Validate heartbeat ack
        if (this._heartbeat === null) {
            console.warn('Ignored data channel heartbeat-ack that has not been sent');
            return;
        }
        if (content !== this._heartbeat) {
            console.error('Data channel heartbeat-ack content does not match, expected:',
                this._heartbeat, 'received:', content);
            this.$rootScope.$broadcast('dc:error', 'heartbeat', 'heartbeat-ack content did not match');
        } else {
            console.debug('Received data channel heartbeat-ack');
            this._heartbeat = null;
            // Cancel heartbeat ack timer
            this._cancelHeartbeatAckTimer();
        }
    }

    _receiveHeartbeat(content: string): void {
        console.debug('Received data channel heartbeat');
        this._sendHeartbeatAck(content);
    }

    _sendHeartbeatAck(content): void {
        console.debug('Sending heartbeat ack');
        this._send({
            type: 'heartbeat-ack',
            data: content,
        })
    }

    _send(message: DCMessage): void {
        // Delay sending until connected
        if (this.state == 'open') {
            // Encrypt data
            let box: Box;
            try {
                box = this.keyStore.encrypt(JSON.stringify(message));
            } catch (error) {
                this.$rootScope.$broadcast('dc:error', 'crypto', error);
                return;
            }

            // Send chunks
            let sizeKb = (box.length / 1024).toFixed(2);
            console.debug('Sending data channel message (size:', sizeKb, 'KB):', message);
            let chunkifier = new Chunkifier(box.toArray(), DataChannel.MTU);
            for (var chunk of chunkifier.chunks) {
                // Send chunk content
                this.dc.send(chunk);
            }
        } else {
            console.debug('Delaying data channel message until channel is open');
            this._cached.push(message);
        }
    }

    _receive(array: Uint8Array) {
        // Note: Already an Uint8Array
        let box: Box = this.keyStore.boxFromArray(array);
        let sizeKb = (box.length / 1024).toFixed(2);

        // Decrypt data
        let data: string;
        try {
            data = this.keyStore.decrypt(box);
        } catch (error) {
            this.$rootScope.$broadcast('dc:error', 'crypto', error);
            return;
        }

        // Decode data
        let message = JSON.parse(data);
        let typeInfo = message.data.type + '/' + message.data.subType;
        console.debug('Received data channel message of type ', typeInfo, ' (size:', sizeKb, 'KB):', message);

        // Dispatch message
        switch (message.type) {
            case 'message':
                this.receiveMessage(message.data);
                break;
            case 'heartbeat-ack':
                this._receiveHeartbeatAck(message.data);
                break;
            case 'heartbeat':
                this._receiveHeartbeat(message.data);
                break;
            default:
                console.warn('Ignored data channel message:', message);
        }
    }
}
