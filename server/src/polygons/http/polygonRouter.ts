import express from 'express';

import {sleep} from '../../utils/sleep';
import type {PolygonRepository} from '../domain';
import {PolygonConnectionStore, type PolygonEventBroker,} from '../events';
import {createDefaultPolygonRepository, MongoosePolygonRepository, type PolygonModelLike,} from '../persistence';

import {PolygonHandlers} from './PolygonHandlers';

export type { PolygonModelLike };

type PolygonRouterOptions = {
  connections: PolygonConnectionStore;
  eventBroker: PolygonEventBroker;
  polygonModel?: PolygonModelLike;
  polygonRepository?: PolygonRepository;
  wait?: (ms: number) => Promise<unknown>;
};

export function createPolygonRouter(
    options: PolygonRouterOptions,
) {
  const router = express.Router();
  const polygonRepository =
    options.polygonRepository ??
    (options.polygonModel
      ? new MongoosePolygonRepository(options.polygonModel)
      : createDefaultPolygonRepository());

  const handlers = new PolygonHandlers({
    connections: options.connections,
    eventBroker: options.eventBroker,
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