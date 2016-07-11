/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the `LICENSE.md` file for details.
 */

/// <reference path='saltyrtc.d.ts' />

export class EventRegistry {
    private map: Map<string, saltyrtc.SaltyEventHandler[]>;

    constructor() {
        this.map = new Map();
    }

    /**
     * Register an event handler for the specified event(s).
     */
    public register(eventType: string | string[], handler: saltyrtc.SaltyEventHandler): void {
        if (typeof eventType === 'string') {
            this.set(eventType, handler);
        } else {
            for (let et of eventType) {
                this.set(et, handler);
            }
        }
    }

    /**
     * Unregister an event handler for the specified event(s).
     * If no handler is specified, all handlers for the specified event(s) are removed.
     */
    public unregister(eventType: string | string[], handler?: saltyrtc.SaltyEventHandler): void {
        if (typeof eventType === 'string') {
            // If the event does not exist, return
            if (!this.map.has(eventType)) {
                return;
            }
            // If no handler is specified, remove all corresponding events
            if (typeof handler === 'undefined') {
                this.map.delete(eventType);
            // Otherwise, remove the handler from the list if present
            } else {
                const list = this.map.get(eventType);
                const index = list.indexOf(handler);
                if (index !== -1) {
                    list.splice(index, 1);
                }
            }
        } else {
            for (let et of eventType) {
                this.unregister(et, handler);
            }
        }
    }

    /**
     * Store a single event handler in the map.
     */
    private set(key: string, value: saltyrtc.SaltyEventHandler) {
        if (this.map.has(key)) {
            const list = this.map.get(key);
            if (list.indexOf(value) === -1) {
                list.push(value);
            }
        } else {
            this.map.set(key, [value]);
        }
    }

    /**
     * Return all event handlers for the specified event(s).
     *
     * The return value is always an array. If the event does not exist, the
     * array will be empty.
     *
     * Even if a handler is registered for multiple events, it is only returned once.
     */
    public get(eventType: string | string[]): saltyrtc.SaltyEventHandler[] {
        const handlers: saltyrtc.SaltyEventHandler[] = [];
        if (typeof eventType === 'string') {
            if (this.map.has(eventType)) {
                handlers.push.apply(handlers, this.map.get(eventType));
            }
        } else {
            for (let et of eventType) {
                for (let handler of this.get(et)) {
                    if (handlers.indexOf(handler) === -1) {
                        handlers.push(handler);
                    }
                }
            }
        }
        return handlers;
    }
}
