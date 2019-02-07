/// <reference path="../saltyrtc-client.d.ts" />

export class DummyTask implements saltyrtc.Task {

    public initialized = false;
    public peerData: object;
    protected signaling: saltyrtc.Signaling;
    protected name: string;

    public constructor(name?: string) {
        if (name === undefined) {
            this.name = 'dummy.tasks.saltyrtc.org';
        } else {
            this.name = name;
        }
    }

    public init(signaling: saltyrtc.Signaling, data: object): void {
        this.signaling = signaling;
        this.peerData = data;
        this.initialized = true;
    }

    public onPeerHandshakeDone(): void {
    }

    public onTaskMessage(message: saltyrtc.messages.TaskMessage): void {
        console.log("Got new task message");
    }

    // noinspection JSMethodCanBeStatic
    public sendSignalingMessage(payload: Uint8Array) {
        console.log("Sending signaling message (" + payload.byteLength + " bytes)");
    }

    public getName(): string {
        return this.name;
    }

    public getSupportedMessageTypes(): string[] {
        return ['dummy'];
    }

    // noinspection JSMethodCanBeStatic
    public getData(): object {
        return {};
    }

    public close(): void {
        // Do nothing
    }

}

export class PingPongTask extends DummyTask {

    public sentPong = false;
    public receivedPong = false;

    public constructor() {
        super('pingpong.tasks.saltyrtc.org');
    }

    public getSupportedMessageTypes(): string[] {
        return ['ping', 'pong'];
    }

    public onPeerHandshakeDone(): void {
        if (this.signaling.role == 'initiator') {
            this.sendPing();
        }
    }

    public sendPing(): void {
        console.log('[PingPongTask] Sending ping');
        this.signaling.sendTaskMessage({'type': 'ping'});
    }

    public sendPong(): void {
        console.log('[PingPongTask] Sending pong');
        this.signaling.sendTaskMessage({'type': 'pong'});
        this.sentPong = true;
    }

    public onTaskMessage(message: saltyrtc.messages.TaskMessage): void {
        if (message.type === 'ping') {
            console.log('[PingPongTask] Received ping');
            this.sendPong();
        } else if (message.type === 'pong') {
            console.log('[PingPongTask] Received pong');
            this.receivedPong = true;
        }
    }
}
