/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path="types/angular.d.ts" />
/// <reference path="keystore.ts" />
/// <reference path="session.ts" />
/// <reference path="signaling.ts" />
/// <reference path="peerconnection.ts" />
/// <reference path="datachannel.ts" />


interface ClientHandler {
    signaling: Object,
    pc: Object,
    dc: Object,
}

interface State {
    type: 'success' | 'warning' | 'danger',
    value: string,
}

class Client {
    static CONNECT_TIMEOUT: number = 85000;
    static DISCONNECT_TIMEOUT: number = 35000;

    // State type rules
    static STATE_RULES = {
        signaling: {
            danger: ['unknown', 'init', 'failed'],
            warning: ['connecting', 'closing', 'closed'],
            success: ['open'],
        },
        pc: {
            danger: ['unknown', 'init', 'new', 'failed', 'closed'],
            warning: ['checking', 'disconnected'],
            success: ['connected', 'completed'],
        },
        dc: {
            danger: ['unknown', 'init', 'closed'],
            warning: ['connecting', 'closing'],
            success: ['open'],
        },
    };

    // State type weight
    static STATE_WEIGHT = {
        danger: 100,
        warning: 10,
        success: 1,
    };

    private $log: angular.ILogService;
    private $rootScope: angular.IRootScopeService;
    private $timeout: angular.ITimeoutService;
    private keyStore: KeyStore;
    private session: Session;
    private signaling: Signaling;
    private peerConnection: PeerConnection;
    private dataChannel: DataChannel;

    private _started: boolean = false;

    // Timers
    private _connectTimer: angular.IPromise<void> = null;
    private _disconnectTimer: angular.IPromise<void> = null;

    // States
    public states = {};
    public state: State = null;
    private _stateHandler: ClientHandler;
    private _errorHandler: ClientHandler;

    constructor($log: angular.ILogService,
                $rootScope: angular.IRootScopeService,
                $timeout: angular.ITimeoutService,
                keyStore: KeyStore,
                session: Session,
                signaling: Signaling,
                peerConnection: PeerConnection,
                dataChannel: DataChannel) {
        this.$log = $log;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.keyStore = keyStore;
        this.session = session;
        this.signaling = signaling;
        this.peerConnection = peerConnection;
        this.dataChannel = dataChannel;

        // Setup state event handler
        // Note: This handler should only handle states that can't be handled by the
        //       services themselves.
        this._stateHandler = {
            signaling: {
                // Closed is a reliable state when the connection failed, regardless on
                // whether there was a connection beforehand or not
                closed: () => this.signaling.reconnect(),
                // Failed could be handled by the user but we chose to just reconnect
                failed: () => this.signaling.reconnect(),
                // When opened, register on the signaling server with a hello and send
                // already cached messages afterwards.
                open: () => {
                    this.signaling.sendHello();
                    this.signaling._sendCached();
                }
            },
            pc: {
                // Connecting to peer failed
                failed: () => this._reconnect(true, false),
                // Connection to peer closed
                closed: () => this._reconnect(true, false),
                // Connection to peer lost
                disconnected: () => this._startDisconnectTimer(),
                // Connection to peer established
                connected: () => this._cancelDisconnectTimer(),
            },
            dc: {
                // Channel closed
                closed: () => this._reconnect(true, false),
                // When opened, stop the connect timer and send already cached messages.
                open: () => {
                    this._cancelConnectTimer();
                    this.dataChannel._sendCached();
                },
            },
        };

        // Setup error event handler
        // For Peer Connection and Data Channel, there are no specific errors that aren't
        // indirectly handled by the timers.
        this._errorHandler = {
            signaling: null,
            pc: null,
            dc: {
                // Message ack timeout
                timeout: () => this.dataChannel.close(),
                // Content of repeated heartbeat ack did not match
                heartbeat: () => this.dataChannel.close(),
                // Cannot encrypt/decrypt, data or key pair invalid
                crypto: () => this.dataChannel.close(),
            },
        };

        // Register root scope events
        this._registerEvents();

        // Initialise state objects
        this.state = {
            type: 'danger',
            value: 'disconnected',
        };
        for (var name of ['signaling', 'pc', 'dc']) {
            this.states[name] = {
                type: 'danger',
                value: 'unknown',
            };
        }
    }

