/**
 * Copyright (C) 2016-2018 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import { EventRegistry } from './eventregistry';
import { AuthToken } from './keystore';
import { Log } from './log';
import { InitiatorSignaling, ResponderSignaling, Signaling } from './signaling';
import { u8aToHex, validateKey } from './utils';

export class SaltyRTCBuilder implements saltyrtc.SaltyRTCBuilder {
    private hasConnectionInfo = false;
    private hasKeyStore = false;
    private hasInitiatorInfo = false;
    private hasTrustedPeerKey = false;
    private hasTasks = false;

    private host: string;
    private port: number;
    private serverInfoFactory: saltyrtc.ServerInfoFactory = null;
    private keyStore: saltyrtc.KeyStore;
    private initiatorPublicKey: Uint8Array;
    private serverPublicKey: Uint8Array;
    private authToken: Uint8Array;
    private peerTrustedKey: Uint8Array;
    private tasks: saltyrtc.Task[];
    private pingInterval = 0;
    private logLevel: saltyrtc.LogLevel = 'none';

    /**
     * Validate the SaltyRTC host. Throw an `Error` if it's invalid.
     */
    private validateHost(host: string): void {
        if (host.endsWith('/')) {
            throw new Error('SaltyRTC host may not end with a slash');
        }
        if (host.indexOf('//') !== -1) {
            throw new Error('SaltyRTC host should not contain protocol');
        }
    }

    /**
     * Assert that a keystore has been set.
     */
    private requireKeyStore(): void {
        if (!this.hasKeyStore) {
            throw new Error('Keys not set yet. Please call .withKeyStore method first.');
        }
    }

    /**
     * Assert that connection info has been set.
     */
    private requireConnectionInfo(): void {
        if (!this.hasConnectionInfo) {
            throw new Error('Connection info not set yet. Please call .connectTo method first.');
        }
    }

    /**
     * Assert that tasks have been set.
     */
    private requireTasks(): void {
        if (!this.hasTasks) {
            throw new Error('Tasks not set yet. Please call .usingTasks method first.');
        }
    }

    /**
     * Assert that initiator info has been set.
     */
    private requireInitiatorInfo(): void {
        if (!this.hasInitiatorInfo) {
            throw new Error('Initiator info not set yet. Please call .initiatorInfo method first.');
        }
    }

    /**
     * Set SaltyRTC signalling server connection info.
     *
     * @param host The SaltyRTC server host.
     * @param port The SaltyRTC server port. Default 8765.
     * @throws Error if the host string is invalid.
     */
    public connectTo(host: string, port: number = 8765): SaltyRTCBuilder {
        this.validateHost(host);
        this.host = host;
        this.port = port;
        this.hasConnectionInfo = true;
        return this;
    }

    /**
     * Provide a function that can determine SaltyRTC signalling server
     * connection info.
     */
    public connectWith(serverInfoFactory: saltyrtc.ServerInfoFactory): SaltyRTCBuilder {
        this.serverInfoFactory = serverInfoFactory;
        this.hasConnectionInfo = true;
        return this;
    }

    /**
     * Set the key store. This can be either a new `KeyStore` instance, or a
     * saved one if you intend to use trusted keys.
     *
     * @param keyStore The KeyStore instance containing the public and private
     *     permanent key to use.
     */
    public withKeyStore(keyStore: saltyrtc.KeyStore): SaltyRTCBuilder {
        this.keyStore = keyStore;
        this.hasKeyStore = true;
        return this;
    }

    /**
     * Set the trusted public key of the peer.
     *
     * @param peerTrustedKey The trusted public permanent key of the peer as
     *     hex string or Uint8Array.
     */
    public withTrustedPeerKey(peerTrustedKey: Uint8Array | string): SaltyRTCBuilder {
        this.peerTrustedKey = validateKey(peerTrustedKey, 'Peer key');
        this.hasTrustedPeerKey = true;
        return this;
    }

    /**
     * Set a list of tasks in order of descending preference.
     *
     * @param tasks A list of objects implementing the `saltyrtc.Task`
     *     interface in descending preference.
     */
    public usingTasks(tasks: saltyrtc.Task[]): SaltyRTCBuilder {
        if (tasks.length < 1) {
            throw new Error('You must specify at least 1 task');
        }
        this.tasks = tasks;
        this.hasTasks = true;
        return this;
    }

    /**
     * Request that the server sends a WebSocket ping every `interval` seconds.
     * @param interval A positive integer. Set it to 0 for no ping messages.
     */
    public withPingInterval(interval: number): SaltyRTCBuilder {
        if (interval < 0) {
            throw new Error('Ping interval may not be negative');
        }
        this.pingInterval = interval;
        return this;
    }

    /**
     * Set the public permanent server key.
     *
     * When setting the server key to a known value, the server will be
     * authenticated during the handshake, so that MITM attacks can be
     * prevented. It can be thought of as certificate pinning.
     *
     * @param serverKey The public permanent key of the server.
     */
    public withServerKey(serverKey: Uint8Array | string): SaltyRTCBuilder {
        this.serverPublicKey = validateKey(serverKey, 'Server public key');
        return this;
    }

    /**
     * Set the logging level.
     *
     * @param level The desired logging level.
     */
    public withLoggingLevel(level: saltyrtc.LogLevel): SaltyRTCBuilder {
        this.logLevel = level;
        return this;
    }

    /**
     * Set initiator connection info transferred via a secure data channel.
     *
     * @param initiatorPublicKey The public key of the initiator as hex string
     *     or Uint8Array.
     * @param authToken The secret auth token as hex string or Uint8Array.
     */
    public initiatorInfo(initiatorPublicKey: Uint8Array | string, authToken: Uint8Array | string): SaltyRTCBuilder {
        this.initiatorPublicKey = validateKey(initiatorPublicKey, 'Initiator public key');
        this.authToken = validateKey(authToken, 'Auth token');
        this.hasInitiatorInfo = true;
        return this;
    }

    /**
     * If a ServerInfoFactory is provided, dynamically determine host and port.
     */
    private processServerInfo(factory: saltyrtc.ServerInfoFactory, publicKey: Uint8Array): void {
        const publicKeyHex = u8aToHex(publicKey);
        const data = factory(publicKeyHex);
        this.host = data.host;
        this.port = data.port;
    }

    /**
     * Return a SaltyRTC instance configured as initiator.
     * @throws Error if key or connection info haven't been set yet.
     * @returns {SaltyRTC}
     */
    public asInitiator(): SaltyRTC {
        this.requireConnectionInfo();
        this.requireKeyStore();
        this.requireTasks();
        if (this.hasInitiatorInfo) {
            throw new Error('Cannot initialize as initiator if .initiatorInfo(...) has been used');
        }

        if (this.serverInfoFactory !== null) {
            this.processServerInfo(this.serverInfoFactory, this.keyStore.publicKeyBytes);
        }

        if (this.hasTrustedPeerKey) {
            return new SaltyRTC(
                new Log(this.logLevel), this.keyStore, this.host, this.port, this.serverPublicKey,
                this.tasks, this.pingInterval, this.peerTrustedKey,
            ).asInitiator();
        } else {
            return new SaltyRTC(
                new Log(this.logLevel), this.keyStore, this.host, this.port, this.serverPublicKey,
                this.tasks, this.pingInterval,
            ).asInitiator();
        }
    }

    /**
     * Return a SaltyRTC instance configured as responder.
     * @throws Error if key or connection info or initiator info haven't been
     *     set yet.
     * @returns {SaltyRTC}
     */
    public asResponder(): SaltyRTC {
        this.requireConnectionInfo();
        this.requireKeyStore();
        this.requireTasks();
        if (this.hasTrustedPeerKey) {
            if (this.serverInfoFactory !== null) {
                this.processServerInfo(this.serverInfoFactory, this.peerTrustedKey);
            }
            return new SaltyRTC(
                new Log(this.logLevel), this.keyStore, this.host, this.port, this.serverPublicKey,
                this.tasks, this.pingInterval, this.peerTrustedKey,
            ).asResponder();
        } else {
            this.requireInitiatorInfo();
            if (this.serverInfoFactory !== null) {
                this.processServerInfo(this.serverInfoFactory, this.initiatorPublicKey);
            }
            return new SaltyRTC(
                new Log(this.logLevel), this.keyStore, this.host, this.port, this.serverPublicKey,
                this.tasks, this.pingInterval,
            ).asResponder(this.initiatorPublicKey, this.authToken);
        }
    }
}

