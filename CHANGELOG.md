# Changelog

This project follows semantic versioning.

Possible log types:

- `[added]` for new features.
- `[changed]` for changes in existing functionality.
- `[deprecated]` for once-stable features removed in upcoming releases.
- `[removed]` for deprecated features removed in this release.
- `[fixed]` for any bug fixes.
- `[security]` to invite users to upgrade in case of vulnerabilities.


### v0.14.0 (2019-02-18)

- [changed] Use `Uint8Array` instead of `ArrayBuffer` in the public API
- [removed] Removed obsolete methods `Cookie.asArrayBuffer` and
  `Cookie.fromArrayBuffer`

### v0.13.2 (2018-10-04)

- [fixed] Exposed `Log.level` attribute

### v0.13.1 (2018-10-04)

- [fixed] Exposed `Log` class

### v0.13.0 (2018-09-27)

- [added] Add possibility to unbind all events when disconnecting
- [added] Introduce log level to builder

### v0.12.4 (2018-08-21)

- [fixed] Updated type declarations

### v0.12.3 (2018-08-21)

- [added] Allow clearing all event handlers at once (#106)

### v0.12.2 (2018-07-31)

- [added] Expose encrypt/decrypt methods on signaling instance (#105)

### v0.12.1 (2018-07-26)

- [security] Fix bug in CSN calculation (#103)
- [fixed] Add `SaltyRTC.getCurrentPeerCsn` to type declarations

**Security Fix**

[#103](https://github.com/saltyrtc/saltyrtc-client-js/pull/103)

Apparently JavaScript treats all operands in bitwise operations as 32 bit
signed integers. This results in `(1 << 32)` being equal to `1`. This means
that previously the calculation of the combined sequence number would be
incorrect if the overflow number is larger than 0.

In theory this is a security issue, however it may only be a problem in the
real world if you send more than 4'294'967'295 messages with the same
connection, which is quite unlikely. However, we definitely recommend upgrading
to the latest version of `@saltyrtc/client`.

### v0.12.0 (2018-07-25)

- [added] Introduce method to extract current CSN
- [changed] Replace thrown strings with exceptions (#97)
- [changed] Crypto performance improvements (#99)
- [changed] Upgrade npm dependencies (#100)

### v0.11.3 (2018-05-17)

- [added] Emit 'no-shared-task' event when no shared task could be found (#93)

### v0.11.2 (2018-05-08)

- [fixed] Handle disconnected messages during peer handshake

### v0.11.1 (2018-05-03)

- [changed] 'disconnected' messages are now emitted as events to the user,
  not as callback to the task (#92)
- [fixed] Fix processing of 'disconnected' messages
- [fixed] Accept server messages during/after peer handshake
- [fixed] If message nonce has an invalid source, discard it

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
