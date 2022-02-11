// tslint:disable:file-header
// tslint:disable:no-reference
/// <reference path='jasmine.d.ts' />
/// <reference path='../saltyrtc-client.d.ts' />

import { EventRegistry } from '../src/eventregistry';

export default () => { describe('eventregistry', function() {

    describe('EventRegistry', function() {

        let registry: EventRegistry;
        let handler1;
        let handler2;

        beforeEach(() => {
            registry = new EventRegistry();
            handler1 = () => { console.log('Event 1 occurred'); };
            handler2 = () => { console.log('Event 2 occurred'); };
        });

        it('can register a new event', () => {
            expect(registry.map.get('boo')).toBeUndefined();
            registry.register('boo', handler1);
            const registered: saltyrtc.SaltyRTCEventHandler[] = registry.map.get('boo');
            expect(registered.length).toEqual(1);
            expect(registered[0]).toBe(handler1);
        });

        it('can register multiple handlers', () => {
            expect(registry.map.get('boo')).toBeUndefined();
            registry.register('boo', handler1);
            registry.register('boo', handler2);
            const registered: saltyrtc.SaltyRTCEventHandler[] = registry.map.get('boo');
            expect(registered.length).toEqual(2);
            expect(registered).toContain(handler1);
            expect(registered).toContain(handler2);
        });

        it('can register multiple events', () => {
            expect(registry.map.get('boo')).toBeUndefined();
            expect(registry.map.get('far')).toBeUndefined();
            registry.register('boo', handler1);
            registry.register('boo', handler2);
            registry.register('far', handler1);
            expect(registry.map.get('boo').length).toEqual(2);
            expect(registry.map.get('far').length).toEqual(1);
        });

        it('can retrieve handlers correctly', () => {
            registry.map.set('boo', [handler1]);
            registry.map.set('far', [handler1, handler2]);
            expect(registry.get('boo')).toEqual([handler1]);
            expect(registry.get('far')).toEqual([handler1, handler2]);
            expect(registry.get(['boo', 'far'])).toEqual([handler1, handler2]);
            expect(registry.get('baz')).toEqual([]);
            expect(registry.get(['boo', 'far', 'baz'])).toEqual([handler1, handler2]);
        });

        it('can unregister handlers correctly', () => {
            registry.map.set('boo', [handler1]);
            registry.map.set('far', [handler1, handler2]);

            // Unknown handler
            registry.unregister('far', () => { /* do nothing */ });
            expect(registry.get('far')).toEqual([handler1, handler2]);

            // Unknown event
            registry.unregister('baz', handler1);
            expect(registry.get('boo')).toEqual([handler1]);
            expect(registry.get('far')).toEqual([handler1, handler2]);

            // Success
            registry.unregister('boo', handler1);
            expect(registry.get('boo')).toEqual([]);
            registry.unregister('far', handler2);
            expect(registry.get('far')).toEqual([handler1]);

            // Clear
            registry.map.set('far', [handler1, handler2]);
            registry.unregister('far');
            expect(registry.get('far')).toEqual([]);

            // Multiple events
            registry.map.set('boo', [handler1]);
            registry.map.set('far', [handler1, handler2]);
            registry.unregister(['boo', 'far', 'baz'], handler1);
            expect(registry.get('boo')).toEqual([]);
            expect(registry.get('far')).toEqual([handler2]);
        });

        it('can unregister all handlers', () => {
            registry.map.set('boo', [handler1]);
            registry.map.set('far', [handler1, handler2]);
            expect(registry.get('boo')).toEqual([handler1]);
            expect(registry.get('far')).toEqual([handler1, handler2]);

            registry.unregisterAll();

            expect(registry.get('boo')).toEqual([]);
            expect(registry.get('far')).toEqual([]);
        });

    });

}); };