    start(): void {
        if (this._started) {
            this.$log.warn('Restarting client');
            this._reconnect(true, true);
        } else {
            this.$log.info('Starting client');
            this._started = true;
            this._connect();
        }
    }

    stop(): void {
        this._reset(true, true);
    }

    send(message: string | Object): void {
        this.dataChannel.sendMessage(message);
    }

    private _registerEvents(): void {
        // Listen for state changes
        this.$rootScope.$on('signaling:state', (_, state) => {
            this.$log.debug('Signaling state changed to:', state);
            this._updateState('signaling', state);
        });
        this.$rootScope.$on('pc:state', (_, state) => {
            this.$log.debug('Peer Connection state changed to:', state);
            this._updateState('pc', state);
        });
        this.$rootScope.$on('dc:state', (_, state) => {
            this.$log.debug('Data Channel state changed to:', state);
            this._updateState('dc', state);
        });

        // Listen for error states
        this.$rootScope.$on('signaling:error', (_, state, error) => {
            this.$log.error('Signaling error state:', state, ', Message:', error);
            this._handleError('signaling', state, error);
        });
        this.$rootScope.$on('pc:error', (_, state, error) => {
            this.$log.error('Peer Connection error state:', state, ', Message:', error);
            this._handleError('pc', state, error);
        });
        this.$rootScope.$on('dc:error', (_, state, error) => {
            this.$log.error('Data Channel error state:', state, ', Message:', error);
            this._handleError('dc', state, error);
        });

        // Listen for signaling server events and delegate them
        this.$rootScope.$on('signaling:reset', () => {
            this._reconnect(true, false, true);
        });
        this.$rootScope.$on('signaling:sendError', () => {
            this._reconnect(true, false);
        });
        this.$rootScope.$on('signaling:key', (_, key) => {
            // Convert key to binary
            let binKey: Uint8Array = hexToU8a(key);

            // Check if key is different
            if (this.keyStore.otherKey !== null && this.keyStore.otherKey !== binKey) {
                this.$log.error('Public key already received, ignoring message');
            } else {
                this.$log.debug('Received public key:', key);
                this.keyStore.otherKey = binKey;
            }

            // Send offer
            this.peerConnection.sendOffer();
        });
        this.$rootScope.$on('signaling:answer', (_, answer) => {
            this.peerConnection.receiveAnswer(answer);
        });
        this.$rootScope.$on('signaling:candidate', (_, candidate) => {
            this.peerConnection.receiveCandidate(candidate);
        });

        // Listen for peer connection events and delegate them
        this.$rootScope.$on('pc:offer', (_, offer) => {
            this._startConnectTimer();
            this.signaling.sendOffer(offer);
        });
        this.$rootScope.$on('pc:candidate', (_, candidate) => {
            this.signaling.sendCandidate(candidate);
        });
    }

    private _reset(peerConnection: boolean, signaling: boolean): void {
        // Cancel timers
        this._cancelConnectTimer();
        this._cancelDisconnectTimer();

        // Force signaling reset if required
        if (signaling) {
            this.$log.info('Signaling reset');
            this.signaling.reset(true);
        } else {
            this.signaling.clear();
        }

        // Force peer connection and data channel reset if required
        if (peerConnection) {
            this.$log.info('Data Channel reset');
            this.dataChannel.reset(true);
            this.$log.info('Peer Connection reset');
            this.peerConnection.reset();
            // Notify that we have done a data channel reset
            this._updateClientState({type: 'danger', value: 'reset'});
        }
    }

    _connect(): void {
        // Create peer connection and connect to signaling server
        this.session.new();
        this.$log.info('Connecting');
        this.peerConnection.reset();
        this.peerConnection.create();
        this.dataChannel.create();
        this.signaling.connect(u8aToHex(this.keyStore.keyPair.publicKey));
    }

