/**
 * Copyright (C) 2016-2018 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import { CookiePair } from './cookie';
import { CombinedSequencePair } from './csn';
import { byteToHex } from './utils';

/**
 * Base class for peers (initiator or responder).
 */
export abstract class Peer {
    protected _id: number;
    protected _csnPair = new CombinedSequencePair();
    protected _cookiePair: saltyrtc.CookiePair;
    protected _permanentSharedKey: saltyrtc.SharedKeyStore | null = null;
    protected _sessionSharedKey: saltyrtc.SharedKeyStore | null = null;

    constructor(id: number, cookiePair?: saltyrtc.CookiePair) {
        this._id = id;
        if (cookiePair === undefined) {
            this._cookiePair = new CookiePair();
        } else {
            this._cookiePair = cookiePair;
        }
    }

    public get id(): number {
        return this._id;
    }

    public get hexId(): string {
        return byteToHex(this._id);
    }

    public get csnPair(): CombinedSequencePair {
        return this._csnPair;
    }

    public get cookiePair(): saltyrtc.CookiePair {
        return this._cookiePair;
    }

    public get permanentSharedKey(): saltyrtc.SharedKeyStore | null {
        return this._permanentSharedKey;
    }

    public get sessionSharedKey(): saltyrtc.SharedKeyStore | null {
        return this._sessionSharedKey;
    }

    public abstract get name(): string;

    public setPermanentSharedKey(remotePermanentKey: Uint8Array, localPermanentKey: saltyrtc.KeyStore) {
        this._permanentSharedKey = localPermanentKey.getSharedKeyStore(remotePermanentKey);
    }

    public setSessionSharedKey(remoteSessionKey: Uint8Array, localSessionKey: saltyrtc.KeyStore) {
        this._sessionSharedKey = localSessionKey.getSharedKeyStore(remoteSessionKey);
    }
}

/**
 * Base class for initiator and responder.
 */
export abstract class Client extends Peer {
    protected _localSessionKey: saltyrtc.KeyStore | null = null;

    public get localSessionKey(): saltyrtc.KeyStore | null {
        return this._localSessionKey;
    }

    public setLocalSessionKey(localSessionKey: saltyrtc.KeyStore) {
        this._localSessionKey = localSessionKey;
    }

    public setSessionSharedKey(remoteSessionKey: Uint8Array, localSessionKey?: saltyrtc.KeyStore) {
        if (!localSessionKey) {
            localSessionKey = this._localSessionKey;
        } else {
            this._localSessionKey = localSessionKey;
        }
        super.setSessionSharedKey(remoteSessionKey, localSessionKey);
    }
}

/**
 * Information about the initiator. Used by responder during handshake.
 */
export class Initiator extends Client {
    public static ID = 0x01;

    public connected = false;
    public handshakeState: 'new' | 'token-sent' | 'key-sent' | 'key-received'
                         | 'auth-sent' | 'auth-received'
                         = 'new';

    constructor(remotePermanentKey: Uint8Array, localPermanentKey: saltyrtc.KeyStore) {
        super(Initiator.ID);
        this.setPermanentSharedKey(remotePermanentKey, localPermanentKey);
    }

    public get name(): string {
        return 'Initiator';
    }
}

/**
 * Information about a responder. Used by initiator during handshake.
 */
export class Responder extends Client {
    public handshakeState: 'new' | 'token-received' | 'key-received'
                         | 'key-sent' | 'auth-received' | 'auth-sent'
                         = 'new';
    private _counter: number;

    constructor(id: number, counter: number) {
        super(id);
        this._counter = counter;
    }

    public get name(): string {
        return 'Responder ' + this.id;
    }

    get counter(): number {
        return this._counter;
    }
}

/**
 * Information about the server.
 */
export class Server extends Peer {
    public static ID = 0x00;

    public handshakeState: 'new' | 'hello-sent' | 'auth-sent' | 'done' = 'new';

    constructor() {
        super(Server.ID);
    }

    public get name(): string {
        return 'Server';
    }
}
