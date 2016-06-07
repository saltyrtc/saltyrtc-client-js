import test_utils from "./utils.spec";
import test_keystore from "./keystore.spec";
import test_nonce from "./nonce.spec";
import test_cookie from "./cookie.spec";
import test_signaling from "./signaling.spec";
import test_eventregistry from "./eventregistry.spec";
import test_integration from "./integration.spec";

var counter = 1;
beforeEach(() => console.info('------ TEST', counter++, 'BEGIN ------'));

test_utils();
test_keystore();
test_nonce();
test_cookie();
test_signaling();
test_eventregistry();
test_integration();
