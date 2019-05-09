import '../node_modules/babel-es6-polyfill/browser-polyfill';

// Apply log groups to Jasmine tests
type Callback = (...args: any) => any;
// @ts-ignore
const jasmineIt = window.it;
// @ts-ignore
window.it = (description: string, callback: Callback, ...args) => {
    const handler = (invoker: () => any) => {
        console.group(spec.getFullName());
        let result: any;
        try {
            result = invoker();
        } catch (error) {
            console.groupEnd();
            throw error;
        }
        if (result instanceof Promise) {
            result
                .then(() => console.groupEnd())
                .catch(() => console.groupEnd());
        } else {
            console.groupEnd();
        }
        return result;
    };
    let wrapper: Callback;
    if (callback.length > 0) {
        wrapper = (done: any) => handler(() => callback(done));
    } else {
        wrapper = () => handler(() => callback());
    }
    const spec = jasmineIt(description, wrapper, ...args);
    return spec;
};

import test_client from './client.spec';
import test_cookie from './cookie.spec';
import test_csn from './csn.spec';
import test_eventregistry from './eventregistry.spec';
import test_handoverstate from './handoverstate.spec';
import test_integration from './integration.spec';
import test_keystore from './keystore.spec';
import test_nonce from './nonce.spec';
import test_utils from './utils.spec';

test_client();
test_cookie();
test_csn();
test_eventregistry();
test_handoverstate();
test_integration();
test_keystore();
test_nonce();
test_utils();
