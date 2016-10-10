export class DummyTask implements saltyrtc.Task {

    public initialized = false;
    public peerData: Object;
    private signaling: saltyrtc.Signaling;
    private name: string;

    constructor(name?: string) {
        if (name === undefined) {
            this.name = 'dummy.tasks.saltyrtc.org';
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

    getName(): String {
        return this.name;
    }

    getSupportedMessageTypes(): String[] {
        return ['dummy'];
    }

    getData(): Object {
        return {};
    }

    close(reason: number): void {
        // Do nothing
    }

}