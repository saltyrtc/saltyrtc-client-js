# Usage

This chapter gives a short introduction on how to use the SaltyRTC JavaScript
client.

To see a more practical example, you may also want to take a look at our [demo
application](https://github.com/saltyrtc/saltyrtc-demo).

## The SaltyRTCBuilder

To initialize a SaltyRTC client instance, you can use the `SaltyRTCBuilder`.

```javascript
let builder = new saltyrtcClient.SaltyRTCBuilder();
```

### Connection info

Then you need to provide connection info:

```javascript
const host = 'server.saltyrtc.org';
const port = 9287;
builder.connectTo(host, port);
```

For testing, you can use [our test server](https://saltyrtc.org/pages/getting-started.html).

### Key store

The client needs to have its own public/private keypair. Create a new keypair
with the `KeyStore` class:

```javascript
const keyStore = new saltyrtcClient.KeyStore();
builder.withKeyStore(keyStore);
```

### Server key pinning

If you want to use server key pinning, specify the server public permanent key:

```javascript
const serverPublicPermanentKey = '424280166304526b4a2874a2270d091071fcc5c98959f7d4718715626df26204';
builder.withServerKey(serverPublicPermanentKey);
```

The public key can either be passed in as `Uint8Array` or as hex-encoded string.

### Websocket ping interval

Optionally, you can specify a Websocket ping interval in seconds:

```javascript
builder.withPingInterval(30);
```

### Task configuration

You must initialize SaltyRTC with a task (TODO: Link to tasks documentation)
that takes over after the handshake is done.

For example, when using the [WebRTC
task](https://github.com/saltyrtc/saltyrtc-task-webrtc-js):

```javascript
const doHandover = true;
const maxPacketSize = 16384;
const webrtcTask = new saltyrtcTaskWebrtc.WebRTCTask(doHandover, maxPacketSize);
builder.usingTasks([webrtcTask]);
```

### Connecting as Initiator

If you want to connect to the server as initiator, you can use the
`.asInitiator()` method:

```javascript
const client = builder.asInitiator();
```

### Connecting as Responder

If you want to connect as responder, you need to provide the initiator
information first that you have obtained from the initiator.

```javascript
builder.initiatorInfo(initiatorPublicPermanentKey, initiatorAuthToken);
const client = builder.asResponder();
```

Both the initiator public permanent key as well as the initiator auth token can
be either `Uint8Array` instances or hex-encoded strings.

## Full example

All methods on the `SaltyRTCBuilder` support chaining. Here's a full example of
an initiator configuration:

```javascript
const config = {
    SALTYRTC_HOST: 'server.saltyrtc.org',
    SALTYRTC_PORT: 9287,
    SALTYRTC_SERVER_PUBLIC_KEY: '424280166304526b4a2874a2270d091071fcc5c98959f7d4718715626df26204',
};
const client = new saltyrtcClient.SaltyRTCBuilder()
    .connectTo(config.SALTYRTC_HOST, config.SALTYRTC_PORT)
    .withServerKey(config.SALTYRTC_SERVER_PUBLIC_KEY)
    .withKeyStore(new saltyrtcClient.KeyStore())
    .usingTasks([new saltyrtcTaskWebrtc.WebRTCTask(true, 16384)])
    .withPingInterval(30)
    .asInitiator();
```

To see a more practical example, you may also want to take a look at our [demo
application](https://github.com/saltyrtc/saltyrtc-demo).

## Trusted keys

In order to reconnect to a session using a trusted key, you first need to
restore your `KeyStore` with the private permanent key originally used to
establish the trusted session:

```javascript
const keyStore = new saltyrtcClient.KeyStore(ourPrivatePermanentKey);
```

The private key can be passed in either as `Uint8Array` or as hex-encoded string.

Then, on the `SaltyRTCBuilder` instance, set the trusted peer key:

```javascript
builder.withTrustedPeerKey(peerPublicPermanentKey);
```

The public key can be passed in either as `Uint8Array` or as hex-encoded string.

## Dynamically determine server connection info

Instead of specifying the SaltyRTC server host and port directly, you can
instead provide an implementation of a `ServerInfoFactory` that can dynamically
determine the connection info based on the public key of the initiator.

The signature of the function must look like this:

```typescript
(initiatorPublicKey: string) => {host: string, port: number}
```

Example:

```javascript
builder.connectWith((initiatorPublicKey) => {
    let host;
    if (initiatorPublicKey.startsWith('a')) {
        host = 'a.example.org';
    } else {
        host = 'other.example.org';
    }
    return {
        host: host,
        port: 8765,
    }
});
```
