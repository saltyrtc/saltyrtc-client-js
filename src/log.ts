/**
 * Copyright (C) 2016-2018 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/**
 * A console log wrapper obeying levels.
 */
export class Log implements saltyrtc.Log {
    private _level: saltyrtc.LogLevel;
    public debug: (message?: any, ...optionalParams: any[]) => void;
    public trace: (message?: any, ...optionalParams: any[]) => void;
    public info: (message?: any, ...optionalParams: any[]) => void;
    public warn: (message?: any, ...optionalParams: any[]) => void;
    public error: (message?: any, ...optionalParams: any[]) => void;
    public assert: (condition?: boolean, message?: string, ...data: any[]) => void;

    constructor(level: saltyrtc.LogLevel) {
        this.level = level;
    }

    public set level(level: saltyrtc.LogLevel) {
        // Set level
        this._level = level;

        // Reset all
        this.debug = this.noop;
        this.trace = this.noop;
        this.info = this.noop;
        this.warn = this.noop;
        this.error = this.noop;
        this.assert = this.noop;

        // Bind corresponding to level
        // noinspection FallThroughInSwitchStatementJS
        switch (level) {
            case 'debug':
                this.debug = console.debug;
                this.trace = console.trace;
            case 'info':
                this.info = console.info;
            case 'warn':
                this.warn = console.warn;
            case 'error':
                this.error = console.error;
                this.assert = console.assert;
            default:
                break;
        }
    }

    public get level(): saltyrtc.LogLevel {
        return this._level;
    }

    private noop(): void {
        // noop
    }
}
