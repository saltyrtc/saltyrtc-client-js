# Changelog

This project follows semantic versioning.

Possible log types:

- `[added]` for new features.
- `[changed]` for changes in existing functionality.
- `[deprecated]` for once-stable features removed in upcoming releases.
- `[removed]` for deprecated features removed in this release.
- `[fixed]` for any bug fixes.
- `[security]` to invite users to upgrade in case of vulnerabilities.


### v0.11.0 (2018-03-13)

- [fixed] SaltyRTC.authTokenHex: Add null checks
- [added] Support for 'disconnected' messages (#89)
- [changed] `Task` interface: Add `onDisconnected` method (#90)
- [changed] Only pass task messages to task if supported
- [changed] Add tslint to the codebase (#88)

### v0.10.1 (2018-02-28)

- [changed] Upgrade TypeScript to 2.7, make some types more specific
- [removed] Remove deprecated `InternalError` function

### v0.10.0 (2017-09-26)

- [fixed] Fix type signature in SaltyRTC.asResponder
- [changed] Upgrade tweetnacl to 1.0.0
- [changed] Move npmjs.org package to organization (it's now called
  `@saltyrtc/client`, not `saltyrtc-client`)
- [changed] Update docs

### v0.9.1 (2017-02-13)

- [changed] Updated logging format

### v0.9.0 (2017-02-07)

This release can be considered a release candidate for 1.0.0.

- [changed] Change subprotocol to `v1.saltyrtc.org` (#59)
- [changed] The `KeyStore` class constructor now only requires the private key,
  not both the public and private key (#73)
- [added] Add new close code: 3007 Invalid Key (#58)
- [added] Add support for multiple server permanent keys (#58)
- [changed] Better error logs in the case of signaling errors (#78)

### v0.5.1 (2016-12-13)

- [changed] Make tweetnacl / msgpack-lite peer dependencies

### v0.5.0 (2016-12-12)

- [added] Implement dynamic server endpoints (#70)
- [fixed] Never explicitly close WebSocket with 1002 (#75)
- [fixed] Send close message on disconnect in task state (#68)
- [fixed] Catch nonce validation errors
- [fixed] Only re-throw top level exceptions if unhandled
- [fixed] Don't use decryptFromPeer method in onSignalingMessage
- [changed] Remove restart message handling (#69)

### v0.4.1 (2016-11-14)

- [added] Implement support for application messages (#61)
- [fixed] Set state to "closing" when starting disconnect
- [fixed] Fix inverted condition when handling signaling errors

### v0.4.0 (2016-11-09)

- [added] Support passing server public key to SaltyRTCBuilder (#59)
- [added] Implement support for send-error messages (#14)
- [added] Drop inactive responders (#55)
- [fixed] Always emit connection-closed event on websocket close
- [fixed] Properly handle protocol/signaling errors (#53)
- [fixed] Don't allow calling both `.initiatorInfo` and `.asInitiator` on `SaltyRTCBuilder`

### v0.3.1 (2016-11-07)

- [fixed] Send signaling messages to the task without encrypting (#58)
- [fixed] Close websocket after handshake (#57)

### v0.3.0 (2016-11-02)

- [added] The `KeyStore` and `SaltyRTCBuilder` interfaces now accept hex strings as keys
- [added] The `SaltyRTCBuilder` now supports the `withPingInterval(...)` method
- [added] Notify client on all disconnects
- [changed] The connection-closed event now has the reason code as payload
- [changed] Many refactorings

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
