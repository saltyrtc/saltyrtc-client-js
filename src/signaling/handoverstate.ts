/**
 * Copyright (C) 2016-2018 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

export class HandoverState {

    private _local: boolean;
    private _peer: boolean;

    constructor() {
        this.reset();
    }

    public get local(): boolean {
        return this._local;
    }

    public set local(state: boolean) {
        const wasBoth = this.both;
        this._local = state;
        if (!wasBoth && this.both && this.onBoth !== undefined) {
            this.onBoth();
        }
    }

    public get peer(): boolean {
        return this._peer;
    }

    public set peer(state: boolean) {
        const wasBoth = this.both;
        this._peer = state;
        if (!wasBoth && this.both && this.onBoth !== undefined) {
            this.onBoth();
        }
    }

    /**
     * Return true if both peers have finished the handover.
     */
    public get both(): boolean {
        return this._local === true && this._peer === true;
    }

    /**
     * Return true if any peer has finished the handover.
     */
    public get any(): boolean {
        return this._local === true || this._peer === true;
    }

    /**
     * Reset handover state.
     */
    public reset() {
        this._local = false;
        this._peer = false;
    }

    /**
     * Callback that is called when both local and peer have done the
     * handover.
     */
    public onBoth: () => void;

}
