/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path="types/angular.d.ts" />
/// <reference path="types/websocket.d.ts" />

import { Session } from "./session";
import { KeyStore, Box } from "./keystore";

interface CachedSignalingMessage {
    message: SignalingMessage,
    encrypt: boolean,
}

interface SignalingMessage {
    type: "hello-client" | "reset" | "offer" | "candidate",
    session?: string,
    data?: any; // TODO: type
}

class SignalingEvents {
    private $log: angular.ILogService;
    private $rootScope: angular.IRootScopeService;
    private _stopped: boolean;
    private _signaling: Signaling;

    constructor(signaling: Signaling, $log: angular.ILogService, $rootScope: angular.IRootScopeService) {
        this.$log = $log;
        this.$rootScope = $rootScope;
        this._stopped = false
        this._signaling = signaling
    }

    stop() {
        this._stopped = true;
    }

    onOpen = () => {
        if (this._stopped === false) {
            this.$rootScope.$apply(() => this._signaling.state = 'open');
        }
    };

    onError = (error) => {
        if (this._stopped === false) {
            this.$rootScope.$apply(() => {
                this.$log.error('General Web Socket error', error)
                this.$rootScope.$broadcast('signaling:error', 'general', error)
            })
        }
    };

    onClose = () => {
        if (this._stopped === false) {
            this.$rootScope.$apply(() => this._signaling.state = 'closed')
        }
    };

    onMessage = (event) => {
        if (this._stopped === false) {
            let data = event.data;
            this.$rootScope.$apply(() => {
                // Dispatch according to type
                // Note: For some reason literals are not a String instance
                if (typeof data == 'string') {
                    this._signaling._receiveText(data);
                } else if (data instanceof ArrayBuffer) {
                    this._signaling._receiveBinary(data);
                } else {
                    this.$log.warn('Received signaling message with unknown type')
                }
            })
        }
    };
}


export class Signaling {
    static DEFAULT_URL: string = 'ws://example.com:8765/';
    static CONNECT_MAX_RETRIES: number = 10;
    static CONNECT_RETRY_INTERVAL: number = 10000;

    private $log: angular.ILogService;
    private $rootScope: angular.IRootScopeService;
    private $timeout: angular.ITimeoutService;
    private keyStore: KeyStore;
    private session: Session;
    private _state: string = null;
    private path: string = null;
    private url: string = null;
    private _connectTries: number;
    private cached: CachedSignalingMessage[];
    private _connectTimer: angular.IPromise<void> = null;
    private _events: SignalingEvents = null;
    private ws: WebSocket;

    constructor($log: angular.ILogService,
                $rootScope: angular.IRootScopeService,
                $timeout: angular.ITimeoutService,
                keyStore: KeyStore,
                session: Session) {
        this.$log = $log;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.keyStore = keyStore;
        this.session = session;
        this.reset(true)
    }

    set state(newState: string) {
        this._setState(newState);
    }

    _setState(state: string): void {
        // Ignore repeated state changes
        if (state === this._state) {
            this.$log.debug('Ignoring repeated signaling state:', state);
            return;
        }

        // Update state and broadcast
        this._state = state;
        this.$rootScope.$broadcast('signaling:state', state)

        // Open?
        // TODO: Use enums for states
        if (state == 'open') {
            // Cancel connect timer and reset counter
            this._cancelConnectTimer();
            this._connectTries = 0;
        }
    }

    reset(hard: boolean = false): void {
        let state = this._state;
        this.state = 'unknown';

        // Close and reset event instance
        if (this._events !== null) {
            this._events.stop();
        }
        this._events = new SignalingEvents(this, this.$log, this.$rootScope);

        // Close web socket instance
        if (this.ws && state === 'open') {
            this.$log.debug('Disconnecting Web Socket');
            this.ws.close();
        }
        this.ws = null;

        // Hard reset?
        if (hard === false) {
            return
        }

        // Cancel connect timer and reset counter
        this._cancelConnectTimer();
        this._connectTries = 0;

        // Clear cached messages
        this.clear();
    }

    /**
     * Clear cached messages
     */
    clear(): void {
        this.cached = [];
    }

    connect(path, url = Signaling.DEFAULT_URL): void { // TODO: Use WSS
        // Store path and URL
        this.path = path;
        this.url = url;

        // Give up?
        if (this._connectTries == Signaling.CONNECT_MAX_RETRIES) {
            this._connectTries = 0;
            this.$log.error('Connecting signaling channel failed');
            this.state = 'failed';
            return;
        }

        // Reset and create web socket connection
        this.reset();
        this.ws = new WebSocket(url + path);
        this.ws.binaryType = 'arraybuffer';
        this.$log.debug('Created signaling channel, connecting to path:', path);
        this.state = 'connecting';

        // Start connect timer
        this._startConnectTimer();

        // Web socket connection is ready for sending and receiving
        this.ws.onopen = this._events.onOpen;
        // An error occurred
        this.ws.onerror = this._events.onError;
        // Web socket connection has been closed
        this.ws.onclose = this._events.onClose;
        // A message has been received
        // [String|Blob|ArrayBuffer] event.data
        this.ws.onmessage = this._events.onMessage;
    }