    _reconnect(peerConnection: boolean, signaling: boolean, silent: boolean = false): void {
        // Reset instances
        this._reset(peerConnection, signaling);

        // Create a new session
        this.session.new();

        // Connect again
        // Note: No reconnect timer needed as the signaling service has such a timer
        //       and the signaling service is a requirement for the other services.
        this.$log.info('Reconnecting');
        if (peerConnection) {
            this.peerConnection.create();
            this.dataChannel.create();
        }
        if (signaling) {
            this.signaling.connect(u8aToHex(this.keyStore.keyPair.publicKey));
        }

        // Reset requested?
        if (!silent) {
            this.signaling.sendReset();
        }

        // Resend offer if signaling channel stays open and peer connection was reset
        if (peerConnection && !signaling && !this.keyStore.hasOtherKey()) {
            this.peerConnection.sendOffer();
        }
    }

    _updateClientState(state): void {
        this.state = state;

        // Broadcast
        this.$rootScope.$broadcast('webclient:state', this.state);
    }

    _updateState(name, value): void {
        // Update state type and value
        this.states[name].type = this._getStateType(name, value);
        this.states[name].value = value;

        // Calculate client state type and value
        let weight = 0;
        for (let key in this.states) {
            let state = this.states[key];
            weight += Client.STATE_WEIGHT[state.type];
        }

        // Data channel open and PC at most unstable: Force warning if danger
        if (weight >= Client.STATE_WEIGHT.danger
            && this.states['dc'].type == 'success'
            && this.states['pc'].type != 'danger') {
            weight = Client.STATE_WEIGHT.warning;
        }

        // Calculate state type
        let state;
        if (weight < Client.STATE_WEIGHT.warning) {
            state = {type: 'success', value: 'connected'};
        } else if (weight < Client.STATE_WEIGHT.danger) {
            state = {type: 'warning', value: 'unstable'};
        } else {
            state = {type: 'danger', value: 'disconnected'};
        }

        // Call internal state event handler
        if (this._stateHandler[name][value]) {
            this.$log.debug('Calling handler for state', value, ' of', name);
            this._stateHandler[name][value]();
        }

        // Broadcast
        this._updateClientState(state);
    }

    private _handleError(name, value, error) {
        // Call state event handler
        if (typeof this._errorHandler[name] !== undefined) {
            if (typeof this._errorHandler[name][value] !== undefined) {
                this.$log.debug('Calling error state handler for state', value, ' of', name);
                this._errorHandler[name][value]();
            }
        }
    }

    private _getStateType(name: string, value: string): string {
        let rules = Client.STATE_RULES[name];
        // Check if the value is in one of the keys
        for (let key in rules) {
            let states = rules[key];
            if (states.indexOf(value) !== -1) {
                return key;
            }
        }
        return 'unknown';
    }

    _startConnectTimer(): void {
        this._connectTimer = this.$timeout(() => {
            // Notify that connecting timed out
            this.$log.warn('Data Channel connect timeout');
            this._updateClientState({type: 'danger', value: 'timeout'});
            this._reconnect(true, false);
        }, Client.CONNECT_TIMEOUT);
    }

    _cancelConnectTimer(): void {
        if (this._connectTimer !== null) {
            this.$timeout.cancel(this._connectTimer);
            this._connectTimer = null;
        }
    }

    _startDisconnectTimer(): void {
        this._disconnectTimer = this.$timeout(() => {
            // Notify that the connection has been lost
            this.$log.warn('Peer Connection lost');
            this._updateClientState({type: 'danger', value: 'lost'});
            this._reconnect(true, false);
        }, Client.DISCONNECT_TIMEOUT);
    }

    _cancelDisconnectTimer(): void {
        if (this._disconnectTimer !== null) {
            this.$timeout.cancel(this._disconnectTimer);
            this._disconnectTimer = null;
        }
    }
}
