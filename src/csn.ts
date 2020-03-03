/**
 * Copyright (C) 2016-2020 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import { randomUint32 } from './utils';

export class CombinedSequence implements saltyrtc.CombinedSequence {
    private static SEQUENCE_NUMBER_MAX = 0xFFFFFFFF; // 1<<32 - 1
    private static OVERFLOW_MAX = 0xFFFFF; // 1<<16 - 1

    private sequenceNumber: number;
    private overflow: number;

    constructor() {
        this.sequenceNumber = randomUint32();
        this.overflow = 0;
    }

    /**
     * Return next sequence number and overflow.
     *
     * May throw an error if overflow number overflows. This is extremely
     * unlikely and must be treated as a protocol error.
     */
    public next(): saltyrtc.NextCombinedSequence {
        if (this.sequenceNumber >= CombinedSequence.SEQUENCE_NUMBER_MAX) {
            // Sequence number overflow
            this.sequenceNumber = 0;
            this.overflow += 1;
            if (this.overflow >= CombinedSequence.OVERFLOW_MAX) {
                // Overflow overflow
                throw new Error('overflow-overflow');
            }
        } else {
            this.sequenceNumber += 1;
        }
        return {
            sequenceNumber: this.sequenceNumber,
            overflow: this.overflow,
        };
    }

    /**
     * Return a snapshot of the current CSN as an integer, without changing the
     * internal state.
     *
     * Warning: Do not use this for the SaltyRTC protocol itself!
     */
    public asNumber(): number {
        return (this.overflow * (2 ** 32)) + this.sequenceNumber;
    }

}

/**
 * A combined sequence pair.
 */
export class CombinedSequencePair implements saltyrtc.CombinedSequencePair {
    public ours: CombinedSequence = null;
    public theirs: number = null;

    constructor(ours?: CombinedSequence, theirs?: number) {
        if (typeof ours !== 'undefined' && typeof theirs !== 'undefined') {
            this.ours = ours;
            this.theirs = theirs;
        } else if (typeof ours === 'undefined' && typeof theirs === 'undefined') {
            this.ours = new CombinedSequence();
        } else {
            throw new Error('Either both or no combined sequences must be specified');
        }
    }
}