    reconnect(delay: number = Signaling.CONNECT_RETRY_INTERVAL): void {
        this._restartConnectTimer(delay);
    }

    sendHello(): void {
        this.$log.debug('Sending hello');
        this._send({type: 'hello-client'}, false);
    }

    sendReset(): void {
        this.$log.debug('Sending reset');
        this._send({type: 'reset'}, false);
    }

    receiveReset(): void {
        this.$log.debug('Broadcasting reset');
        this.$rootScope.$broadcast('signaling:reset');
    }

    receiveSendError(): void {
        this.$log.debug('Broadcasting send error');
        this.$rootScope.$broadcast('signaling:sendError');
    }

    receiveKey(key): void {
        this.$log.debug('Broadcasting key');
        this.$rootScope.$broadcast('signaling:key', key);
    }

    sendOffer(offer): void { // TODO: type
        this.$log.debug('Sending offer');
        this._send({
            type: 'offer',
            session: this.session.id,
            data: offer,
        });
    }

    receiveAnswer(answer): void {
        this.$log.debug('Broadcasting answer');
        this.$rootScope.$broadcast('signaling:answer', answer);
    }

    sendCandidate(candidate): void {
        this.$log.debug('Sending candidate');
        this._send({
            type: 'candidate',
            session: this.session.id,
            data: candidate,
        });
    }

    receiveCandidate(candidate): void {
        this.$log.debug('Broadcasting candidate');
        this.$rootScope.$broadcast('signaling:candidate', candidate);
    }

    _startConnectTimer(delay = Signaling.CONNECT_RETRY_INTERVAL): void {
        this._connectTimer = this.$timeout(() => {
            this._connectTries += 1;
            this.$log.debug('Signaling connect timeout, retry ' + this._connectTries+ '/' + Signaling.CONNECT_MAX_RETRIES);
            this.connect(this.path, this.url);
        }, delay);
    }

    _restartConnectTimer(delay): void {
        this._cancelConnectTimer();
        this._startConnectTimer(delay);
    }

    _cancelConnectTimer(): void {
        if (this._connectTimer !== null) {
            this.$timeout.cancel(this._connectTimer);
            this._connectTimer = null;
        }
    }

    _sendCached(): void {
        this.$log.debug('Sending ' + this.cached.length + ' delayed signaling messages');
        this.cached.forEach((item) => this._send(item.message, item.encrypt));
        this.cached = [];
    }

    _send(message: SignalingMessage, encrypt = true): void {
        // Delay sending until connected
        // 0: connecting, 1: open, 2: closing, 3: closed
        if (this.ws.readyState == 1) {
            this.$log.debug('Sending signaling message (encrypted: ' + encrypt + '):', message);
            if (encrypt === true) {
                let box: Box;
                try {
                    box = this.keyStore.encrypt(JSON.stringify(message));
                } catch (error) {
                    this.$rootScope.$broadcast('signaling:error', 'crypto', error);
                    return;
                }
                this.ws.send(box.toArray());
            } else {
                this.ws.send(JSON.stringify(message));
            }
        } else {
            this.$log.debug('Delaying signaling message until WebSocket is open');
            this.cached.push({
                message: message,
                encrypt: encrypt,
            })
        }
    }

    _receiveText(data): void {
        let message = JSON.parse(data);
        this.$log.debug('Received text signaling message:', message);

        // Dispatch message
        switch (message.type) {
            case 'reset':
                this.receiveReset();
                break;
            case 'send-error':
                this.receiveSendError();
                break;
            case 'key':
                this.receiveKey(message.data);
                break;
            default:
                this.$log.warn('Ignored signaling message:', message);
        }
    }

    _receiveBinary(data): void {
        // Convert to Uint8Array
        let box: Box = this.keyStore.boxFromArray(new Uint8Array(data));

        // Decrypt data
        let decryptedData: string;
        try {
            decryptedData = this.keyStore.decrypt(box);
        } catch (error) {
            this.$rootScope.$broadcast('signaling:error', 'crypto', error);
            return
        }

        // Decode data
        let message = JSON.parse(decryptedData);
        this.$log.debug('Received encrypted signaling message:', message);

        // Check session
        if (message.session != this.session.id) {
            this.$log.warn('Ignored message from another session:', message.session);
            return;
        }

        // Dispatch message
        switch (message.type) {
            case 'answer':
                this.receiveAnswer(message.data);
                break;
            case 'candidate':
                this.receiveCandidate(message.data);
                break;
            default:
                this.$log.warn('Ignored encrypted signaling message:', message);
        }
    }
}
