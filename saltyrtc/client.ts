/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import { KeyStore, Box } from "./keystore";
import { Session } from "./session";
import { Signaling } from "./signaling";
import { u8aToHex, hexToU8a } from "./utils";

interface ClientHandler {
    signaling: Object,
    dc: Object,
}

export class SaltyRTC {
    private host: string;
    private port: number;
    private keyStore: KeyStore;
    private session: Session;
    private signaling: Signaling;
    private ws: WebSocket = null;

    private _started: boolean = false;

    constructor(keyStore: KeyStore,
                session: Session,
                host: string,
                port: number = 8765) {
        this.keyStore = keyStore;
        this.session = session;

        // Initialize signaling class
        this.signaling = new Signaling(this, host, port, keyStore, session);
    }

    /**
     * Connect to the SaltyRTC server.
     */
    public connect(): void {
        this.signaling.connect();
    }

    /**
     * Send an ICE candidate through the signaling channel.
     *
     * TODO: Make sure candidates are buffered for 10ms, according to the
     * SaltyRTC spec.
     */
    public sendCandidate(candidate: RTCIceCandidate) {
        this.signaling.sendCandidate(candidate);
    }

    /**
     * Send an offer through the signaling channel.
     */
    public sendOffer(offerSdp: RTCSessionDescription) {
        this.signaling.sendOffer(offerSdp);
    }

    /**
     * Receive an answer through the signaling channel.
     */
    public onReceiveAnswer(answerSdp: RTCSessionDescription) {
        console.debug('SaltyRTC: Received answer');
    }

    /**
     * Connection is ready for sending and receiving.
     */
    public onConnected(ev: Event): void {
        console.debug('SaltyRTC: Connected to server');
    }

    /**
     * A connection error occured.
     */
    public onConnectionError(ev: ErrorEvent): void {
        console.error('SaltyRTC: Connection error:', ev);
    }

    /**
     * The connection to the server has been closed.
     */
    public onConnectionClosed(ev: CloseEvent): void {
        console.warn('SaltyRTC: Connection closed:', ev);
    }

}
