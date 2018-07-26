import '../node_modules/babel-es6-polyfill/browser-polyfill';

import test_client from './client.spec';
import test_cookie from './cookie.spec';
import test_csn from './csn.spec';
import test_eventregistry from './eventregistry.spec';
import test_handoverstate from './handoverstate.spec';
import test_integration from './integration.spec';
import test_keystore from './keystore.spec';
import test_nonce from './nonce.spec';
import test_utils from './utils.spec';

let counter = 1;
beforeEach(() => console.info('------ TEST', counter++, 'BEGIN ------'));

test_client();
test_cookie();
test_csn();
test_eventregistry();
test_handoverstate();
test_integration();
test_keystore();
test_nonce();
test_utils();
