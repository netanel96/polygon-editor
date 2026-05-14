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

export function createPolygonRouter({
  polygonModel,
  wait = sleep,
}: PolygonRouterOptions = {}) {
  const router = express.Router();
  const model =
    polygonModel ??
    (PolygonModel as unknown as PolygonModelLike);

  router.get('/', async (_, response) => {
    await wait(config.apiRequestDelayMs);

    const polygons = await model.find().lean();

    response.json(
      polygons.map(polygon => ({
        id: polygon._id,

        name: polygon.name,

        points: polygon.points,
      })),
    );
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

    response.json({
      id: polygon._id,

      name: polygon.name,

      points: polygon.points,
    });
  });

  router.delete('/:id', async (request, response) => {
    await wait(config.apiRequestDelayMs);

    await model.findByIdAndDelete(
      request.params.id,
    );

    response.json({
      success: true,
    });
  });

  return router;
}

export default createPolygonRouter();
