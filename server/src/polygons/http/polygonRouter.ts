import express from 'express';

import { sleep } from '../../utils/sleep';
import type { PolygonRepository } from '../domain';
import {
  ConnectionBackedPolygonEventBroker,
  PolygonConnectionStore,
  type PolygonEventBroker,
} from '../events';
import {
  createDefaultPolygonRepository,
  MongoosePolygonRepository,
  type PolygonModelLike,
} from '../persistence';

import { PolygonHandlers } from './PolygonHandlers';

export type { PolygonModelLike };

type PolygonRouterOptions = {
  connections?: PolygonConnectionStore;
  eventBroker?: PolygonEventBroker;
  polygonModel?: PolygonModelLike;
  polygonRepository?: PolygonRepository;
  wait?: (ms: number) => Promise<unknown>;
};

export function createPolygonRouter(
  options: PolygonRouterOptions = {},
) {
  const router = express.Router();
  const connections =
    options.connections ?? new PolygonConnectionStore();
  const polygonRepository =
    options.polygonRepository ??
    (options.polygonModel
      ? new MongoosePolygonRepository(options.polygonModel)
      : createDefaultPolygonRepository());
  const eventBroker =
    options.eventBroker ??
    new ConnectionBackedPolygonEventBroker(connections);
  const handlers = new PolygonHandlers({
    connections,
    eventBroker,
    polygonRepository,
    wait: options.wait ?? sleep,
  });

  router.get('/', handlers.listPolygons);
  router.get(
    '/events',
    handlers.addPolygonEventConnection,
  );
  router.post('/', handlers.createPolygon);
  router.delete('/:id', handlers.deletePolygon);

  return router;
}

export default createPolygonRouter();
