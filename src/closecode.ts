/**
 * Copyright (C) 2016-2017 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

export const enum CloseCode {
    ClosingNormal = 1000,
    GoingAway,
    NoSharedSubprotocol,
    PathFull = 3000,
    ProtocolError,
    InternalError,
    Handover,
    DroppedByInitiator,
    InitiatorCouldNotDecrypt,
    NoSharedTask,
    InvalidKey,
}

export function explainCloseCode(code: CloseCode): string {
    switch (code) {
        case CloseCode.ClosingNormal:
            return 'Normal closing';
        case CloseCode.GoingAway:
            return 'The endpoint is going away';
        case CloseCode.NoSharedSubprotocol:
            return 'No shared subprotocol could be found';
        case CloseCode.PathFull:
            return 'No free responder byte';
        case CloseCode.ProtocolError:
            return 'Protocol error';
        case CloseCode.InternalError:
            return 'Internal error';
        case CloseCode.Handover:
            return 'Handover finished';
        case CloseCode.DroppedByInitiator:
            return 'Dropped by initiator';
        case CloseCode.InitiatorCouldNotDecrypt:
            return 'Initiator could not decrypt a message';
        case CloseCode.NoSharedTask:
            return 'No shared task was found';
        case CloseCode.InvalidKey:
            return 'Invalid key';
        default:
            return 'Unknown';
    }
}
