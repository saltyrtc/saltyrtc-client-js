/**
 * Copyright (C) 2016-2022 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/**
 * Return `true` if byte is a valid responder id (in the range 0x02-0xff).
 */
export function isResponderId(id: number): boolean {
    return id >= 0x02 && id <= 0xff;
}
