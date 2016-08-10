/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
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