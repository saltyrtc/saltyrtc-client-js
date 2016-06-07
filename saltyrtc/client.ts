/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import { KeyStore, AuthToken, Box } from "./keystore";
import { Signaling, State } from "./signaling";
import { Event, EventHandler, EventRegistry } from "./eventregistry";
import { u8aToHex, hexToU8a } from "./utils";


export class SaltyRTC {
    private host: string;
    private port: number;
    private permanentKey: KeyStore;
    private _signaling: Signaling = null;
    private ws: WebSocket = null;
    private eventRegistry: EventRegistry;

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

        // Create new event registry
        this.reventRegistry = new EventRegistry();
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
     * Send signaling data to the peer.
     */
    public sendData(dataType: string, data: any) {
         this.signaling.sendData({
             type: 'data',
             data_type: dataType,
             data: data,
         } as saltyrtc.Data);
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
        let onceHandler: EventHandler = (ev: Event) => {
            try {
                handler(ev);
            } catch (e) {
                this.off(ev.type, handler);
            }
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
    public emit(event: Event) {
        let handlers = this.eventRegistry.get(event.type);
        for (let handler of handlers) {
            this.callHandler(handler, event);
        }
    }

    /**
     * Call a handler with the specified event.
     *
     * If the handler returns `false`, unregister it.
     */
    private callHandler(handler: EventHandler, event: Event) {
        let response = handler(event);
        if (response === false) {
            this.eventRegistry.unregister(event.type, handler);
        }
    }

    /**
     * Connection is ready for sending and receiving.
     */
    public onConnected(): void {
        console.info('SaltyRTC: Connected to peer');
    }

    /**
     * A data message arrived.
     */
    public onData(data: saltyrtc.Data): void {
        console.info('SaltyRTC: New data message:', data);
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
