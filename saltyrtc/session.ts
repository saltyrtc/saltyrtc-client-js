/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path="types/angular.d.ts" />
/// <reference path="utils.ts" />

angular.module('saltyrtc.services').factory('Session', [
    '$log', ($log) => new Session($log)
]);

class Session {
    private $log: angular.ILogService;
    private _id: string = null;

    constructor($log: angular.ILogService) {
        this.$log = $log;
    }

    get id(): string {
        return this._id;
    }

    new(): void {
        this.$log.debug('Starting new session');
        this._id = randomString();
    }
}
