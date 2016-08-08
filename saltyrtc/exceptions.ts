/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

export class ProtocolError {
    public message: string = '';
    constructor(message?: string) {
        if (message === undefined) {
            this.message = message;
        }
    }
}

export class InternalError {
    public message: string = '';
    constructor(message?: string) {
        if (message === undefined) {
            this.message = message;
        }
    }
}

ProtocolError.prototype = Error.prototype;
InternalError.prototype = Error.prototype;