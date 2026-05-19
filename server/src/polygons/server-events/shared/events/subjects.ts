export const Subjects = {
    PolygonCreated: "polygon.created",
    PolygonDeleted: "polygon.deleted"
} as const;

export type Subject =
    typeof Subjects[keyof typeof Subjects];