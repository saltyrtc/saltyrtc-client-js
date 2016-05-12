/**
 * Convert an array to chunks.
 *
 * This is required for now as a workaround because the Chrome implementation
 * does not currently support sending messages larger than 16 KiB:
 * https://webrtc.org/web-apis/chrome/
 */
export class Chunkifier {
    private _array: Uint8Array;
    private _chunkSize: number;
    private _chunks: Uint8Array[] = null;

    constructor(array: Uint8Array, chunkSize: number) {
        this._array = array;
        this._chunkSize = chunkSize;
    }

    get chunks(): Uint8Array[] {
        return this._getChunks();
    }

    private _offset(index: number): number {
        return index * (this._chunkSize - 1);
    }

    private _hasNext(index: number): boolean {
        return this._offset(index) < this._array.length;
    }

    private _getChunks(): Uint8Array[] {
        // Generate chunks on demand
        if (this._chunks === null) {
            this._chunks = [];
            let index = 0;
            while (this._hasNext(index)) {
                // More chunks?
                let offset = this._offset(index);
                let length = Math.min(this._chunkSize, this._array.length + 1 - offset);
                let buffer = new ArrayBuffer(length);
                let view = new DataView(buffer);

                // Put more chunks indicator into buffer
                if (this._hasNext(index + 1)) {
                    view.setUint8(0, 1);
                } else {
                    view.setUint8(0, 0);
                }

                // Add array slice to buffer
                let array = new Uint8Array(buffer);
                let end = Math.min(this._offset(index + 1), this._array.length);
                let chunk = this._array.slice(offset, end);
                array.set(chunk, 1);

                // Add array to list of chunks
                this._chunks[index] = array;
                index += 1;
            }
        }
        return this._chunks;
    }
}


/**
 * Combine chunks into a single array.
 *
 * See `Chunkifier` doc comment for more information.
 */
export class Unchunkifier {
    private _events;
    private _chunks: Uint8Array[];
    private _length: number = 0;

    constructor(events) {
        this._events = events;
        this._reset();
    }

    /**
     * Add a chunk.
     */
    add(array: Uint8Array): void {
        if (array.length == 0) {
            return;
        }
        let view = new DataView(array.buffer);

        // Add to list
        this._chunks.push(array);
        this._length += (array.length - 1);

        // More chunks?
        let moreChunks = view.getUint8(0);
        if (moreChunks == 0) {
            this._done();
        } else if (moreChunks != 1) {
            throw 'Invalid chunk received: ' + moreChunks;
        }
    }

    /**
     * Reset the unchunkifier data.
     */
    private _reset(): void {
        this._chunks = [];
        this._length = 0;
    }

    private _done() {
        let message = this._merge();
        this._reset();
        this._events.onCompletedMessage(message);
    }

    private _merge() {
        let array = new Uint8Array(this._length);

        // Add all chunks apart from the first byte
        let offset = 0;
        for (var chunk of this._chunks) {
            array.set(chunk.slice(1), offset);
            offset += chunk.length - 1;
        }

        return array;
    }
}
