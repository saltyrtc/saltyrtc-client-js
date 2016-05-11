/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import { randomString } from "./utils";

export class Session {
    private _id: string = null;

    get id(): string {
        return this._id;
    }

    new(): void {
        console.debug('Starting new session');
        this._id = randomString();
    }
}