/**
 * The main class used to create a P2P connection through a SaltyRTC signaling
 * server.
 */
class SaltyRTC implements saltyrtc.SaltyRTC {
    public readonly log: saltyrtc.Log;
    private host: string;
    private port: number;
    private permanentKey: saltyrtc.KeyStore;
    private tasks: saltyrtc.Task[];
    private peerTrustedKey: Uint8Array = null;
    private _signaling: Signaling = null;
    private eventRegistry: saltyrtc.EventRegistry;
    private pingInterval: number;
    private serverPublicKey: Uint8Array;

    private logTag: string = '[SaltyRTC.Client]';

    /**
     * Create a new SaltyRTC instance.
     */
    constructor(log: saltyrtc.Log, permanentKey: saltyrtc.KeyStore, host: string, port: number,
                serverKey: Uint8Array, tasks: saltyrtc.Task[], pingInterval: number,
                peerTrustedKey?: Uint8Array) {
        // Validate arguments
        if (permanentKey === undefined) {
            throw new Error('SaltyRTC must be initialized with a permanent key');
        }
        if (host === undefined) {
            throw new Error('SaltyRTC must be initialized with a target host');
        }
        if (tasks === undefined || tasks.length === 0) {
            throw new Error('SaltyRTC must be initialized with at least 1 task');
        }

        // Store properties
        this.log = log;
        this.host = host;
        this.port = port;
        this.permanentKey = permanentKey;
        this.tasks = tasks;
        this.pingInterval = pingInterval;
        if (peerTrustedKey !== undefined) {
            this.peerTrustedKey = peerTrustedKey;
        }
        if (serverKey !== undefined) {
            this.serverPublicKey = serverKey;
        }

        // Create new event registry
        this.eventRegistry = new EventRegistry();
    }

