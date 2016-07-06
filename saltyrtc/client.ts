/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path='saltyrtc.d.ts' />

import { KeyStore, AuthToken, Box } from "./keystore";
import { Signaling, State } from "./signaling";
import { SecureDataChannel } from "./datachannel";
import { SaltyRTCEvent, EventHandler, EventRegistry } from "./eventregistry";
import { u8aToHex, hexToU8a } from "./utils";


/**
 * The main class used to create a P2P connection through a SaltyRTC signaling
 * server.
 *
 * This class can emit the following events:
 *
 * - connected(void): Handshake has been completed, we're connected!
 * - handover(void): The handover to the data channel is done
 * - connection-error(ErrorEvent): A connection error occured
 * - connection-closed(CloseEvent): The connection was closed
 * - data(saltyrtc.Data): A new data message was received
 * - data:<data-type>(saltyrtc.Data): The data event, filtered by data type
 *
 */
export class SaltyRTC {
    private host: string;
    private port: number;
    private permanentKey: KeyStore;
    private _signaling: Signaling = null;
    private eventRegistry: EventRegistry;

    /**
     * Create a new SaltyRTC instance.
     */
    constructor(permanentKey: KeyStore, host: string, port: number = 8765) {
        // Validate arguments
        if (permanentKey === undefined) {
            throw new Error('SaltyRTC must be initialized with a permanent key');
        }
        if (host === undefined) {
            throw new Error('SaltyRTC must be initialized with a target host');
        }

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

        // Create new event registry
        this.eventRegistry = new EventRegistry();
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
    public asResponder(initiatorPubKey: Uint8Array, authToken: Uint8Array): SaltyRTC {
        // Create AuthToken instance
        let token = new AuthToken(authToken);

        // Initialize signaling class
        this._signaling = new Signaling(this, this.host, this.port, this.permanentKey, initiatorPubKey, token);

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
     * Return the public permanent key as Uint8Array.
     */
    public get permanentKeyBytes(): Uint8Array {
        return this.signaling.permanentKeyBytes;
    }

    /**
     * Return the public permanent key as hex string.
     */
    public get permanentKeyHex(): string {
        return u8aToHex(this.signaling.permanentKeyBytes);
    }

    /**
     * Return the auth token as Uint8Array.
     */
    public get authTokenBytes(): Uint8Array {
        return this.signaling.authTokenBytes;
    }

    /**
     * Return the auth token as hex string.
     */
    public get authTokenHex(): string {
        return u8aToHex(this.signaling.authTokenBytes);
    }

    /**
     * Connect to the SaltyRTC server.
     */
    public connect(): void {
        this.signaling.connect();
    }

    /**
     * Send data to the peer.
     *
     * Note that you can only send primitive types or plain dict-like objects.
     * If you want to send custom typed objects, convert them to plain objects.
     *
     * If you want to send data through a specific data channel, pass it in.
     *
     * If you don't want to set a dataType, pass it in as `undefined`.
     */
    public sendData(dataType: string, data: any, dc?: RTCDataChannel) {
        let dataMessage: saltyrtc.messages.Data = {
            type: 'data',
            data: data,
        }
        if (dataType !== undefined) {
            dataMessage.data_type = dataType;
        }
        this.signaling.sendData(dataMessage, dc);
    }

    /**
     * Decrypt data from a peer.
     *
     * If data message has a type other than "data", a 'bad-message-type' error
     * is thrown.
     */
    public decryptData(data: ArrayBuffer): any {
        let message = this.signaling.decryptPeerMessage(data);
        if (message.type !== 'data') {
            console.error('Data messages must have message type set to "data", not "' + message.type + '".');
            throw 'bad-message-type';
        }
        return (message as saltyrtc.messages.Data).data;
    }

    /**
     * Do the handover from WebSocket to WebRTC DataChannel.
     */
    public handover(pc: RTCPeerConnection): Promise<{}> {
        return this.signaling.handover(pc);
    }

    /**
     * Wrap a WebRTC data channel.
     */
    public wrapDataChannel(dc: RTCDataChannel): SecureDataChannel {
        return new SecureDataChannel(dc, this);
    }

    /**
     * Attach an event handler to the specified event(s).
     *
     * Note: The same event handler cannot be registered twice. It will only
     * run once.
     */
    public on(event: string | string[], handler: EventHandler): void {
        this.eventRegistry.register(event, handler);
    }

    /**
     * Attach a one-time event handler to the specified event(s).
     *
     * Note: If the same handler was already registered previously as a regular
     * event handler, it will be completely removed after running once.
     */
    public once(event: string | string[], handler: EventHandler): void {
        let onceHandler: EventHandler = (ev: SaltyRTCEvent) => {
            try {
                handler(ev);
            } catch (e) {
                // Handle exceptions
                this.off(ev.type, onceHandler);
                throw e;
            }
            this.off(ev.type, onceHandler);
        };
        this.eventRegistry.register(event, onceHandler);
    }

    /**
     * Remove an event handler from the specified event(s).
     *
     * If no handler is specified, remove all handlers for the specified
     * event(s).
     */
    public off(event: string | string[], handler?: EventHandler): void {
        this.eventRegistry.unregister(event, handler);
    }

    /**
     * Emit an event.
     */
    public emit(event: SaltyRTCEvent) {
        console.debug('SaltyRTC: New event:', event.type);
        let handlers = this.eventRegistry.get(event.type);
        for (let handler of handlers) {
            try {
                this.callHandler(handler, event);
            } catch (e) {
                console.error('SaltyRTC: Unhandled exception in', event.type, 'handler:', e);
            }
        }
    }

    /**
     * Call a handler with the specified event.
     *
     * If the handler returns `false`, unregister it.
     */
    private callHandler(handler: EventHandler, event: SaltyRTCEvent) {
        let response = handler(event);
        if (response === false) {
            this.eventRegistry.unregister(event.type, handler);
        }
    }

}
