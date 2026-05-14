import { Polygon } from '../types/polygon';

export type PolygonSubscriptionHandlers = {
  onCreate: (polygon: Polygon) => void;
  onDelete: (id: string) => void;
  onError?: () => void;
};

export type PolygonGateway = {
  fetchAll: () => Promise<Polygon[]>;
  create: (polygon: Polygon) => Promise<Polygon>;
  deleteById: (id: string) => Promise<void>;
  subscribe: (
    handlers: PolygonSubscriptionHandlers,
  ) => () => void;
};
