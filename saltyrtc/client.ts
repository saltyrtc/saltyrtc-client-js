/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path="types/angular.d.ts" />

import { KeyStore, Box } from "./keystore";
import { PeerConnection } from "./peerconnection";
import { DataChannel } from "./datachannel";
import { Session } from "./session";
import { Signaling } from "./signaling";
import { u8aToHex, hexToU8a } from "./utils";

interface ClientHandler {
    signaling: Object,
    dc: Object,
}

interface State {
    type: 'success' | 'warning' | 'danger',
    value: string,
}

export class SaltyRTC {
    static CONNECT_TIMEOUT: number = 85000;
    static DISCONNECT_TIMEOUT: number = 35000;

    // State type rules
    static STATE_RULES = {
        signaling: {
            danger: ['unknown', 'init', 'failed'],
            warning: ['connecting', 'closing', 'closed'],
            success: ['open'],
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

    private $rootScope: angular.IRootScopeService;
    private keyStore: KeyStore;
    private session: Session;
    private signaling: Signaling;
    private dataChannel: DataChannel;

    private _started: boolean = false;

    // Timers
    private _connectTimer: number = null;

    // States
    public states = {};
    public state: State = null;
    private _stateHandler: ClientHandler;
    private _errorHandler: ClientHandler;

    constructor($rootScope: angular.IRootScopeService,
                keyStore: KeyStore,
                session: Session,
                dataChannel: DataChannel) {
        this.$rootScope = $rootScope;
        this.keyStore = keyStore;
        this.session = session;
        this.dataChannel = dataChannel;

        // Initialize signaling class
        this.signaling = new Signaling(this, $rootScope, keyStore, session);

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
        for (var name of ['signaling', 'dc']) {
            this.states[name] = {
                type: 'danger',
                value: 'unknown',
            };
        }
    }

    start(): void {
        if (this._started) {
            console.warn('Restarting client');
            this._reconnect(true, true);
        } else {
            console.info('Starting client');
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
            console.debug('Signaling state changed to:', state);
            this._updateState('signaling', state);
        });
        this.$rootScope.$on('dc:state', (_, state) => {
            console.debug('Data Channel state changed to:', state);
            this._updateState('dc', state);
        });

        // Listen for error states
        this.$rootScope.$on('signaling:error', (_, state, error) => {
            console.error('Signaling error state:', state, ', Message:', error);
            this._handleError('signaling', state, error);
        });
        this.$rootScope.$on('dc:error', (_, state, error) => {
            console.error('Data Channel error state:', state, ', Message:', error);
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
                console.error('Public key already received, ignoring message');
            } else {
                console.debug('Received public key:', key);
                this.keyStore.otherKey = binKey;
            }

            // Send offer
            /*this.peerConnection.createOffer().then(
                (offer) => {
                    this.peerConnection.setLocalDescription(offer); // TODO: Should we handle errors?
                    this._startConnectTimer();
                    this.signaling.sendOffer(offer);
                },
                (error) => console.error('PeerConnection error:', error)
            );*/
        });
    }

    /**
     * Send an ICE candidate through the signalling channel.
     *
     * TODO: Make sure candidates are buffered for 10ms, according to the
     * SaltyRTC spec.
     */
    public sendCandidate(candidate: RTCIceCandidate) {
        this.signaling.sendCandidate(candidate);
    }

    /**
     * Send an offer through the signalling channel.
     */
    public sendOffer(offerSdp: RTCSessionDescription) {
        this.signaling.sendOffer(offerSdp);
    }

    /**
     * Receive an answer through the signalling channel.
     */
    public onReceiveAnswer(answerSdp: RTCSessionDescription) {
        console.debug('SaltyRTC: Received answer');
    }

    private _reset(dataChannel: boolean, signaling: boolean): void {
        // Force signaling reset if required
        if (signaling) {
            console.info('Signaling reset');
            this.signaling.reset(true);
        } else {
            this.signaling.clear();
        }

        // Force data channel reset if required
        if (dataChannel) {
            console.info('Data Channel reset');
            this.dataChannel.reset(true);
            // Notify that we have done a data channel reset
            this._updateClientState({type: 'danger', value: 'reset'});
        }
    }

    private _connect(): void {
        // Create peer connection and connect to signaling server
        this.session.new();
        console.info('Connecting');
        //this.peerConnection.reset();
        //this.peerConnection.create();
        this.dataChannel.create();
        this.signaling.connect(u8aToHex(this.keyStore.keyPair.publicKey));
    }

    private _reconnect(dataChannel: boolean, signaling: boolean, silent: boolean = false): void {
        // Reset instances
        this._reset(dataChannel, signaling);

        // Create a new session
        this.session.new();

        // Connect again
        // Note: No reconnect timer needed as the signaling service has such a timer
        //       and the signaling service is a requirement for the other services.
        console.info('Reconnecting');
        if (dataChannel) {
            this.dataChannel.create();
        }
        if (signaling) {
            this.signaling.connect(u8aToHex(this.keyStore.keyPair.publicKey));
        }

        // Reset requested?
        if (!silent) {
            this.signaling.sendReset();
        }
    }

    private _updateClientState(state): void {
        this.state = state;

        // Broadcast
        this.$rootScope.$broadcast('webclient:state', this.state);
    }

    private _updateState(name, value): void {
        // Update state type and value
        this.states[name].type = this._getStateType(name, value);
        this.states[name].value = value;

        // Calculate client state type and value
        let weight = 0;
        for (let key in this.states) {
            let state = this.states[key];
            weight += SaltyRTC.STATE_WEIGHT[state.type];
        }

        // Data channel open and PC at most unstable: Force warning if danger
        if (weight >= SaltyRTC.STATE_WEIGHT.danger
            && this.states['dc'].type == 'success'
            && this.states['pc'].type != 'danger') {
            weight = SaltyRTC.STATE_WEIGHT.warning;
        }

        // Calculate state type
        let state;
        if (weight < SaltyRTC.STATE_WEIGHT.warning) {
            state = {type: 'success', value: 'connected'};
        } else if (weight < SaltyRTC.STATE_WEIGHT.danger) {
            state = {type: 'warning', value: 'unstable'};
        } else {
            state = {type: 'danger', value: 'disconnected'};
        }

        // Call internal state event handler
        if (this._stateHandler[name][value]) {
            console.debug('Calling handler for state', value, ' of', name);
            this._stateHandler[name][value]();
        }

        // Broadcast
        this._updateClientState(state);
    }

    private _handleError(name, value, error) {
        // Call state event handler
        if (typeof this._errorHandler[name] !== undefined) {
            if (typeof this._errorHandler[name][value] !== undefined) {
                console.debug('Calling error state handler for state', value, ' of', name);
                this._errorHandler[name][value]();
            }
        }
    }

    private _getStateType(name: string, value: string): string {
        let rules = SaltyRTC.STATE_RULES[name];
        // Check if the value is in one of the keys
        for (let key in rules) {
            let states = rules[key];
            if (states.indexOf(value) !== -1) {
                return key;
            }
        }
        return 'unknown';
    }

    private _startConnectTimer(): void {
        this._connectTimer = setTimeout(() => {
            // Notify that connecting timed out
            console.warn('Data Channel connect timeout');
            this._updateClientState({type: 'danger', value: 'timeout'});
            this._reconnect(true, false);
        }, SaltyRTC.CONNECT_TIMEOUT);
    }

    private _cancelConnectTimer(): void {
        if (this._connectTimer !== null) {
            clearTimeout(this._connectTimer);
            this._connectTimer = null;
        }
    }

}
