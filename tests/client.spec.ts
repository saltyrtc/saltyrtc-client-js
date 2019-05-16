// tslint:disable:file-header
// tslint:disable:no-reference
/// <reference path="jasmine.d.ts" />

import * as nacl from 'tweetnacl';

import { SaltyRTCBuilder } from '../src/client';
import { Box, KeyStore } from '../src/keystore';
import { u8aToHex } from '../src/utils';
import { DummyTask } from './testtasks';
import { sleep } from './utils';

export default () => { describe('client', function() {

    describe('SaltyRTCBuilder', function() {
        const dummyData = new Uint8Array(0);
        const dummyBox = new Box(dummyData, dummyData, 0);

        it('can construct an untrusted initiator', () => {
            const tasks = [new DummyTask()];
            const salty = new SaltyRTCBuilder()
                .connectTo('localhost')
                .withKeyStore(new KeyStore())
                .usingTasks(tasks)
                .asInitiator();
            expect(((salty as any).signaling as any).role).toEqual('initiator');
            expect(((salty as any).signaling as any).peerTrustedKey).toBeNull();
            expect(((salty as any).signaling as any).tasks).toEqual(tasks);
            expect(((salty as any).signaling as any).pingInterval).toEqual(0);
        });

        it('can construct a trusted initiator', () => {
            const tasks = [new DummyTask()];
            const trustedKey = nacl.randomBytes(32);
            const salty = new SaltyRTCBuilder()
                .connectTo('localhost')
                .withKeyStore(new KeyStore())
                .withTrustedPeerKey(trustedKey)
                .usingTasks(tasks)
                .asInitiator();
            expect(((salty as any).signaling as any).role).toEqual('initiator');
            expect(((salty as any).signaling as any).peerTrustedKey).toEqual(trustedKey);
            expect(((salty as any).signaling as any).tasks).toEqual(tasks);
            expect(((salty as any).signaling as any).pingInterval).toEqual(0);
        });

        it('can construct an untrusted responder', () => {
            const tasks = [new DummyTask()];
            const pubKey = nacl.randomBytes(32);
            const authToken = nacl.randomBytes(32);
            const salty = new SaltyRTCBuilder()
                .connectTo('localhost')
                .withKeyStore(new KeyStore())
                .initiatorInfo(pubKey, authToken)
                .usingTasks(tasks)
                .asResponder();
            expect(((salty as any).signaling as any).role).toEqual('responder');
            expect(((salty as any).signaling as any).initiator.permanentSharedKey.remotePublicKeyBytes).toEqual(pubKey);
            expect(((salty as any).signaling as any).authToken.keyBytes).toEqual(authToken);
            expect(((salty as any).signaling as any).peerTrustedKey).toBeNull();
            expect(((salty as any).signaling as any).tasks).toEqual(tasks);
            expect(((salty as any).signaling as any).pingInterval).toEqual(0);
        });

        it('can construct a trusted responder', () => {
            const tasks = [new DummyTask()];
            const trustedKey = nacl.randomBytes(32);
            const salty = new SaltyRTCBuilder()
                .connectTo('localhost')
                .withKeyStore(new KeyStore())
                .withTrustedPeerKey(trustedKey)
                .usingTasks(tasks)
                .asResponder();
            expect(((salty as any).signaling as any).role).toEqual('responder');
            expect(((salty as any).signaling as any).peerTrustedKey).toEqual(trustedKey);
            expect(((salty as any).signaling as any).initiator.permanentSharedKey.remotePublicKeyBytes).toEqual(trustedKey);
            expect(((salty as any).signaling as any).authToken).toBeNull();
            expect(((salty as any).signaling as any).tasks).toEqual(tasks);
            expect(((salty as any).signaling as any).pingInterval).toEqual(0);
        });

        it('accepts hex strings as initiator pub key / auth token', () => {
            const pubKey = nacl.randomBytes(32);
            const authToken = nacl.randomBytes(32);
            const salty = new SaltyRTCBuilder()
                .connectTo('localhost')
                .withKeyStore(new KeyStore())
                .initiatorInfo(u8aToHex(pubKey), u8aToHex(authToken))
                .usingTasks([new DummyTask()])
                .asResponder();
            expect(((salty as any).signaling as any).initiator.permanentSharedKey.remotePublicKeyBytes).toEqual(pubKey);
            expect(((salty as any).signaling as any).authToken.keyBytes).toEqual(authToken);
        });

        it('accepts hex strings as peer trusted key', () => {
            const trustedKey = nacl.randomBytes(32);
            const salty = new SaltyRTCBuilder()
                .connectTo('localhost')
                .withKeyStore(new KeyStore())
                .withTrustedPeerKey(u8aToHex(trustedKey))
                .usingTasks([new DummyTask()])
                .asResponder();
            expect(((salty as any).signaling as any).peerTrustedKey).toEqual(trustedKey);
        });

        it('accepts websocket ping interval', () => {
            const salty = new SaltyRTCBuilder()
                .connectTo('localhost')
                .withKeyStore(new KeyStore())
                .usingTasks([new DummyTask()])
                .withPingInterval(10)
                .asInitiator();
            expect(((salty as any).signaling as any).pingInterval).toEqual(10);
        });

        it('validates websocket ping interval', () => {
            const builder = new SaltyRTCBuilder();
            expect(() => builder.withPingInterval(-10)).toThrowError("Ping interval may not be negative");
        });

        it('cannot encrypt/decrypt before the remote peer is established', () => {
            const salty = new SaltyRTCBuilder()
                .connectTo('localhost')
                .withKeyStore(new KeyStore())
                .usingTasks([new DummyTask()])
                .withPingInterval(10)
                .asInitiator();

            const encrypt = () => salty.encryptForPeer(dummyData, dummyData);
            const decrypt = () => salty.decryptFromPeer(dummyBox);

            expect(encrypt).toThrowError('Remote peer has not yet been established');
            expect(decrypt).toThrowError('Remote peer has not yet been established');
        });

        it('cannot encrypt/decrypt before the session key is established', () => {
            const trustedKey = nacl.randomBytes(32);
            const salty = new SaltyRTCBuilder()
                .connectTo('localhost')
                .withKeyStore(new KeyStore())
                .withTrustedPeerKey(trustedKey)
                .usingTasks([new DummyTask()])
                .asResponder();

            const encrypt = () => salty.encryptForPeer(dummyData, dummyData);
            const decrypt = () => salty.decryptFromPeer(dummyBox);

            expect(encrypt).toThrowError('Session key not yet established');
            expect(decrypt).toThrowError('Session key not yet established');
        });

    });

    describe('SaltyRTC', function() {

        describe('events', function() {

            beforeEach(() => {
                this.sc = new SaltyRTCBuilder()
                    .connectTo('localhost')
                    .withKeyStore(new KeyStore())
                    .usingTasks([new DummyTask()])
                    .asInitiator();
            });

            it('can emit events', (done: any) => {
                this.sc.on('connected', () => {
                    expect(true).toBe(true);
                    done();
                });
                this.sc.emit({type: 'connected'});
            });

            it('only calls handlers for specified events', async () => {
                let counter = 0;
                this.sc.on(['connected', 'data'], () => {
                    counter += 1;
                });
                this.sc.emit({type: 'connected'});
                this.sc.emit({type: 'data'});
                this.sc.emit({type: 'connection-error'});
                this.sc.emit({type: 'connected'});
                await sleep(20);
                expect(counter).toEqual(3);
            });

            it('only adds a handler once', async () => {
                let counter = 0;
                let handler = () => {counter += 1;};
                this.sc.on('data', handler);
                this.sc.on('data', handler);
                this.sc.emit({type: 'data'});
                await sleep(20);
                expect(counter).toEqual(1);
            });

            it('can call multiple handlers', async () => {
                let counter = 0;
                let handler1 = () => {counter += 1;};
                let handler2 = () => {counter += 1;};
                this.sc.on(['connected', 'data'], handler1);
                this.sc.on(['connected'], handler2);
                this.sc.emit({type: 'connected'});
                this.sc.emit({type: 'data'});
                await sleep(20);
                expect(counter).toEqual(3);
            });

            it('can cancel handlers', async () => {
                let counter = 0;
                let handler = () => {counter += 1;};
                this.sc.on(['data', 'connected'], handler);
                this.sc.emit({type: 'connected'});
                this.sc.emit({type: 'data'});
                this.sc.off('data', handler);
                this.sc.emit({type: 'connected'});
                this.sc.emit({type: 'data'});
                await sleep(20);
                expect(counter).toEqual(3);
            });

            it('can cancel handlers for multiple events', async () => {
                let counter = 0;
                let handler = () => {counter += 1;};
                this.sc.on(['data', 'connected'], handler);
                this.sc.emit({type: 'connected'});
                this.sc.emit({type: 'data'});
                this.sc.off(['data', 'connected'], handler);
                this.sc.emit({type: 'connected'});
                this.sc.emit({type: 'data'});
                await sleep(20);
                expect(counter).toEqual(2);
            });

            it('can register one-time handlers', async () => {
                let counter = 0;
                let handler = () => {counter += 1;};
                this.sc.once('data', handler);
                this.sc.emit({type: 'data'});
                this.sc.emit({type: 'data'});
                await sleep(20);
                expect(counter).toEqual(1);
            });

            it('can register one-time handlers that throw', async () => {
                let counter = 0;
                let handler = () => {counter += 1; throw 'oh noes';};
                this.sc.once('data', handler);
                this.sc.emit({type: 'data'});
                this.sc.emit({type: 'data'});
                await sleep(20);
                expect(counter).toEqual(1);
            });

            it('removes handlers that return false', async () => {
                let counter = 0;
                let handler = () => {
                    if (counter <= 4) {
                        counter += 1;
                    } else {
                        return false;
                    }
                };
                this.sc.on('data', handler);
                for (let i = 0; i < 7; i++) {
                    this.sc.emit({type: 'data'});
                }
                await sleep(20);
                expect(counter).toEqual(5);
            });

        });

        describe('application messages', function() {

            it('can only send application messages after c2c handshake', () => {
                const salty = new SaltyRTCBuilder()
                    .connectTo('localhost')
                    .withKeyStore(new KeyStore())
                    .usingTasks([new DummyTask()])
                    .asInitiator();

                const send = () => salty.sendApplicationMessage("hello");
                (salty as any).signaling.state = 'peer-handshake';
                expect(send).toThrowError('Cannot send application message in "peer-handshake" state');
                (salty as any).signaling.state = 'closing';
                expect(send).toThrowError('Cannot send application message in "closing" state');
            });

        });

    });

}); }
