/**
 * Convert an Uint8Array to a hex string.
 *
 * Example:
 *
 *   >>> u8aToHex(new Uint8Array([1, 255]))
 *   "01ff"
 */
function u8aToHex(array: Uint8Array): string {
    let results: string[] = [];
    array.forEach((arrayByte) => {
        results.push(arrayByte.toString(16).replace(/^([\da-f])$/, '0$1'));
    });
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
function hexToU8a(hexstring: string): Uint8Array {
    let array, i, j, k, ref;
    j = 0;
    array = new Uint8Array(hexstring.length / 2);
    for (i = k = 0, ref = hexstring.length; k <= ref; i = k += 2) {
        array[j++] = parseInt(hexstring.substr(i, 2), 16);
    }
    return array;
}


/**
 * Generate a random string.
 *
 * Based on http://stackoverflow.com/a/1349426/284318.
 */
function randomString(length=32, chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return str;
}