    /**
     * Initialize SaltyRTC instance as initiator.
     */
    public asInitiator(): SaltyRTC {
        // Initialize signaling class
        if (this.peerTrustedKey !== null) {
            this._signaling = new InitiatorSignaling(this, this.host, this.port, this.serverPublicKey,
                this.tasks, this.pingInterval, this.permanentKey, this.peerTrustedKey);
        } else {
            this._signaling = new InitiatorSignaling(this, this.host, this.port, this.serverPublicKey,
                this.tasks, this.pingInterval, this.permanentKey);
        }

        // Return self
        return this;
    }

    /**
     * Initialize SaltyRTC instance as responder.
     *
     * The initiatorPubKey and the authToken can be left unspecified when
     * reconnecting to a trusted session.
     */
    public asResponder(initiatorPubKey?: Uint8Array, authToken?: Uint8Array): SaltyRTC {
        if (this.peerTrustedKey !== null) {
            // Initialize signaling class
            this._signaling = new ResponderSignaling(this, this.host, this.port, this.serverPublicKey,
                this.tasks, this.pingInterval, this.permanentKey, this.peerTrustedKey);
        } else {
            // Create AuthToken instance
            const token = new AuthToken(authToken, this.log);

            // Initialize signaling class
            this._signaling = new ResponderSignaling(this, this.host, this.port, this.serverPublicKey,
                this.tasks, this.pingInterval, this.permanentKey, initiatorPubKey, token);
        }

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
    public get state(): saltyrtc.SignalingState {
        return this.signaling.getState();
    }

    /**
     * Return the keystore containing the personal permanent key private/public
     * keypair.
     */
    public get keyStore(): saltyrtc.KeyStore {
        return this.permanentKey;
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
     * Return the auth token as hex string, or null if no auth token was set.
     */
    public get authTokenHex(): string | null {
        if (this.signaling.authTokenBytes) {
            return u8aToHex(this.signaling.authTokenBytes);
        }
        return null;
    }

    /**
     * Return the peer permanent key as Uint8Array.
     */
    public get peerPermanentKeyBytes(): Uint8Array {
        return this.signaling.peerPermanentKeyBytes;
    }

    /**
     * Return the peer permanent key as hex string.
     */
    public get peerPermanentKeyHex(): string {
        return u8aToHex(this.signaling.peerPermanentKeyBytes);
    }

    /**
     * Return the negotiated task, or null if no task has been negotiated yet.
     */
    public getTask(): saltyrtc.Task {
        return this.signaling.task;
    }

    /**
     * If the peer handshake is complete, this will return the incoming and
     * outgoing CSN for the authenticated peer. Otherwise, null will be
     * returned.
     */
    public getCurrentPeerCsn(): {incoming: number, outgoing: number} {
        return this.signaling.getCurrentPeerCsn();
    }

    /**
     * Encrypt plain data for the remote peer and return encrypted data in
     * a box.
     *
     * Will throw Error in case the session keys have not yet been
     * established.
     */
    public encryptForPeer(data: Uint8Array, nonce: Uint8Array): saltyrtc.Box {
        return this.signaling.encryptForPeer(data, nonce);
    }

    /**
     * Decrypt encrypted boxed data from the remote peer and return plain
     * data as bytes.
     *
     * Will throw Error in case the session keys have not yet been
     * established.
     */
    public decryptFromPeer(box: saltyrtc.Box): Uint8Array {
        return this.signaling.decryptFromPeer(box);
    }

    /**
     * Connect to the SaltyRTC server.
     *
     * This method is asynchronous. To get notified when the peer connection is
     * up and running, subscribe to the `state-change:task` event.
     */
    public connect(): void {
        this.signaling.connect();
    }

    /**
     * Close the connection to the server and the peer.
     *
     * Both the WebSocket as well as any open task connection will be closed.
     *
     * This method is asynchronous. To get notified when the connection is has
     * been closed, subscribe to the `connection-closed` event. To silence
     * further events from the underlying connection, set `unbind` to `true`.
     */
    public disconnect(unbind = false): void {
        this.signaling.disconnect(unbind);
    }

    /**
     * Attach an event handler to the specified event(s).
     *
     * Note: The same event handler cannot be registered twice. It will only
     * run once.
     */
    public on(event: string | string[], handler: saltyrtc.SaltyRTCEventHandler): void {
        this.eventRegistry.register(event, handler);
    }

    /**
     * Attach a one-time event handler to the specified event(s).
     *
     * Note: If the same handler was already registered previously as a regular
     * event handler, it will be completely removed after running once.
     */
    public once(event: string | string[], handler: saltyrtc.SaltyRTCEventHandler): void {
        const onceHandler: saltyrtc.SaltyRTCEventHandler = (ev: saltyrtc.SaltyRTCEvent) => {
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
     *
     * If no event name is specified, all event handlers will be cleared.
     */
    public off(event?: string | string[], handler?: saltyrtc.SaltyRTCEventHandler): void {
        if (event === undefined) {
            this.eventRegistry.unregisterAll();
        } else {
            this.eventRegistry.unregister(event, handler);
        }
    }

    /**
     * Emit an event.
     */
    public emit(event: saltyrtc.SaltyRTCEvent) {
        this.log.debug(this.logTag, 'New event:', event.type);
        const handlers = this.eventRegistry.get(event.type);
        for (const handler of handlers) {
            try {
                this.callHandler(handler, event);
            } catch (e) {
                this.log.error(this.logTag, 'Unhandled exception in', event.type, 'handler:', e);
            }
        }
    }

    /**
     * Send an application message to the peer.
     *
     * May only be called after client to client handshake has taken place.
     * Otherwise a SignalingError will be thrown.
     *
     * @param data Data to be sent. May be of any type serializable by the
     *     msgpack-lite library.
     */
    public sendApplicationMessage(data: any): void {
        this.signaling.sendApplication({
            type: 'application',
            data: data,
        });
    }

    /**
     * Call a handler with the specified event.
     *
     * If the handler returns `false`, unregister it.
     */
    private callHandler(handler: saltyrtc.SaltyRTCEventHandler, event: saltyrtc.SaltyRTCEvent) {
        const response = handler(event);
        if (response === false) {
            this.eventRegistry.unregister(event.type, handler);
        }
    }
}
