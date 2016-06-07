declare namespace saltyrtc {

    type MessageType = 'server-hello' | 'client-hello' | 'client-auth'
                     | 'server-auth' | 'new-initiator' | 'new-responder'
                     | 'drop-responder' | 'send-error' | 'token' | 'key'
                     | 'auth' | 'offer' | 'answer' | 'candidates' | 'restart';

    interface Message {
        type: MessageType,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#server-hello
    interface ServerHello extends Message {
        type: 'server-hello',
        key: number[],
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#client-hello
    interface ClientHello extends Message {
        type: 'client-hello',
        key: number[],
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#client-auth
    interface ClientAuth extends Message {
        type: 'client-auth',
        your_cookie: number[],
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#server-auth
    interface ServerAuth extends Message {
        type: 'server-auth',
        your_cookie: number[],
        initiator_connected?: boolean,
        responders?: number[],
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#new-initiator
    interface NewInitiator extends Message {
        type: 'new-initiator',
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#new-responder
    interface NewResponder extends Message {
        type: 'new-responder',
        id: number,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#drop-responder
    interface DropResponder extends Message {
        type: 'drop-responder',
        id: number,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#send-error
    interface SendError extends Message {
        type: 'send-error',
        hash: number[],
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#token
    interface Token extends Message {
        type: 'token',
        key: number[],
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#key
    interface Key extends Message {
        type: 'key',
        key: number[],
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#auth
    interface Auth extends Message {
        type: 'auth',
        your_cookie: number[],
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#offer
    interface Offer extends Message {
        type: 'offer',
        sdp: string, // TODO: #28
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#answer
    interface Answer extends Message {
        type: 'answer',
        sdp: string, // TODO: #28
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#candidates
    interface Candidates extends Message {
        type: 'candidates',
        sdp: string[], // TODO: #28
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#restart
    interface Restart extends Message {
        type: 'restart',
    }

}
