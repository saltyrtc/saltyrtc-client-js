/**
 * Test utils.
 *
 * Copyright (C) 2016-2022 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/**
 * Awaitable promise that sleeps n milliseconds.
 */
export function sleep(milliseconds: number): Promise<{}> {
    return new Promise(function(resolve) {
        window.setTimeout(resolve, milliseconds);
    });
}

/**
 * Type alias for a function that takes no arguments and returns nothing.
 */
export type Runnable = () => void;

export interface PromiseFn<V, E extends Error = Error> {
    resolve: (value: V) => void;
    reject: (reason?: E) => void;
}

/**
 * A {Promise} that allows to resolve or reject outside of the executor and
 * query the current status.
 */
export class ResolvablePromise<V, E extends Error = Error> extends Promise<V> {
    private _done: boolean;
    private readonly _inner: PromiseFn<V | PromiseLike<V>, E>;

    public constructor(
        executor?: (
            resolve: (value: V | PromiseLike<V>) => void,
            reject: (reason?: E) => void,
        ) => void,
    ) {
        // We have to do this little dance here since `this` cannot be used
        // prior to having called `super`.
        const inner: PromiseFn<V | PromiseLike<V>, E> = {
            resolve: ResolvablePromise._fail,
            reject: ResolvablePromise._fail,
        };
        const outer: PromiseFn<V | PromiseLike<V>, E> = {
            resolve: (value) => this.resolve(value),
            reject: (reason) => this.reject(reason),
        };
        super(
            (
                innerResolve: (value: V | PromiseLike<V>) => void,
                innerReject: (reason?: E) => void,
            ) => {
                inner.resolve = innerResolve;
                inner.reject = innerReject;
                if (executor) {
                    executor(outer.resolve, outer.reject);
                    return;
                }
            }
        );
        this._inner = {
            resolve: inner.resolve,
            reject: inner.reject,
        };
        this._done = false;
    }

    /**
     * Called if the promise resolve/rejector methods were not available.
     * This should never happen!
     */
    private static _fail(): void {
        throw new Error('Promise resolve/reject not available');
    }

    /**
     * Return whether the promise is done (resolved or rejected).
     */
    public get done(): boolean {
        return this._done;
    }

    /**
     * Resolve the promise from the outside.
     */
    public resolve(value: V | PromiseLike<V>): void {
        this._done = true;
        this._inner.resolve(value);
    }

    /**
     * Reject the promise from the outside.
     */
    public reject(reason?: E): void {
        this._done = true;
        this._inner.reject(reason);
    }
}
