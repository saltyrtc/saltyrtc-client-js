declare var msgpack: MsgPackStatic;

interface MsgPackCodecInit {
    preset?: boolean,
    safe?: boolean,
    useraw?: boolean,
    int64?: boolean,
    binarraybuffer?: boolean,
}

interface MsgPackCodec {}

interface MsgPackOptions {
    codec?: MsgPackCodec,
}

interface MsgPackStatic {
    createCodec(init: MsgPackCodecInit): MsgPackCodec;
    encode(data: Object, options?: MsgPackOptions): Uint8Array;
    decode(data: Uint8Array, options?: MsgPackOptions): Object;
}
