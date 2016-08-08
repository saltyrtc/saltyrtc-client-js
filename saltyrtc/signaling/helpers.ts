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
export function decryptKeystore(box: Box, keyStore: KeyStore, otherKey: Uint8Array,
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
export function decryptAuthtoken(box: Box, authToken: AuthToken, msgType: string): Uint8Array {
    try {
        return authToken.decrypt(box);
    } catch (e) {
        if (e === 'decryption-failed') {
            throw new ProtocolError('Could not decrypt ' + msgType + ' message.')
        } else { throw e; }
    }
}

/**
 * Decode a message. Convert errors during decoding to an appropriate ProtocolError.
 */
export function decode(decrypted: Uint8Array, msgType: saltyrtc.messages.MessageType, enforce=false): saltyrtc.Message {
    try {
        const expectedType = enforce ? msgType : undefined;
        return this.decodeMessage(decrypted, expectedType);
    } catch (e) {
        if (e === 'bad-message') {
            throw new ProtocolError('Received malformed ' + msgType + ' message')
        } else if (e === 'bad-message-type') {
            throw new ProtocolError('Received message with wrong type.');
        }
    }
}