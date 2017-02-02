/**
 * Copyright (C) 2016-2017 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import { CloseCode } from "./closecode";


/**
 * @deprecated Use SignalingError instead
 */
export function InternalError(message: string) {
    this.message = message;
	// Use V8's native method if available, otherwise fallback
    if ('captureStackTrace' in Error) {
        (Error as any).captureStackTrace(this, InternalError);
    } else {
        this.stack = (new Error() as any).stack;
	}
}
InternalError.prototype = Object.create(Error.prototype);
InternalError.prototype.name = 'InternalError';
InternalError.prototype.constructor = InternalError;


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
    constructor(message: string) {
        super(message);
        this.message = message;
        this.name = 'ValidationError';
    }
}
