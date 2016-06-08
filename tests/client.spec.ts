/// <reference path="jasmine.d.ts" />

import { sleep } from "./utils";
import { SaltyRTC } from "../saltyrtc/client";
import { KeyStore } from "../saltyrtc/keystore";

export default () => { describe('client', () => {

    describe('SaltyRTC', () => {

        describe('events', () => {

            beforeEach(() => {
                this.sc = new SaltyRTC(new KeyStore(), 'localhost');
            });

            it('can emit events', async (done) => {
                this.sc.on('connected', () => {
                    expect(true).toBe(true);
                    done();
                });
                this.sc.emit({type: 'connected'});
            });

            it('only calls handlers for specified events', async (done) => {
                let counter = 0;
                this.sc.on(['connected', 'data'], () => {
                    counter += 1;
                });
                this.sc.emit({type: 'connected'});
                this.sc.emit({type: 'data'});
                this.sc.emit({type: 'connection-error'});
                this.sc.emit({type: 'connected'});
                await sleep(100);
                expect(counter).toEqual(3);
                done();
            });

            it('can call multiple handlers', async (done) => {
                let counter = 0;
                let handler1 = () => {counter += 1;};
                let handler2 = () => {counter += 1;};
                this.sc.on(['connected', 'data'], handler1);
                this.sc.on(['connected'], handler2);
                this.sc.emit({type: 'connected'});
                this.sc.emit({type: 'data'});
                await sleep(100);
                expect(counter).toEqual(3);
                done();
            });

            it('can cancel handlers', async (done) => {
                let counter = 0;
                let handler = () => {counter += 1;};
                this.sc.on(['data', 'connected'], handler);
                this.sc.emit({type: 'connected'});
                this.sc.emit({type: 'data'});
                this.sc.off('data', handler);
                this.sc.emit({type: 'connected'});
                this.sc.emit({type: 'data'});
                await sleep(100);
                expect(counter).toEqual(3);
                done();
            });

            it('can register one-time handlers', async (done) => {
                let counter = 0;
                let handler = () => {counter += 1;};
                this.sc.once('data', handler);
                this.sc.emit({type: 'data'});
                this.sc.emit({type: 'data'});
                await sleep(100);
                expect(counter).toEqual(1);
                done();
            });

            it('can register one-time handlers that throw', async (done) => {
                let counter = 0;
                let handler = () => {counter += 1; throw 'oh noes';};
                this.sc.once('data', handler);
                this.sc.emit({type: 'data'});
                this.sc.emit({type: 'data'});
                await sleep(100);
                expect(counter).toEqual(1);
                done();
            });

        });

    });

}); }
