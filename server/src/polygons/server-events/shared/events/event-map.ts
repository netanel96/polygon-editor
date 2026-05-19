import {Subjects} from "./subjects";
import {PolygonDto} from "../../../domain";

export interface EventMap {

    [Subjects.PolygonCreated]:
        PolygonDto;
    [Subjects.PolygonDeleted]:
        string;
}