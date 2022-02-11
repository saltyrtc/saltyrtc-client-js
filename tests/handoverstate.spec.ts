// tslint:disable:file-header
// tslint:disable:no-reference
/// <reference path="jasmine.d.ts" />

import { HandoverState } from '../src/signaling/handoverstate';

export default () => { describe('HandoverState', function() {

    let state: HandoverState;

    beforeEach(() => {
        state = new HandoverState();
    });

    it('is initialized to false / false', () => {
        expect(state.local).toBeFalsy();
        expect(state.peer).toBeFalsy();
    });

    it('can determine whether any peer has finished the handover', () => {
        // None
        expect(state.any).toBeFalsy();

        // Local
        state.local = true;
        expect(state.any).toBeTruthy();

        // Peer
        state.reset();
        state.peer = true;
        expect(state.any).toBeTruthy();

        // Both
        state.local = true;
        expect(state.any).toBeTruthy();
    });

    it('can determine whether both peers have finished the handover', () => {
        // None
        expect(state.both).toBeFalsy();

        // Local
        state.local = true;
        expect(state.both).toBeFalsy();

        // Peer
        state.reset();
        state.peer = true;
        expect(state.both).toBeFalsy();

        // Both
        state.local = true;
        expect(state.both).toBeTruthy();
    });

    it('calls the callback when handover is done', () => {
        let onBothCalled = false;
        state.onBoth = () => { onBothCalled = true; };
        expect(onBothCalled).toBeFalsy();
        state.local = true;
        expect(onBothCalled).toBeFalsy();
        state.peer = true;
        expect(onBothCalled).toBeTruthy();
    });
}); };
