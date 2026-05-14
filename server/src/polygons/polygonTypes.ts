export type PolygonRecord = {
  _id: unknown;
  name: string;
  points: number[][];
};

export type PolygonDto = {
  id: string;
  name: string;
  points: number[][];
};

export type PolygonInput = {
  name: string;
  points: number[][];
};

export type PolygonEvent =
  | {
      type: 'created';
      polygon: PolygonDto;
    }
  | {
      type: 'deleted';
      id: string;
    };

export type PolygonRepository = {
  findAll: () => Promise<PolygonDto[]>;
  create: (polygon: PolygonInput) => Promise<PolygonDto>;
  deleteById: (id: string) => Promise<void>;
};
