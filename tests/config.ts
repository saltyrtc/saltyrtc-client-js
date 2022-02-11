/**
 * Test config.
 *
 * Copyright (C) 2016-2022 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

export class Config {
    // Unit test configuration
    public static SALTYRTC_HOST = 'localhost';
    public static SALTYRTC_PORT = 8765;
    public static SALTYRTC_SERVER_PUBLIC_KEY = '09a59a5fa6b45cb07638a3a6e347ce563a948b756fd22f9527465f7c79c2a864';
    public static RUN_LOAD_TESTS = false;

    // Performance test configuration
    public static CRYPTO_ITERATIONS = 4096;
}
