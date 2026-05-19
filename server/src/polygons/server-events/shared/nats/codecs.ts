import {StringCodec} from "nats";

const sc = StringCodec();

export function encode(
    data: unknown
): Uint8Array {

    return sc.encode(
        JSON.stringify(data)
    );
}

export function decode<T>(
    data: Uint8Array
): T {

    return JSON.parse(
        sc.decode(data)
    ) as T;
}