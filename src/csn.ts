/**
 * Copyright (C) 2016-2018 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import { randomUint32 } from './utils';

export class CombinedSequence implements saltyrtc.CombinedSequence {
    private static SEQUENCE_NUMBER_MAX = 0x100000000; // 1<<32
    private static OVERFLOW_MAX = 0x100000; // 1<<16

    private logTag: string = '[SaltyRTC.CSN]';

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
        if (this.sequenceNumber + 1 >= CombinedSequence.SEQUENCE_NUMBER_MAX) {
            // Sequence number overflow
            this.sequenceNumber = 0;
            this.overflow += 1;
            if (this.overflow  >= CombinedSequence.OVERFLOW_MAX) {
                // Overflow overflow
                console.error(this.logTag, 'Overflow number just overflowed!');
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
