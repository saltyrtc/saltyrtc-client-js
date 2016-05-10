# SaltyRTC JavaScript Client

This is a [SaltyRTC](https://github.com/saltyrtc/saltyrtc-meta) implementation
for ECMAScript 2015 written in TypeScript 1.7+.

The development is still ongoing, you can find the current version in the
`develop` branch.

## Development

Install dependencies with npm (or alternatively install them manually):

    $ npm install

To compile the TypeScript sources to a single JavaScript (ES2015) file, run
`rollup` in the main directory.

    $ npm run rollup

The resulting file will be located in `dist/saltyrtc.js`.

Due to a bug (https://github.com/rollup/rollup-plugin-typescript/issues/43),
rollup does not currently output non-fatal errors from TypeScript. To see
those, simply issue `npm run tsc` in your main directory.

    $ npm run tsc

## License

MIT, see `LICENSE.md`.
