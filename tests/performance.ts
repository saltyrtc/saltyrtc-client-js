import "../node_modules/babel-es6-polyfill/browser-polyfill";

import test_crypto from "./performance/crypto.spec";

var counter = 1;
beforeEach(() => console.info('------ TEST', counter++, 'BEGIN ------'));

test_crypto();
