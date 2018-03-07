# SaltyRTC JavaScript Client

[![CircleCI](https://circleci.com/gh/saltyrtc/saltyrtc-client-js/tree/master.svg?style=shield)](https://circleci.com/gh/saltyrtc/saltyrtc-client-js/tree/master)
[![Supported ES Standard](https://img.shields.io/badge/javascript-ES5%20%2F%20ES2015-yellow.svg)](https://github.com/saltyrtc/saltyrtc-client-js)
[![npm Version](https://img.shields.io/npm/v/@saltyrtc/client.svg?maxAge=2592000)](https://www.npmjs.com/package/@saltyrtc/client)
[![npm Downloads](https://img.shields.io/npm/dt/@saltyrtc/client.svg?maxAge=3600)](https://www.npmjs.com/package/@saltyrtc/client)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/saltyrtc/saltyrtc-client-js)
[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/536/badge)](https://bestpractices.coreinfrastructure.org/projects/536)
[![Chat on Gitter](https://badges.gitter.im/saltyrtc/Lobby.svg)](https://gitter.im/saltyrtc/Lobby)

This is a [SaltyRTC](https://github.com/saltyrtc/saltyrtc-meta) v1
implementation for JavaScript (ES5+) written in TypeScript 2.

**Warning: This is beta software. Use at your own risk. Testing and review is
welcome!**

The library has been tested with Firefox 45+ and Chromium 49+.

- [Docs](https://saltyrtc.github.io/saltyrtc-client-js/docs/)
- [API Docs](https://saltyrtc.github.io/saltyrtc-client-js/apidocs/)

## Installing

### Via npm

You can install this library via `npm`:

    npm install --save @saltyrtc/client msgpack-lite tweetnacl

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

See [Docs](https://saltyrtc.github.io/saltyrtc-client-js/docs/).

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

### 1. Preparing the Server

First, clone the `saltyrtc-server-python` repository.

    git clone https://github.com/saltyrtc/saltyrtc-server-python
    cd saltyrtc-server-python

Then create a test certificate for localhost, valid for 5 years.

    openssl req \
       -newkey rsa:1024 \
       -x509 \
       -nodes \
       -keyout saltyrtc.key \
       -new \
       -out saltyrtc.crt \
       -subj /CN=localhost \
       -reqexts SAN \
       -extensions SAN \
       -config <(cat /etc/ssl/openssl.cnf \
         <(printf '[SAN]\nsubjectAltName=DNS:localhost')) \
       -sha256 \
       -days 1825

You can import this file into your browser certificate store. For Chrome/Chromium, use this command:

    certutil -d sql:$HOME/.pki/nssdb -A -t "P,," -n saltyrtc-test-ca -i saltyrtc.crt

Create a Python virtualenv with dependencies:

    python3 -m virtualenv venv
    venv/bin/pip install .[logging]

Finally, start the server with the following test permanent key:

    export SALTYRTC_SERVER_PERMANENT_KEY=0919b266ce1855419e4066fc076b39855e728768e3afa773105edd2e37037c20 # Public: 09a59a5fa6b45cb07638a3a6e347ce563a948b756fd22f9527465f7c79c2a864
    venv/bin/saltyrtc-server -v 5 serve -p 8765 \
        -sc saltyrtc.crt -sk saltyrtc.key \
        -k $SALTYRTC_SERVER_PERMANENT_KEY


### 2. Running Tests

To compile the test sources, run:

    $ npm run rollup_tests

Then simply open `tests/testsuite.html` in your browser!

Alternatively, run the tests automatically in Firefox and Chrome:

    $ npm test


### 3. Linting

To run linting checks:

    npm run lint

You can also install a pre-push hook to do the linting:

    echo -e '#!/bin/sh\nnpm run lint' > .git/hooks/pre-push
    chmod +x .git/hooks/pre-push


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
