import {EventMap} from "../events/event-map";

import {Subject} from "../events/subjects";
import {NatsPubSubManager} from "./nats-pub-sub-manager";

export interface IPublisher {
    publish<TSubject extends Subject>(
        subject: TSubject,
        data: EventMap[TSubject],
    ): Promise<void> | void;
}

export interface IPubSubManager extends IPublisher {
    connect(): Promise<void>;

    subscribe<TSubject extends Subject>(
        subject: TSubject,
        onMessage: (data: EventMap[TSubject]) => Promise<void> | void,
    ): Promise<void> | void;
}

export const serverPubSub: IPubSubManager = new NatsPubSubManager();
