import express from 'express';

import { config } from '../config';
import {
  SsePolygonEventBroker,
  type PolygonEventBroker,
} from '../polygons/polygonEventBroker';
import {
  createDefaultPolygonRepository,
  MongoosePolygonRepository,
  type PolygonModelLike,
} from '../polygons/mongoosePolygonRepository';
import type { PolygonRepository } from '../polygons/polygonTypes';
import { createPolygonSchema } from '../polygons/polygonValidation';
import { sleep } from '../utils/sleep';

export type { PolygonModelLike };

type PolygonRouterOptions = {
  eventBroker?: PolygonEventBroker;
  polygonModel?: PolygonModelLike;
  polygonRepository?: PolygonRepository;
  wait?: (ms: number) => Promise<unknown>;
};

export function createPolygonRouter({
  eventBroker = new SsePolygonEventBroker(),
  polygonModel,
  polygonRepository,
  wait = sleep,
}: PolygonRouterOptions = {}) {
  const router = express.Router();
  const repository =
    polygonRepository ??
    (polygonModel
      ? new MongoosePolygonRepository(polygonModel)
      : createDefaultPolygonRepository());

  router.get('/', async (_, response) => {
    await wait(config.apiRequestDelayMs);

    response.json(await repository.findAll());
  });

  router.get('/events', (request, response) => {
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.flushHeaders?.();

    response.write(': connected\n\n');

    const unsubscribe = eventBroker.subscribe(response);

    request.on('close', () => {
      unsubscribe();
    });
  });

  router.post('/', async (request, response) => {
    await wait(config.apiRequestDelayMs);

    const parsed = createPolygonSchema.parse(
      request.body,
    );

    const polygon = await repository.create({
      name: parsed.name,
      points: parsed.points,
    });

    eventBroker.publish({
      type: 'created',
      polygon,
    });

    response.json(polygon);
  });

  router.delete('/:id', async (request, response) => {
    await wait(config.apiRequestDelayMs);

    await repository.deleteById(request.params.id);

    eventBroker.publish({
      type: 'deleted',
      id: request.params.id,
    });

    response.json({
      success: true,
    });
  });

  return router;
}

export default createPolygonRouter();
