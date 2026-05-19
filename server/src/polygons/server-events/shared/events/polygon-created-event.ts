import {Event} from "./event";

import {Subjects} from "./subjects";

export interface Point {

    x: number;

    y: number;
}

export interface PolygonCreatedData {

    id: string;

    name: string;

    points: Point[];
}

export interface PolygonCreatedEvent
    extends Event {

    subject: typeof Subjects.PolygonCreated;

    data: PolygonCreatedData;
}