/**
 * Copyright (C) 2016-2022 Threema GmbH
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
export class SignalingError extends Error implements saltyrtc.SignalingError {
    public readonly closeCode: number;
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
export class ProtocolError extends SignalingError implements saltyrtc.ProtocolError {
    constructor(message: string) {
        super(CloseCode.ProtocolError, message);
    }
}

/**
 * Errors related to the network connection state.
 */
export class ConnectionError extends Error implements saltyrtc.ConnectionError {
    constructor(message: string) {
        super(message);
        this.message = message;
        this.name = 'ConnectionError';
    }
}

/**
 * Errors related to validation.
 */
export class ValidationError extends Error implements saltyrtc.ValidationError {
    // If this flag is set, then the validation error
    // will be converted to a protocol error.
    public readonly critical: boolean;

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
export class CryptoError extends Error implements saltyrtc.CryptoError {
    // A short string used to identify the exception
    // independently from the error message.
    public readonly code: saltyrtc.CryptoErrorCode;

    constructor(code: saltyrtc.CryptoErrorCode, message: string) {
        super(message);
        this.name = 'CryptoError';
        this.message = message;
        this.code = code;
    }
}
