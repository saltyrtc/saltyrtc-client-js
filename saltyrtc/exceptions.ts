/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/**
 * @deprecated Use SignalingError instead
 */
export function ProtocolError(message: string) {
    this.message = message;
	// Use V8's native method if available, otherwise fallback
    if ('captureStackTrace' in Error) {
        (Error as any).captureStackTrace(this, ProtocolError);
    } else {
        this.stack = (new Error() as any).stack;
	}
}
ProtocolError.prototype = Object.create(Error.prototype);
ProtocolError.prototype.name = 'ProtocolError';
ProtocolError.prototype.constructor = ProtocolError;

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
class SignalingError extends Error {
    public closeCode: number;
    constructor(closeCode: number, message: string) {
        super(message);
        this.message = message;
        this.closeCode = closeCode;
        this.name = 'SignalingError';
    }
}

/**
 * Errors related to the network connection state.
 */
class ConnectionError extends Error {
    constructor(message: string) {
        super(message);
        this.message = message;
        this.name = 'ConnectionError';
    }
}