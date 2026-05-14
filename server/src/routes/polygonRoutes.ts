import express from 'express';

import { z } from 'zod';

import { PolygonModel } from '../models/polygonModel';

import { config } from '../config';
import { sleep } from '../utils/sleep';

type PolygonRecord = {
  _id: unknown;
  name: string;
  points: number[][];
};

type PolygonEvent =
  | {
      type: 'created';
      polygon: {
        id: string;
        name: string;
        points: number[][];
      };
    }
  | {
      type: 'deleted';
      id: string;
    };

export type PolygonModelLike = {
  find: () => {
    lean: () => Promise<PolygonRecord[]>;
  };
  create: (polygon: {
    name: string;
    points: number[][];
  }) => Promise<PolygonRecord>;
  findByIdAndDelete: (
    id: string,
  ) => Promise<unknown>;
};

type PolygonRouterOptions = {
  polygonModel?: PolygonModelLike;
  wait?: (ms: number) => Promise<unknown>;
};

const createPolygonSchema = z.object({
  name: z.string().min(1),

  points: z.array(z.array(z.number())).min(3),
});

function serializePolygon(polygon: PolygonRecord) {
  return {
    id: String(polygon._id),

    name: polygon.name,

    points: polygon.points,
  };
}

export function createPolygonRouter({
  polygonModel,
  wait = sleep,
}: PolygonRouterOptions = {}) {
  const router = express.Router();
  const model =
    polygonModel ??
    (PolygonModel as unknown as PolygonModelLike);
  const eventClients = new Set<express.Response>();

  function publish(event: PolygonEvent) {
    const payload = `data: ${JSON.stringify(event)}\n\n`;

    for (const client of eventClients) {
      client.write(payload);
    }
  }

  router.get('/', async (_, response) => {
    await wait(config.apiRequestDelayMs);

    const polygons = await model.find().lean();

    response.json(polygons.map(serializePolygon));
  });

  router.get('/events', (request, response) => {
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.flushHeaders?.();

    response.write(': connected\n\n');

    eventClients.add(response);

    request.on('close', () => {
      eventClients.delete(response);
      response.end();
    });
  });

  router.post('/', async (request, response) => {
    await wait(config.apiRequestDelayMs);

    const parsed = createPolygonSchema.parse(
      request.body,
    );

    const polygon = await model.create({
      name: parsed.name,
      points: parsed.points,
    });

    const serializedPolygon = serializePolygon(polygon);

    publish({
      type: 'created',
      polygon: serializedPolygon,
    });

    response.json(serializedPolygon);
  });

  router.delete('/:id', async (request, response) => {
    await wait(config.apiRequestDelayMs);

    await model.findByIdAndDelete(
      request.params.id,
    );

    publish({
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
