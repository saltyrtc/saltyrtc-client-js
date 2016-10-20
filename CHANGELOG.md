# Changelog

This project follows semantic versioning.

Possible log types:

- `[added]` for new features.
- `[changed]` for changes in existing functionality.
- `[deprecated]` for once-stable features removed in upcoming releases.
- `[removed]` for deprecated features removed in this release.
- `[fixed]` for any bug fixes.
- `[security]` to invite users to upgrade in case of vulnerabilities.


### v0.2.7 (2016-10-20)

- [added] Add HandoverState helper class
- [fixed] Check peer handover state when receiving ws message

### v0.2.6 (2016-10-19)

- [fixed] Extend type declarations with missing static types
- [changed] Change iife dist namespace to `saltyrtcClient`

### v0.2.5 (2016-10-19)

- [fixed] Fix filename of polyfilled dist file

### v0.2.4 (2016-10-18)

- [fixed] Use interface types for KeyStore and AuthToken
- [fixed] Fix path to ES6 polyfill

### v0.2.3 (2016-10-18)

- [fixed] Use interface types in SaltyRTCBuilder
- [changed] Move type declarations to root directory

### v0.2.2 (2016-10-18)

- [fixed] Fix sending of signaling messages after handshake
- [added] Expose close codes and exceptions

### v0.2.1 (2016-10-17)

- [added] Make saltyrtc.messages.TaskMessage an open interface

### v0.2.0 (2016-10-17)

- [changed] Rename saltyrtc/ directory to src/

### v0.1.9 (2016-10-17)

- [added] Add "typings" field to package.json

### v0.1.8 (2016-10-17)

- [changed] Make polyfills in ES5 distribution optional

### v0.1.7 (2016-10-13)

- [changed] Build ES2015 version as ES module, not as IIFE

### v0.1.6 (2016-10-13)

- [changed] Improved packaging

### v0.1.5 (2016-10-13)

- [changed] Internal cleanup

### v0.1.4 (2016-10-13)

- [fixed] Fix exposed classes in `main.ts`

### v0.1.3 (2016-10-13)

- [added] Create `CombinedSequencePair` class

### v0.1.2 (2016-10-13)

- [added] Expose `Cookie` and `CookiePair` classes
- [added] Expose `CombinedSequence` class

### v0.1.1 (2016-10-12)

- [added] Expose `EventRegistry` class

### v0.1.0 (2016-10-12)

- Initial release
