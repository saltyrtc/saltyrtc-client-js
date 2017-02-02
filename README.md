# SaltyRTC JavaScript Client

[![Travis branch](https://img.shields.io/travis/saltyrtc/saltyrtc-client-js/master.svg)](https://travis-ci.org/saltyrtc/saltyrtc-client-js)
[![Supported ES Standard](https://img.shields.io/badge/javascript-ES5%20%2F%20ES2015-yellow.svg)](https://github.com/saltyrtc/saltyrtc-client-js)
[![npm Version](https://img.shields.io/npm/v/saltyrtc-client.svg?maxAge=2592000)](https://www.npmjs.com/package/saltyrtc-client)
[![npm Downloads](https://img.shields.io/npm/dt/saltyrtc-client.svg?maxAge=3600)](https://www.npmjs.com/package/saltyrtc-client)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/saltyrtc/saltyrtc-client-js)
[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/536/badge)](https://bestpractices.coreinfrastructure.org/projects/536)

This is a [SaltyRTC](https://github.com/saltyrtc/saltyrtc-meta) v1
implementation for JavaScript (ES5) written in TypeScript 2.0+.

The development is still ongoing, the library is not yet production ready.

Currently at least Firefox 45 and Chromium 49 are required.

[API Docs](https://saltyrtc.github.io/saltyrtc-client-js/)

## Installing

### Via npm

You can install this library via `npm`:

    npm install --save saltyrtc-client msgpack-lite tweetnacl

### Manually

Alternatively, copy one of the following files to your project directly:

 - ES2015: `dist/saltyrtc-client.es2015.js`
 - ES5: `dist/saltyrtc-client.es5.js`
 - ES5 minified: `dist/saltyrtc-client.es5.min.js`
 - ES5 minified polyfilled: `dist/saltyrtc-client.es5.min.polyfill.js`

Make sure to manually add the following external dependencies to your project:

 - [tweetnacl](https://github.com/dchest/tweetnacl-js)
 - [msgpack-lite](https://github.com/kawanet/msgpack-lite)

## Usage

First, create a keypair:

    let permanentKey = new saltyrtcClient.KeyStore();

Then, create a SaltyRTCBuilder instance:

    let builder = new saltyrtcClient.SaltyRTCBuilder()
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

    initiator.on('handover', () => console.log('Handover is done'));
    responder.on('state-change', (newState) => console.log('New signaling state:', newState));

The following events are available:

 - `state-change(saltyrtcClient.SignalingState)`: The signaling state changed.
 - `state-change:<new-state>(void)`: The signaling state change event, filtered by state.
 - `new-responder(responderId)`: A responder has connected. This event is only dispatched for the initiator.
 - `application(data)`: An application message has arrived.
 - `handover(void)`: The handover to the data channel is done.
 - `signaling-connection-lost(responderId)`: The signaling connection to the specified peer was lost.
 - `connection-closed(closeCode)`: The connection was closed.
 - `connection-error(ErrorEvent)`: A websocket connection error occured.

## Development

Install dependencies:

    $ npm install

To compile the TypeScript sources to a single JavaScript (ES5 / Minified ES5 / ES2015) file:

    $ npm run dist

The resulting files will be located in `dist/`.

Due to a bug (https://github.com/rollup/rollup-plugin-typescript/issues/43),
rollup does not currently output non-fatal errors from TypeScript. To see
those, simply issue `npm run validate` in your main directory.

    $ npm run validate

## Testing

To compile the test sources, run:

    $ npm run rollup_tests

Then simply open `tests/testsuite.html` in your browser!

Alternatively, run the tests automatically in Firefox and Chrome:

    $ npm test

## Security

### Responsible Disclosure / Reporting Security Issues

Please report security issues directly to one or both of the following contacts:

- Danilo Bargen
    - Email: mail@dbrgn.ch
    - Threema: EBEP4UCA
    - GPG: [EA456E8BAF0109429583EED83578F667F2F3A5FA][keybase-dbrgn]
- Lennart Grahl
    - Email: lennart.grahl@gmail.com
    - Threema: MSFVEW6C
    - GPG: [3FDB14868A2B36D638F3C495F98FBED10482ABA6][keybase-lgrahl]

[keybase-dbrgn]: https://keybase.io/dbrgn
[keybase-lgrahl]: https://keybase.io/lgrahl

## Coding Guidelines

- Write clean ES2015
- Favor `const` over `let`

## License

MIT, see `LICENSE.md`.
