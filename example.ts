/**
 * Usage example.
 */

/// <reference path='saltyrtc/types/RTCPeerConnection.d.ts' />

import { SaltyRTC, KeyStore } from "saltyrtc/main";

let ks = new KeyStore();
let sc = new SaltyRTC(null, ks, null);

async function initiatorFlow(pc: RTCPeerConnection, sc: SaltyRTC) {
    let offer = await pc.createOffer()
    await pc.setLocalDescription(offer);
    sc.onReceiveAnswer = (answer) => {
        pc.setRemoteDescription(answer)
            .catch(error => console.error('Could not set remote description', error));
    };
    sc.sendOffer(offer);
}

async function main(): Promise<void/*SecureDataChannel*/> {

    // Create new peer connection
    let pc = new RTCPeerConnection({
        iceServers: [{
            urls: ['turn:example.com'],
            username: 'user',
            credential: 'pass',
        }],
    });

//    // SaltyRTC handshake
//    sc.connect(pc);
//
//    // Do initiator flow
//    await initiatorFlow(pc, sc).then(
//        value => console.debug('Initiator flow successful'),
//        error => console.error('Initiator flow failed', error));
//
//    // Start handover in background
//    let handover = sc.handover(pc).then(
//        value => console.info('Handover successful'),
//        error => console.error('Handover failed', error));
//
//    // Wrap insecure data channel
//    let dc = sc.wrapDataChannel(pc.createDataChannel("seriously-secure"));
//
//    // Return data channel instance
//    await handover;
//    return dc;
}

main();
