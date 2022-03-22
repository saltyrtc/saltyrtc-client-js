/**
 * Copyright (C) 2016-2022 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

export class CloseCode {
    // tslint:disable:variable-name
    public static readonly ClosingNormal = 1000;
    public static readonly GoingAway = 1001;
    public static readonly NoSharedSubprotocol = 1002;
    public static readonly PathFull = 3000;
    public static readonly ProtocolError = 3001;
    public static readonly InternalError = 3002;
    public static readonly Handover = 3003;
    public static readonly DroppedByInitiator = 3004;
    public static readonly InitiatorCouldNotDecrypt = 3005;
    public static readonly NoSharedTask = 3006;
    public static readonly InvalidKey = 3007;
    public static readonly Timeout = 3008;
    // tslint:enable:variable-name
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
