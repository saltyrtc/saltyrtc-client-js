/**
 * Copyright (C) 2016-2020 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

export const enum CloseCode {
    ClosingNormal = 1000,
    GoingAway = 1001,
    NoSharedSubprotocol = 1002,
    PathFull = 3000,
    ProtocolError = 3001,
    InternalError = 3002,
    Handover = 3003,
    DroppedByInitiator = 3004,
    InitiatorCouldNotDecrypt = 3005,
    NoSharedTask = 3006,
    InvalidKey = 3007,
    Timeout = 3008,
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
        case CloseCode.Timeout:
            return 'Timeout';
        default:
            return 'Unknown';
    }
}
