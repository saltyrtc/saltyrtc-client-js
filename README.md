# SaltyRTC JavaScript Client

[![Travis branch](https://img.shields.io/travis/saltyrtc/saltyrtc-client-js/master.svg)](https://travis-ci.org/saltyrtc/saltyrtc-client-js)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/saltyrtc/saltyrtc-client-js)

This is a [SaltyRTC](https://github.com/saltyrtc/saltyrtc-meta) implementation
for JavaScript (ES5) written in TypeScript 1.8+.

The development is still ongoing, the library is not yet production ready.

Currently at least Firefox 45 and Chromium 49 are required.

[API Docs](https://saltyrtc.github.io/saltyrtc-client-js/)

## Usage

First, create a keypair:

    let permanentKey = new saltyrtc.KeyStore();

Then, create a SaltyRTCBuilder instance:

    let builder = new saltyrtc.SaltyRTCBuilder()
        .connectTo(saltyrtcHost, saltyrtcPort)
        .withKeyStore(permanentKey);

Depending on whether you're the initiator or the responder, initialize the SaltyRTC instance:

    let initiator = builder.asInitiator();
    let responder = builder.initiatorInfo(permanentKey.publicKeyBytes, initiator.authTokenBytes).asResponder();

You can also use trusted keys to connect:

    let trustingInitiator = builder.withTrustedPeerKey(responderKey).asInitiator();
    let trustingResponder = builder.withTrustedPeerKey(initiatorKey).asResponder();

Now you can connect both sides:

    initiator.connect()
    responder.connect()

You can query the current signaling state:

    >>> console.log(initiator.state)
    server-handshake

And you can register callbacks for certain events:

    initiator.on('connected', () => console.log('Initiator is connected'));
    responder.on('data', (dataMessage) => console.log('New data arrived:', dataMessage.data));

The following events are available:

 - `state-change(saltyrtc.State)`: The signaling state changed.
 - `new-responder(responderId)`: A responder has connected. This event is only dispatched for the initiator.
 - `connected(void)`: Handshake has been completed, we're connected!
 - `handover(void)`: The handover to the data channel is done.
 - `connection-error(ErrorEvent)`: A connection error occured.
 - `connection-closed(CloseEvent)`: The connection was closed.
 - `data(saltyrtc.Data)`: A new data message was received.
 - `data:<data-type>(saltyrtc.Data)`: The data event, filtered by data type.

## Development

Fetch git submodules:

    $ git submodule update --init

Install dependencies with npm (or alternatively install them manually):

    $ npm install

To compile the TypeScript sources to a single minified JavaScript (ES5) file:

    $ npm run dist

The resulting file will be located in `dist/saltyrtc.min.js`.

You can also watch the source code for changes and recompile automatically:

    $ npm run watch

Due to a bug (https://github.com/rollup/rollup-plugin-typescript/issues/43),
rollup does not currently output non-fatal errors from TypeScript. To see
those, simply issue `npm run validate` in your main directory.

    $ npm run validate

## Testing

To compile the test sources, run:

    $ npm run rollup_tests

You can also watch the tests and sources for changes and recompile
automatically:

    $ npm run watch_tests

Then simply open `tests/testsuite.html` in your browser!

Alternatively, run the tests automatically in Firefox and Chrome:

    $ npm test

## Coding Guidelines

- Write clean ES2015
- Favor `const` over `let`

## License

MIT, see `LICENSE.md`.
