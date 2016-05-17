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

export class SaltyRTC {
    private $rootScope: angular.IRootScopeService;
    private keyStore: KeyStore;
    private session: Session;
    private signaling: Signaling;

    private _started: boolean = false;

    constructor($rootScope: angular.IRootScopeService,
                keyStore: KeyStore,
                session: Session) {
        this.$rootScope = $rootScope;
        this.keyStore = keyStore;
        this.session = session;

        // Initialize signaling class
        this.signaling = new Signaling(this, $rootScope, keyStore, session);
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

}
