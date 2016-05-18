declare namespace saltyrtc {

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#server-hello
    interface ServerHello {
        type: 'server-hello',
        key: Uint8Array,
        my_cookie: Uint8Array,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#client-hello
    interface ClientHello {
        type: 'client-hello',
        key: Uint8Array,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#client-auth
    interface ClientAuth {
        type: 'client-auth',
        your_cookie: Uint8Array,
        my_cookie: Uint8Array,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#server-auth
    interface ServerAuth {
        type: 'server-auth',
        your_cookie: Uint8Array,
        initiator_connected: boolean,
        responders: number[],
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#new-initiator
    interface NewInitiator {
        type: 'new-initiator',
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#new-responder
    interface NewResponder {
        type: 'new-responder',
        id: number,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#drop-responder
    interface DropResponder {
        type: 'drop-responder',
        id: number,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#send-error
    interface SendError {
        type: 'send-error',
        hash: Uint8Array,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#token
    interface Token {
        type: 'token',
        key: Uint8Array,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#key
    interface Key {
        type: 'key',
        key: Uint8Array,
        my_cookie: Uint8Array,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#auth
    interface Auth {
        type: 'auth',
        your_cookie: Uint8Array,
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#offer
    interface Offer {
        type: 'offer',
        session: Uint8Array,
        sdp: string, // TODO: #28
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#answer
    interface Answer {
        type: 'answer',
        session: Uint8Array,
        sdp: string, // TODO: #28
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#candidates
    interface Candidates {
        type: 'answer',
        session: Uint8Array,
        sdp: string[], // TODO: #28
    }

    // https://github.com/saltyrtc/saltyrtc-meta/blob/master/Protocol.md#restart
    interface Restart {
        type: 'restart',
    }

}
