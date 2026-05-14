export type ServerPolygon = {
  id: string;
  name: string;
  points: number[][];
};

export type PolygonEvent =
  | {
      type: 'created';
      polygon: ServerPolygon;
    }
  | {
      type: 'deleted';
      id: string;
    };
