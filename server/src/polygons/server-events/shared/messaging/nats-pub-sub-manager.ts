import {connect, NatsConnection} from "nats";

import {Subject} from "../events/subjects";

import {EventMap} from "../events/event-map";


import {IPubSubManager} from "./pub-sub-manager.interface";
import {decode, encode} from "../nats/codecs";
import {config} from "../../../../config";
import {logger} from "../../../../utils/logger";

export class NatsPubSubManager
    implements IPubSubManager {

    private connection?: NatsConnection;


    async connect(): Promise<void> {
        logger.info("connecting to nats on url:" + `${config.natsUrl}`);
        try {
            this.connection =
                await connect({
                    servers: config.natsUrl
                });

            logger.info(
                "connected to nats"
            );
        } catch (error) {
            logger.warning('could not connect to nats server. error:' + `${error}`)
        }
    }

    async disconnect(): Promise<void> {

        await this.connection?.close();
    }

    publish<TSubject extends Subject>(
        subject: TSubject,
        data: EventMap[TSubject]
    ): void {

        if (!this.connection) {
            logger.warning(
                "not connected to nats"
            );
            return;
        }

        this.connection.publish(
            subject,
            encode(data)
        );
    }

    subscribe<TSubject extends Subject>(
        subject: TSubject,
        onMessage: (
            data: EventMap[TSubject]
        ) => Promise<void> | void
    ): void {

        if (!this.connection) {

            logger.warning(
                "not connected to nats"
            );
            return;
        }

        const subscription =
            this.connection.subscribe(
                subject
            );

        this.handleSubscription(
            subscription,
            onMessage
        );
    }

    private async handleSubscription<
        TSubject extends Subject
    >(
        subscription: AsyncIterable<{
            data: Uint8Array;
        }>,
        onMessage: (
            data: EventMap[TSubject]
        ) => Promise<void> | void
    ): Promise<void> {

        for await (
            const message of subscription
            ) {

            const data =
                decode<EventMap[TSubject]>(
                    message.data
                );

            await onMessage(data);
        }
    }
}