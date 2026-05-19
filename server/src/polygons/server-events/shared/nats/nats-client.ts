import {connect, NatsConnection} from "nats";
import {config} from "../../../../config";

export async function createNatsConnection():
    Promise<NatsConnection> {
    console.log("connecting to nats on url:" + `${config.natsUrl}`)
    return connect({
        servers: config.natsUrl
    });
}