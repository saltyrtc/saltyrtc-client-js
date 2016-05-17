/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path="types/angular.d.ts" />

import { KeyStore, Box } from "./keystore";
import { DataChannel } from "./datachannel";
import { Session } from "./session";
import { Signaling } from "./signaling";
import { u8aToHex, hexToU8a } from "./utils";

interface ClientHandler {
    signaling: Object,
    dc: Object,
}

export class SaltyRTC {
    static CONNECT_TIMEOUT: number = 85000;
    static DISCONNECT_TIMEOUT: number = 35000;

    private $rootScope: angular.IRootScopeService;
    private keyStore: KeyStore;
    private session: Session;
    private signaling: Signaling;
    private dataChannel: DataChannel;

    private _started: boolean = false;

    // Timers
    private _connectTimer: number = null;

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

}
