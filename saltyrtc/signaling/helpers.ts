/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import { ProtocolError } from "../exceptions";
import { Box, KeyStore, AuthToken } from "../keystore";

/**
 * Decrypt a KeyStore. Convert errors during decryption to an appropriate ProtocolError.
 */
export function decryptKeystore(box: saltyrtc.Box, keyStore: KeyStore, otherKey: Uint8Array,
                                msgType?: string): Uint8Array {
    try {
        return keyStore.decrypt(box, otherKey);
    } catch (e) {
        if (e === 'decryption-failed') {
            throw new ProtocolError('Could not decrypt ' + msgType + ' message.')
        } else { throw e; }
    }
}

/**
 * Decrypt an AuthToken. Convert errors during decryption to an appropriate ProtocolError.
 */
export function decryptAuthtoken(box: saltyrtc.Box, authToken: AuthToken, msgType: string): Uint8Array {
    try {
        return authToken.decrypt(box);
    } catch (e) {
        if (e === 'decryption-failed') {
            throw new ProtocolError('Could not decrypt ' + msgType + ' message.')
        } else { throw e; }
    }
}


/**
 * Return `true` if receiver byte is a valid responder id (in the range 0x02-0xff).
 */
export function isResponderId(receiver: number): boolean {
    return receiver >= 0x02 && receiver <= 0xff;
}