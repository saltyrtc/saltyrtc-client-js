/**
 * Copyright (C) 2016-2018 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import { CloseCode } from './closecode';

/**
 * A SaltyRTC signaling error.
 *
 * It will result in the connection closing with the specified error code.
 */
export class SignalingError extends Error {
    public closeCode: number;
    constructor(closeCode: number, message: string) {
        super(message);
        this.message = message;
        this.closeCode = closeCode;
        this.name = 'SignalingError';
    }
}

/**
 * A signaling error with the close code hardcoded to ProtocolError.
 */
export class ProtocolError extends SignalingError {
    constructor(message: string) {
        super(CloseCode.ProtocolError, message);
    }
}

/**
 * Errors related to the network connection state.
 */
export class ConnectionError extends Error {
    constructor(message: string) {
        super(message);
        this.message = message;
        this.name = 'ConnectionError';
    }
}

/**
 * Errors related to validation.
 */
export class ValidationError extends Error {
    // If this flag is set, then the validation error
    // will be converted to a protocol error.
    public critical: boolean;

    constructor(message: string, critical: boolean = true) {
        super(message);
        this.message = message;
        this.name = 'ValidationError';
        this.critical = critical;
    }
}

/**
 * Crypto related errors.
 */
export class CryptoError extends Error {
    // A short string used to identify the exception
    // independently from the error message.
    private _code: string;

    constructor(code: string, message: string) {
        super(message);
        this.name = 'CryptoError';
        this.message = message;
        this._code = code;
    }

    public get code(): string {
        return this._code;
    }
}
