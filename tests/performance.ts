/**
 * Performance test entry point.
 *
 * Copyright (C) 2018-2022 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

import test_crypto from './performance/crypto.spec';

let counter = 1;
beforeEach(() => console.info('------ TEST', counter++, 'BEGIN ------'));

test_crypto();
