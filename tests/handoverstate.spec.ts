/// <reference path="jasmine.d.ts" />

import { HandoverState } from "../src/signaling/handoverstate";

export default () => { describe('HandoverState', function() {

    beforeEach(() => {
        this.state = new HandoverState();
    });

    it('is initialized to false / false', () => {
        expect(this.state.local).toBeFalsy();
        expect(this.state.peer).toBeFalsy();
    });

    it('can determine whether any peer has finished the handover', () => {
        // None
        expect(this.state.any).toBeFalsy();

        // Local
        this.state.local = true;
        expect(this.state.any).toBeTruthy();

        // Peer
        this.state.reset();
        this.state.peer = true;
        expect(this.state.any).toBeTruthy();

        // Both
        this.state.local = true;
        expect(this.state.any).toBeTruthy();
    });

    it('can determine whether both peers have finished the handover', () => {
        // None
        expect(this.state.both).toBeFalsy();

        // Local
        this.state.local = true;
        expect(this.state.both).toBeFalsy();

        // Peer
        this.state.reset();
        this.state.peer = true;
        expect(this.state.both).toBeFalsy();

        // Both
        this.state.local = true;
        expect(this.state.both).toBeTruthy();
    });

    it('calls the callback when handover is done', () => {
        let onBothCalled = false;
        this.state.onBoth = () => { onBothCalled = true; };
        expect(onBothCalled).toBeFalsy();
        this.state.local = true;
        expect(onBothCalled).toBeFalsy();
        this.state.peer = true;
        expect(onBothCalled).toBeTruthy();
    });
}); }
