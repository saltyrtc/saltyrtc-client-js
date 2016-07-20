/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/**
 * Convert an Uint8Array to a hex string.
 *
 * Example:
 *
 *   >>> u8aToHex(new Uint8Array([1, 255]))
 *   "01ff"
 */
export function u8aToHex(array: Uint8Array): string {
    const results: string[] = [];
    for (let arrayByte of array) {
        results.push(arrayByte.toString(16).replace(/^([\da-f])$/, '0$1'));
    }
    return results.join('');
}


/**
 * Convert a hexadecimal string to a Uint8Array.
 *
 * Example:
 *
 *   >>> hexToU8a("01ff")
 *   [1, 255]
 */
export function hexToU8a(hexstring: string): Uint8Array {
    let array, i, j, k, ref;
    j = 0;

    // If number of characters is odd, add padding
    if (hexstring.length % 2 == 1) {
        hexstring = '0' + hexstring;
    }

    array = new Uint8Array(hexstring.length / 2);
    for (i = k = 0, ref = hexstring.length; k <= ref; i = k += 2) {
        array[j++] = parseInt(hexstring.substr(i, 2), 16);
    }
    return array;
}

/**
 * Convert a byte to its hex string representation.
 */
export function byteToHex(value: number) {
    return '0x' + ('00' + value.toString(16)).substr(-2);
}


/**
 * Generate a random string.
 *
 * Based on http://stackoverflow.com/a/1349426/284318.
 */
export function randomString(length=32, chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return str;
}

/**
 * Generate a random 32 bit unsigned integer.
 */
export function randomUint32(): number {
    const crypto = window.crypto || (window as any).msCrypto;
    return crypto.getRandomValues(new Uint32Array(1))[0];
}


/**
 * Concatenate multiple Uint8Array objects.
 *
 * Based on http://www.2ality.com/2015/10/concatenating-typed-arrays.html
 */
export function concat(...arrays: Uint8Array[]): Uint8Array {
    let totalLength = 0;
    for (let arr of arrays) {
        totalLength += arr.length;
    }
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (let arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}


/**
 * Wait for a condition.
 *
 * @param test a function that tests whether the condition has been met.
 * @param delay_ms wait duration between retries.
 * @param retries number of times to retry.
 * @param success the success callback.
 * @param error the error callback.
 */
export function waitFor(test: () => boolean, delay_ms: number, retries: number, success: () => any, error: () => any) {
    // If condition is not yet met, decrease number of retries and retry
    if (test() === false) {
        if (retries === 1) { // This is the last retry
            error();
        } else {
            setTimeout(() => waitFor(test, delay_ms, retries - 1, success, error), delay_ms);
        }
        return;
    }

    // Otherwise, run success callback.
    success();
}
