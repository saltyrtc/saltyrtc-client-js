/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import { KeyStore, AuthToken, Box } from "./keystore";
import { Signaling, State } from "./signaling";
import { u8aToHex, hexToU8a } from "./utils";

interface ClientHandler {
    signaling: Object,
    dc: Object,
}

export class SaltyRTC {
    private host: string;
    private port: number;
    private permanentKey: KeyStore;
    private _signaling: Signaling = null;
    private ws: WebSocket = null;

    /**
     * Create a new SaltyRTC instance.
     */
    constructor(permanentKey: KeyStore, host: string, port: number = 8765) {
        // Validate data
        if (host.endsWith('/')) {
            throw new Error('SaltyRTC host may not end with a slash');
        }
        if (host.indexOf('//') !== -1) {
            throw new Error('SaltyRTC host should not contain protocol');
        }

        // Store properties
        this.host = host;
        this.port = port;
        this.permanentKey = permanentKey;
    }

    /**
     * Initialize SaltyRTC instance as initiator.
     */
    public asInitiator(): SaltyRTC {
        // Initialize signaling class
        this._signaling = new Signaling(this, this.host, this.port, this.permanentKey);

        // Return self
        return this;
    }

    /**
     * Initialize SaltyRTC instance as responder.
     */
    public asResponder(path: string, authToken: Uint8Array): SaltyRTC {
        // Create AuthToken instance
        let token = new AuthToken(authToken);

        // Initialize signaling class
        this._signaling = new Signaling(this, this.host, this.port, this.permanentKey, path, token);

        // Return self
        return this;
    }

    private get signaling(): Signaling {
        if (this._signaling === null) {
            throw Error('SaltyRTC instance not initialized. Use .asInitiator() or .asResponder().');
        }
        return this._signaling;
    }

    /**
     * Return the signaling state.
     */
    public get state(): State {
        return this.signaling.state;
    }

    /**
     * Return the public permanent key as hex string.
     */
    public get publicKeyHex(): string {
        return this.signaling.publicKeyHex;
    }

    /**
     * Return the auth token as Uint8Array.
     */
    public get authTokenBytes(): Uint8Array {
        return this.signaling.authTokenBytes;
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
