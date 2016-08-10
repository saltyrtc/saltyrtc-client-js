/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import { CombinedSequence } from "./csn";
import { KeyStore } from "./keystore";
import { byteToHex } from "./utils";

/**
 * Base class for peers (initiator or responder).
 */
export abstract class Peer {
    public permanentKey: Uint8Array;
    public sessionKey: Uint8Array;
    protected _id: number;
    protected _csn = new CombinedSequence();

    constructor(permanentKey?: Uint8Array) {
        this.permanentKey = permanentKey;
    }

    public get id(): number {
        return this._id;
    }

    public get hexId(): string {
        return byteToHex(this._id);
    }

    public get csn(): CombinedSequence {
        return this._csn;
    }
}

/**
 * Information about the initiator. Used by responder during handshake.
 */
export class Initiator extends Peer {
    public connected = false;
    public handshakeState: 'new' | 'token-sent' | 'key-sent' = 'new';
    constructor(permanentKey: Uint8Array) {
        super(permanentKey);
        this._id = 0x01;
    }
}

/**
 * Information about a responder. Used by initiator during handshake.
 */
export class Responder extends Peer {
    public keyStore = new KeyStore();
    public handshakeState: 'new' | 'token-received' | 'key-received' = 'new';
    constructor(id: number) {
        super();
        this._id = id;
    }
}
