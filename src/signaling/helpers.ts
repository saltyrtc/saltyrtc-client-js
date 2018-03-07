/**
 * Copyright (C) 2016-2018 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import { CloseCode } from '../closecode';
import { SignalingError } from '../exceptions';

/**
 * Decrypt a KeyStore. Convert errors during decryption to an appropriate SignalingError.
 *
 * @throws SignalingError
 */
export function decryptKeystore(box: saltyrtc.Box, keyStore: saltyrtc.KeyStore, otherKey: Uint8Array,
                                msgType?: string): Uint8Array {
    try {
        return keyStore.decrypt(box, otherKey);
    } catch (e) {
        if (e === 'decryption-failed') {
            throw new SignalingError(CloseCode.ProtocolError, 'Could not decrypt ' + msgType + ' message.');
        } else {
            throw e;
        }
    }
}

/**
 * Decrypt an AuthToken. Convert errors during decryption to an appropriate SignalingError.
 *
 * @throws SignalingError
 */
export function decryptAuthtoken(box: saltyrtc.Box, authToken: saltyrtc.AuthToken, msgType: string): Uint8Array {
    try {
        return authToken.decrypt(box);
    } catch (e) {
        if (e === 'decryption-failed') {
            throw new SignalingError(CloseCode.ProtocolError, 'Could not decrypt ' + msgType + ' message.');
        } else {
            throw e;
        }
    }
}

/**
 * Return `true` if byte is a valid responder id (in the range 0x02-0xff).
 */
export function isResponderId(id: number): boolean {
    return id >= 0x02 && id <= 0xff;
}
