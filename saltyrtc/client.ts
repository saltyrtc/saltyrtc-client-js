/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path="types/angular.d.ts" />

import { KeyStore, Box } from "./keystore";
import { Session } from "./session";
import { Signaling } from "./signaling";
import { u8aToHex, hexToU8a } from "./utils";

interface ClientHandler {
    signaling: Object,
    dc: Object,
}

/**
 * Possible states for SaltyRTC connection.
 */
export type State = 'connecting' | 'open' | ' closing' | 'closed';

export class SaltyRTC {
    private host: string;
    private port: number;
    private keyStore: KeyStore;
    private session: Session;
    private signaling: Signaling;
    private ws: WebSocket = null;

    private _started: boolean = false;

    constructor($rootScope: angular.IRootScopeService,
                keyStore: KeyStore,
                session: Session,
                host: string,
                port: number = 8765) {
        this.keyStore = keyStore;
        this.session = session;

        // Initialize signaling class
        this.signaling = new Signaling(this, $rootScope, keyStore, session);

        // Initialize websocket connection
        this.initWebsocket("TODO");
    }

    private initWebsocket(path: string): void {
        let ws = new WebSocket('wss://' + this.host + ':' + this.port + '/' + path);

        // Set binary type
        ws.binaryType = 'arraybuffer';

        // Set event handlers
        ws.onopen = this.onConnected;
        ws.onerror = this.onConnectionError;
        ws.onclose = this.onConnectionClosed;

        // Store connection on instance
        console.debug('Created signaling channel, connecting to path:', path);
        this.ws = ws;
    }

    /**
     * Connect to the SaltyRTC server.
     */
    public connect(): void {
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

    /**
     * Connection is ready for sending and receiving.
     */
    public onConnected(event: Event) {
        console.debug('SaltyRTC: Connected to server');
    }

    /**
     * A connection error occured.
     */
    public onConnectionError(event: Event) {
        console.error('SaltyRTC: Connection error:', event);
    }

    /**
     * The connection to the server has been closed.
     */
    public onConnectionClosed(event: Event) {
        console.warn('SaltyRTC: Connection closed:', event);
    }

}
