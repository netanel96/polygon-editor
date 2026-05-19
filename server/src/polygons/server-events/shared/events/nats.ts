import {connect, NatsConnection, StringCodec} from "nats";

export const sc = StringCodec();

let nc: NatsConnection;

export async function connectNats() {
    const address = "nats://localhost:4222"
    nc = await connect({
        servers: address
    });

    console.log("connected to nats server on `${address}`");

    return nc;
}

export function getNats() {
    if (!nc) {
        throw new Error("nats not connected");
    }

    return nc;
}
