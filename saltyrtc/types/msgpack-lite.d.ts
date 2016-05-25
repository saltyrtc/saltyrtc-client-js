declare var msgpack: MsgPackStatic;

interface MsgPackStatic {
    encode(data: Object): Uint8Array;
    decode(data: Uint8Array | number[]): Object;
}
