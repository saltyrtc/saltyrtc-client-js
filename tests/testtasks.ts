/// <reference path="../src/saltyrtc-client.d.ts" />

export class DummyTask implements saltyrtc.Task {

    public initialized = false;
    public peerData: Object;
    protected signaling: saltyrtc.Signaling;
    protected name: string;

    constructor(name?: string) {
        if (name === undefined) {
            this.name = 'dummy.tasks.saltyrtc.org';
        } else {
            this.name = name;
        }
    }

    init(signaling: saltyrtc.Signaling, data: Object): void {
        this.signaling = signaling;
        this.peerData = data;
        this.initialized = true;
    }

    onPeerHandshakeDone(): void {
    }

    onTaskMessage(message: saltyrtc.messages.TaskMessage): void {
        console.log("Got new task message");
    }

    sendSignalingMessage(payload: Uint8Array) {
        console.log("Sending signaling message (" + payload.byteLength + " bytes)");
    }

    getName(): string {
        return this.name;
    }

    getSupportedMessageTypes(): string[] {
        return ['dummy'];
    }

    getData(): Object {
        return {};
    }

    close(reason: number): void {
        // Do nothing
    }

}

export class PingPongTask extends DummyTask {

    public sentPong = false;
    public receivedPong = false;

    constructor() {
        super('pingpong.tasks.saltyrtc.org');
    }

    getSupportedMessageTypes(): string[] {
        return ['ping', 'pong'];
    }

    onPeerHandshakeDone(): void {
        if (this.signaling.role == 'initiator') {
            this.sendPing();
        }
    }

    sendPing(): void {
        console.log('Sending ping');
        this.signaling.sendTaskMessage({'type': 'ping'});
    }

    sendPong(): void {
        console.log('Sending pong');
        this.signaling.sendTaskMessage({'type': 'pong'});
        this.sentPong = true;
    }

    onTaskMessage(message: saltyrtc.messages.TaskMessage): void {
        if (message.type === 'ping') {
            console.log('Received ping');
            this.sendPong();
        } else if (message.type === 'pong') {
            console.log('Received pong');
            this.receivedPong = true;
        }
    }
}
