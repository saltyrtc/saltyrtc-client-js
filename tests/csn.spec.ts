// tslint:disable:file-header
// tslint:disable:no-reference
/// <reference path='jasmine.d.ts' />
/// <reference path='../saltyrtc-client.d.ts' />

import { CombinedSequence } from '../src/csn';

export default () => { describe('csn', function() {

    describe('CombinedSequence', function() {

        it('constructor', () => {
            for (let i = 0; i < 1000; i++) {
                const csn = new CombinedSequence();
                expect(csn.asNumber()).toBeLessThan(2 ** 32);
                expect((csn as any).overflow).toEqual(0);
            }
        });

        it('asNumber', () => {
            const csn = new CombinedSequence();
            (csn as any).sequenceNumber = 1234;
            (csn as any).overflow = 7;
            // (7<<32) + 1234
            expect(csn.asNumber()).toEqual(30064772306);
        });

        it('next (overflow=0)', () => {
            const csn = new CombinedSequence();
            (csn as any).sequenceNumber = 1234;
            (csn as any).overflow = 0;
            const snapshot: saltyrtc.NextCombinedSequence = csn.next();
            expect(snapshot.overflow).toEqual(0);
            expect(snapshot.sequenceNumber).toEqual(1235);
            expect((csn as any).overflow).toEqual(snapshot.overflow);
            expect((csn as any).sequenceNumber).toEqual(snapshot.sequenceNumber);
        });

        it('next (overflow>0)', () => {
            const csn = new CombinedSequence();
            (csn as any).sequenceNumber = 1234;
            (csn as any).overflow = 1337;
            const snapshot: saltyrtc.NextCombinedSequence = csn.next();
            expect(snapshot.overflow).toEqual(1337);
            expect(snapshot.sequenceNumber).toEqual(1235);
            expect((csn as any).overflow).toEqual(snapshot.overflow);
            expect((csn as any).sequenceNumber).toEqual(snapshot.sequenceNumber);
        });

        it('next (overflow=0->1)', () => {
            const csn = new CombinedSequence();
            (csn as any).sequenceNumber = (2 ** 32) - 1;
            (csn as any).overflow = 0;
            expect((csn as any).overflow).toEqual(0);
            expect((csn as any).sequenceNumber).toEqual(4294967295);
            csn.next();
            expect((csn as any).overflow).toEqual(1);
            expect((csn as any).sequenceNumber).toEqual(0);
        });
    });

}); };
