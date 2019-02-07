// tslint:disable:file-header
// tslint:disable:no-reference
/// <reference path='jasmine.d.ts' />
/// <reference path='../saltyrtc-client.d.ts' />

import { EventRegistry } from '../src/eventregistry';

export default () => { describe('eventregistry', function() {

    describe('EventRegistry', function() {

        beforeEach(() => {
            this.registry = new EventRegistry();
            this.handler1 = () => { console.log('Event 1 occurred'); };
            this.handler2 = () => { console.log('Event 2 occurred'); };
        });

        it('can register a new event', () => {
            expect(this.registry.map.get('boo')).toBeUndefined();
            this.registry.register('boo', this.handler1);
            const registered: saltyrtc.SaltyRTCEventHandler[] = this.registry.map.get('boo');
            expect(registered.length).toEqual(1);
            expect(registered[0]).toBe(this.handler1);
        });

        it('can register multiple handlers', () => {
            expect(this.registry.map.get('boo')).toBeUndefined();
            this.registry.register('boo', this.handler1);
            this.registry.register('boo', this.handler2);
            const registered: saltyrtc.SaltyRTCEventHandler[] = this.registry.map.get('boo');
            expect(registered.length).toEqual(2);
            expect(registered).toContain(this.handler1);
            expect(registered).toContain(this.handler2);
        });

        it('can register multiple events', () => {
            expect(this.registry.map.get('boo')).toBeUndefined();
            expect(this.registry.map.get('far')).toBeUndefined();
            this.registry.register('boo', this.handler1);
            this.registry.register('boo', this.handler2);
            this.registry.register('far', this.handler1);
            expect(this.registry.map.get('boo').length).toEqual(2);
            expect(this.registry.map.get('far').length).toEqual(1);
        });

        it('can retrieve handlers correctly', () => {
            this.registry.map.set('boo', [this.handler1]);
            this.registry.map.set('far', [this.handler1, this.handler2]);
            expect(this.registry.get('boo')).toEqual([this.handler1]);
            expect(this.registry.get('far')).toEqual([this.handler1, this.handler2]);
            expect(this.registry.get(['boo', 'far'])).toEqual([this.handler1, this.handler2]);
            expect(this.registry.get('baz')).toEqual([]);
            expect(this.registry.get(['boo', 'far', 'baz'])).toEqual([this.handler1, this.handler2]);
        });

        it('can unregister handlers correctly', () => {
            this.registry.map.set('boo', [this.handler1]);
            this.registry.map.set('far', [this.handler1, this.handler2]);

            // Unknown handler
            this.registry.unregister('far', () => { /* do nothing */ });
            expect(this.registry.get('far')).toEqual([this.handler1, this.handler2]);

            // Unknown event
            this.registry.unregister('baz', this.handler1);
            expect(this.registry.get('boo')).toEqual([this.handler1]);
            expect(this.registry.get('far')).toEqual([this.handler1, this.handler2]);

            // Success
            this.registry.unregister('boo', this.handler1);
            expect(this.registry.get('boo')).toEqual([]);
            this.registry.unregister('far', this.handler2);
            expect(this.registry.get('far')).toEqual([this.handler1]);

            // Clear
            this.registry.map.set('far', [this.handler1, this.handler2]);
            this.registry.unregister('far');
            expect(this.registry.get('far')).toEqual([]);

            // Multiple events
            this.registry.map.set('boo', [this.handler1]);
            this.registry.map.set('far', [this.handler1, this.handler2]);
            this.registry.unregister(['boo', 'far', 'baz'], this.handler1);
            expect(this.registry.get('boo')).toEqual([]);
            expect(this.registry.get('far')).toEqual([this.handler2]);
        });

        it('can unregister all handlers', () => {
            this.registry.map.set('boo', [this.handler1]);
            this.registry.map.set('far', [this.handler1, this.handler2]);
            expect(this.registry.get('boo')).toEqual([this.handler1]);
            expect(this.registry.get('far')).toEqual([this.handler1, this.handler2]);

            this.registry.unregisterAll();

            expect(this.registry.get('boo')).toEqual([]);
            expect(this.registry.get('far')).toEqual([]);

        });

    });

}); };
