/**
 * Test utils.
 *
 * Copyright (C) 2022 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

export const testData = {
    bytes: new Uint8Array(2 ** 16).fill(0xee),
    nonce: new Uint8Array(24).fill(0xdd),
};
