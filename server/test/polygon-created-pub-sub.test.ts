import test from "node:test";
import assert from "node:assert/strict";
import {Subjects} from "../src/polygons/server-events/shared/events/subjects";
import {NatsPubSubManager} from "../src/polygons/server-events/shared/messaging/nats-pub-sub-manager";
import {PolygonDto} from "../src/polygons/domain";

test("polygon.created pub/sub works", async () => {
    const publisher = new NatsPubSubManager();

    const subscriber = new NatsPubSubManager();

    await publisher.connect();

    await subscriber.connect();

    const eventData: PolygonDto = {
        id: "polygon-1",

        name: "triangle",

        points: [
            [0, 0], [10, 0], [5, 10]
        ],
    };

    const receivedPromise = new Promise<PolygonDto>((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error("timeout"));
        }, 3000);

        subscriber.subscribe(
            Subjects.PolygonCreated,

            async (data) => {
                clearTimeout(timeout);

                resolve(data);
            },
        );
    });

    publisher.publish(
        Subjects.PolygonCreated,

        eventData,
    );

    const received = await receivedPromise;

    assert.deepEqual(received, eventData);

    await publisher.disconnect();

    await subscriber.disconnect();
});
