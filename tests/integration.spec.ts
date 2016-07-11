// Integration tests
//
// Note that these tests require a running SaltyRTC server instance.
// Configure the server in `tests/config.ts`.

/// <reference path="jasmine.d.ts" />
/// <reference path="../saltyrtc/types/RTCPeerConnection.d.ts" />

import { Config } from "./config";
import { sleep } from "./utils";
import { SaltyRTC, KeyStore } from "../saltyrtc/main";

export default () => { describe('Integration Tests', function() {

    beforeEach(() => {
        this.initiator = new SaltyRTC(new KeyStore(),
                                      Config.SALTYRTC_HOST,
                                      Config.SALTYRTC_PORT).asInitiator();

        let pubKey = this.initiator.permanentKeyBytes;
        let authToken = this.initiator.authTokenBytes;
        this.responder = new SaltyRTC(new KeyStore(),
                                      Config.SALTYRTC_HOST,
                                      Config.SALTYRTC_PORT).asResponder(pubKey, authToken);

        // Helper function. Connect both clients and resolve once they're both connected.
        this.connectBoth = (a, b) => {
            let ready = 0;
            return new Promise((resolve) => {
                a.once('connected', () => { ready += 1; if (ready == 2) resolve(); });
                b.once('connected', () => { ready += 1; if (ready == 2) resolve(); });
                a.connect();
                b.connect();
            });
        }
    });

    describe('SaltyRTC', () => {

        it('connect (initiator first)', async (done) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');
            this.initiator.connect();
            expect(this.initiator.state).toEqual('ws-connecting');
            await sleep(1000);
            expect(this.initiator.state === 'server-handshake' ||
                   this.initiator.state === 'peer-handshake').toBe(true);
            this.responder.connect();
            expect(this.responder.state).toEqual('ws-connecting');
            await sleep(1000);
            expect(this.initiator.state).toBe('open');
            expect(this.responder.state).toBe('open');
            done();
        });

        it('connect (responder first)', async (done) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');
            this.responder.connect();
            expect(this.responder.state).toEqual('ws-connecting');
            await sleep(1000);
            expect(this.responder.state === 'server-handshake' ||
                   this.responder.state === 'peer-handshake').toBe(true);
            this.initiator.connect();
            expect(this.initiator.state).toEqual('ws-connecting');
            await sleep(1000);
            expect(this.initiator.state).toBe('open');
            expect(this.responder.state).toBe('open');
            done();
        });

        it('connect speed', async (done) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');
            let t1, t2;
            let ready = 0;
            let callback = () => {
                ready += 1;
                if (ready == 2) {
                    t2 = new Date();
                    let diffMs = t2 - t1;
                    console.info('Full handshake took', diffMs, 'milliseconds');
                    expect(diffMs).toBeLessThan(1000);
                    done();
                }
            };
            this.initiator.on('connected', callback);
            this.responder.on('connected', callback);
            t1 = new Date();
            this.initiator.connect();
            this.responder.connect();
        });

        /**
         * Send round-trip custom data.
         */
        it('sending data', async (done) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');
            await this.connectBoth(this.initiator, this.responder);
            this.responder.on('data:fondue', (msg) => {
                expect(msg.type).toBe('data:fondue');
                expect(msg.data).toBe('Your fondue is ready!');
                this.responder.sendData('thanks', ['merci', 'danke', 'grazie'])
            });
            this.initiator.on('data:thanks', (msg) => {
                expect(msg.type).toBe('data:thanks');
                expect(msg.data[0]).toBe('merci');
                expect(msg.data[1]).toBe('danke');
                expect(msg.data[2]).toBe('grazie');
                done();
            });
            this.initiator.sendData('fondue', 'Your fondue is ready!');
        });

        it('disconnect before peer handshake', async (done) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');
            this.initiator.connect();
            await sleep(1000);
            expect(this.initiator.state).toEqual('peer-handshake');
            expect(this.responder.state).toEqual('new');
            this.initiator.once('connection-closed', (ev) => {
                expect(this.initiator.state).toEqual('closed');
                done();
            });
            this.initiator.disconnect();
        });

        it('disconnect after peer handshake', async (done) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');
            await this.connectBoth(this.initiator, this.responder);
            this.initiator.once('connection-closed', (ev) => {
                expect(this.initiator.state).toEqual('closed');
                done();
            });
            this.initiator.disconnect();
        });

        it('new-responder event (responder first)', async (done) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');

            // Create two responders
            const pubKey = this.initiator.permanentKeyBytes;
            const authToken = this.initiator.authTokenBytes;
            let responder1 = new SaltyRTC(new KeyStore(),
                                          Config.SALTYRTC_HOST,
                                          Config.SALTYRTC_PORT).asResponder(pubKey, authToken);
            let responder2 = new SaltyRTC(new KeyStore(),
                                          Config.SALTYRTC_HOST,
                                          Config.SALTYRTC_PORT).asResponder(pubKey, authToken);
            expect(responder1.state).toEqual('new');
            expect(responder2.state).toEqual('new');

            // Register event handler
            let eventCounter = 0;
            this.initiator.on('new-responder', (ev) => eventCounter += 1);
            responder1.on('new-responder', (id) => expect(true).toBe(false));
            responder2.on('new-responder', (id) => expect(true).toBe(false));

            // Connect responders
            responder1.connect();
            responder2.connect();
            await sleep(1000);
            expect(eventCounter).toBe(0);

            // Connect initiator
            this.initiator.connect();
            await sleep(1000);
            expect(eventCounter).toBe(2);

            done();
        });

        it('new-responder event (initiator first)', async (done) => {
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');

            // Register event handler
            let eventCounter = 0;
            this.initiator.on('new-responder', (ev) => eventCounter += 1);
            this.responder.on('new-responder', (id) => expect(true).toBe(false));

            // Connect initiator
            this.initiator.connect();
            await sleep(1000);
            expect(eventCounter).toBe(0);

            // Connect responder
            this.responder.connect();
            await sleep(1000);
            expect(eventCounter).toBe(1);

            done();
        });


    });

    describe('WebRTC', () => {

        async function initiatorFlow(pc: RTCPeerConnection, salty: SaltyRTC): Promise<void> {
            // Validate
            if (salty.state !== 'open') {
                throw new Error('SaltyRTC instance is not connected');
            }

            // Send offer
            let offer: RTCSessionDescription = await pc.createOffer();
            await pc.setLocalDescription(offer);
            console.debug('Initiator: Created offer, set local description');
            salty.sendData('offer', offer.sdp);

            // Receive answer
            function receiveAnswer(): Promise<string> {
                return new Promise((resolve) => {
                    salty.once('data:answer', (message: saltyrtc.Data) => {
                        resolve(message.data);
                    });
                });
            }
            let answerSdp = await receiveAnswer();
            await pc.setRemoteDescription({type: 'answer', 'sdp': answerSdp})
              .catch(error => console.error('Could not set remote description', error));
            console.debug('Initiator: Received answer, set remote description');
        }

        async function responderFlow(pc: RTCPeerConnection, salty: SaltyRTC): Promise<void> {
            // Validate
            if (salty.state !== 'open') {
                throw new Error('SaltyRTC instance is not connected');
            }

            // Receive offer
            function receiveOffer(): Promise<string> {
                return new Promise((resolve) => {
                    salty.once('data:offer', (message: saltyrtc.Data) => {
                        resolve(message.data);
                    });
                });
            }
            let offerSdp = await receiveOffer();
            await pc.setRemoteDescription({type: 'offer', 'sdp': offerSdp})
              .catch(error => console.error('Could not set remote description', error));
            console.debug('Initiator: Received offer, set remote description');

            // Send answer
            let answer: RTCSessionDescription = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.debug('Initiator: Created answer, set local description');
            salty.sendData('answer', answer.sdp);
        }

        /**
         * Set up transmission and processing of ICE candidates.
         */
        function setupIceCandidateHandling(pc: RTCPeerConnection, salty: SaltyRTC) {
            let role = (salty as any).signaling.role;
            let logTag = role.charAt(0).toUpperCase() + role.slice(1) + ':';
            console.debug(logTag, 'Setting up ICE candidate handling');
            pc.onicecandidate = (e: RTCIceCandidateEvent) => {
                if (e.candidate) {
                    salty.sendData('candidate', {
                        candidate: e.candidate.candidate,
                        sdpMid: e.candidate.sdpMid,
                        sdpMLineIndex: e.candidate.sdpMLineIndex,
                    } as RTCIceCandidate);
                }
            };
            pc.onicecandidateerror = (e: RTCPeerConnectionIceErrorEvent) => {
                console.error(logTag, 'ICE candidate error:', e);
            };
            salty.on('data:candidate', (message: saltyrtc.Data) => {
                pc.addIceCandidate(new RTCIceCandidate(message.data));
            });
        }

        function connect(salty: SaltyRTC): Promise<{}> {
            return new Promise((resolve) => {
                salty.once('connected', () => {
                    resolve();
                });
                salty.connect();
            });
        }

        /**
         * Create two peer connections and do the handshake.
         */
        async function setupPeerConnection(): Promise<{initiator: RTCPeerConnection, responder: RTCPeerConnection}> {
            // Create peer connections
            let initiatorConn = new RTCPeerConnection();
            let responderConn = new RTCPeerConnection();

            // Connect both peers
            let connectInitiator = connect(this.initiator);
            let connectResponder = connect(this.responder);
            await connectInitiator;
            await connectResponder;

            // Do initiator flow
            initiatorConn.onnegotiationneeded = (e: Event) => {
                initiatorFlow(initiatorConn, this.initiator).then(
                    (value) => console.debug('Initiator flow successful'),
                    (error) => console.error('Initiator flow failed', error)
                );
            };

            // Do responder flow
            responderConn.onnegotiationneeded =(e: Event) => {
                responderFlow(responderConn, this.responder).then(
                    (value) => console.debug('Responder flow successful'),
                    (error) => console.error('Responder flow failed', error)
                );
            };

            // Set up ICE candidate handling
            setupIceCandidateHandling(initiatorConn, this.initiator);
            setupIceCandidateHandling(responderConn, this.responder);

            // Do handover
            let handover = () => {
                return new Promise((resolve) => {
                    this.initiator.handover(initiatorConn);
                    this.responder.handover(responderConn);

                    let handoverCount = 0;
                    let handoverHandler = () => {
                        handoverCount += 1;
                        if (handoverCount == 2) {
                            resolve();
                        }
                    };
                    this.initiator.once('handover', handoverHandler);
                    this.responder.once('handover', handoverHandler);
                });
            };
            await handover();
            console.info('Handover done.');

            return {
                initiator: initiatorConn,
                responder: responderConn,
            }
        };

        it('setting up a peer connection', async (done) => {
            await setupPeerConnection.bind(this)();

            // Get references to private signaling datachannel
            let initiatorDc = (this.initiator.signaling as any).dc as RTCDataChannel;
            let responderDc = (this.responder.signaling as any).dc as RTCDataChannel;
            expect(initiatorDc.readyState).toEqual('open');
            expect(responderDc.readyState).toEqual('open');

            // Send a (unencrypted) test message through the signaling data channel
            responderDc.onmessage = (e: RTCMessageEvent) => {
                console.log('Responder: Received dc message!');
                expect(e.data).toEqual('bonan tagon.');
                responderDc.send('saluton!');
            };
            initiatorDc.onmessage = (e: RTCMessageEvent) => {
                console.log('Initiator: Received dc message!');
                expect(e.data).toEqual('saluton!');
                done();
            };
            initiatorDc.send('bonan tagon.');
        });

        it('wrapping a data channel', async (done) => {
            let connections: {
                initiator: RTCPeerConnection,
                responder: RTCPeerConnection,
            } = await setupPeerConnection.bind(this)();

            // Create a new unencrypted datachannel
            let testUnencrypted = () => {
                return new Promise((resolve) => {
                    connections.responder.ondatachannel = (e: RTCDataChannelEvent) => {
                        e.channel.onmessage = (e: RTCMessageEvent) => {
                            expect(e.data).toEqual('bonjour');
                            resolve();
                        };
                    };
                    let dc = connections.initiator.createDataChannel('dc1');
                    dc.binaryType = 'arraybuffer';
                    dc.send('bonjour');
                });
            }
            await testUnencrypted();
            console.info('Unencrypted test done');

            // Wrap data channel
            let testEncrypted = () => {
                return new Promise((resolve) => {
                    connections.responder.ondatachannel = (e: RTCDataChannelEvent) => {
                        // The receiver should get encrypted data.
                        e.channel.onmessage = (e: RTCMessageEvent) => {
                            expect(e.data).not.toEqual('enigma');
                            resolve();
                        };
                    };
                    let dc = connections.initiator.createDataChannel('dc2');
                    dc.binaryType = 'arraybuffer';
                    let safedc = this.initiator.wrapDataChannel(dc);
                    safedc.send('enigma');
                });
            }
            await testEncrypted();
            console.info('Encrypted test done');

            done();
        });

        it('onmessage handler on wrapped data channel', async (done) => {
            let connections: {
                initiator: RTCPeerConnection,
                responder: RTCPeerConnection,
            } = await setupPeerConnection.bind(this)();

            // Wrap data channel
            connections.responder.ondatachannel = (e: RTCDataChannelEvent) => {
                // The receiver should transparently decrypt received data.
                e.channel.binaryType = 'arraybuffer';
                let receiverDc = this.responder.wrapDataChannel(e.channel);
                receiverDc.onmessage = (e: RTCMessageEvent) => {
                    expect(e.data).toEqual('enigma');
                    done();
                };
            };
            let dc = connections.initiator.createDataChannel('dc2');
            dc.binaryType = 'arraybuffer';
            let safedc = this.initiator.wrapDataChannel(dc);
            safedc.send('enigma');
        });

    });

}); }
