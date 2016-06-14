/**
 * WebRTC initiator example.
 */

/// <reference path='saltyrtc/types/RTCPeerConnection.d.ts' />
import { SaltyRTC, KeyStore } from './saltyrtc/main';

// Create a new keypair
let permanentKey = new KeyStore();

// Create SaltyRTC instance
let salty = new SaltyRTC(permanentKey, 'saltyrtc.brgn.ch', 8765).asInitiator();

/**
 * Do the initiator flow to set up a secure `RTCDataChannel`.
 */
async function initiatorFlow(pc: RTCPeerConnection, salty: SaltyRTC): Promise<void> {
    // Validate
    if (salty.state !== 'open') {
        throw new Error('SaltyRTC instance is not connected');
    }

    // Send offer
    let offer: RTCSessionDescription = await pc.createOffer();
    await pc.setLocalDescription(offer);
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
    pc.setRemoteDescription({type: 'answer', 'sdp': answerSdp})
      .catch(error => console.error('Could not set remote description', error));
}

async function main(): Promise<void/*SecureDataChannel*/> {

    // Create new peer connection
    let pc = new RTCPeerConnection({
        iceServers: [{urls: ['stun:stun.services.mozilla.com']}],
    });

    // SaltyRTC handshake
    function connect(): Promise<{}> {
        return new Promise((resolve) => {
            salty.once('connected', () => {
                resolve();
            });
            salty.connect();
        });
    }
    await connect();

    // Do initiator flow
    await initiatorFlow(pc, salty).then(
        (value) => console.debug('Initiator flow successful'),
        (error) => console.error('Initiator flow failed', error)
    );

//    // Start handover in background
//    let handover = salty.handover(pc).then(
//        value => console.info('Handover successful'),
//        error => console.error('Handover failed', error));
//
//    // Wrap insecure data channel
//    let dc = salty.wrapDataChannel(pc.createDataChannel('seriously-secure'));
//
//    // Return data channel instance
//    await handover;
//    return dc;

}

main();
