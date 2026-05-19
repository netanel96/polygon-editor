import {Subject} from "./subjects";

export interface Event {

    subject: Subject;

    data: unknown;
}