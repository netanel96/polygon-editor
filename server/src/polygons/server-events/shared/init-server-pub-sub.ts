import {serverPubSub} from "./messaging/pub-sub-manager.interface";
import type {PolygonEventBroker} from "../../events";

export const initServerPubSub = async () => {
    await serverPubSub.connect();
}

export const registerServerPubSubHandlers = (eventBroker: PolygonEventBroker) => {
    serverPubSub.subscribe('polygon.created', (polygon) =>
        eventBroker.publish({
            type: "created",
            polygon,
        })
    )
    serverPubSub.subscribe('polygon.deleted', (id) =>
        eventBroker.publish({
            type: "deleted",
            id,
        })
    )
}