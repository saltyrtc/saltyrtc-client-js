# SaltyRTC JavaScript Client

[![Travis branch](https://img.shields.io/travis/saltyrtc/saltyrtc-client-javascript/develop.svg?maxAge=2592000)](https://travis-ci.org/saltyrtc/saltyrtc-client-javascript)

This is a [SaltyRTC](https://github.com/saltyrtc/saltyrtc-meta) implementation
for ECMAScript 2015 written in TypeScript 1.7+.

The development is still ongoing, you can find the current version in the
`develop` branch.

Currently at least Firefox 44 and Chromium 49 are required.

## Development

Install dependencies with npm (or alternatively install them manually):

    $ npm install

To compile the TypeScript sources to a single JavaScript (ES2015) file, run
`rollup` in the main directory.

    $ npm run rollup

The resulting file will be located in `dist/saltyrtc.js`.

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

## License

MIT, see `LICENSE.md`.
