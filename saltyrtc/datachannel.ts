/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path="types/angular.d.ts" />
/// <reference path="types/RTCPeerConnection.d.ts" />

import { KeyStore, Box } from "./keystore";
import { randomString } from "./utils";
import { Chunkifier, Unchunkifier } from "./chunkifier";

/**
 * A message that is sent through the data channel.
 */
interface DCMessage {
    type: "message" | "heartbeat" | "heartbeat-ack",
    data: string | Object,
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
    private keyStore: KeyStore;
    private peerConnection: PeerConnection;
    private _state: string = null;
    private _heartbeat: string = null;
    private _heartbeatAckTimer: number = null;
    private _options: RTCDataChannelInit;
    private _events: DataChannelEvents = null;
    private _cached: DCMessage[] = [];
    private dc: RTCDataChannel = null;

    constructor($rootScope: angular.IRootScopeService,
                keyStore: KeyStore,
                peerConnection: PeerConnection) {
        this.$rootScope = $rootScope;
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
            setTimeout(() => this._sendHeartbeat(), 100);
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
        this._heartbeatAckTimer = setTimeout(() => {
            console.error('Data Channel heartbeat ack timeout');
            this.$rootScope.$broadcast('dc:error', 'timeout', 'Heartbeat ack timeout');
            this.dc.close();
        }, delay);
    }

    private _cancelHeartbeatAckTimer(): void {
        if (this._heartbeatAckTimer !== null) {
            clearTimeout(this._heartbeatAckTimer);
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
