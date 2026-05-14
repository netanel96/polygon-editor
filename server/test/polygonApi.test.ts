import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { describe, it } from 'node:test';

import { createApp } from '../src/app';
import type { PolygonModelLike } from '../src/routes/polygonRoutes';

type PolygonInput = {
  name: string;
  points: number[][];
};

type TestPolygonModel = PolygonModelLike & {
  createdPolygons: PolygonInput[];
  deletedIds: string[];
};

function createTestPolygonModel(options?: {
  findResult?: Array<{
    _id: string;
    name: string;
    points: number[][];
  }>;
  findError?: Error;
  createError?: Error;
  deleteError?: Error;
}): TestPolygonModel {
  const createdPolygons: PolygonInput[] = [];
  const deletedIds: string[] = [];

  return {
    createdPolygons,
    deletedIds,
    find: () => ({
      lean: async () => {
        if (options?.findError) {
          throw options.findError;
        }

        return options?.findResult ?? [];
      },
    }),
    create: async polygon => {
      if (options?.createError) {
        throw options.createError;
      }

      createdPolygons.push(polygon);

      return {
        _id: 'created-id',
        name: polygon.name,
        points: polygon.points,
      };
    },
    findByIdAndDelete: async id => {
      if (options?.deleteError) {
        throw options.deleteError;
      }

      deletedIds.push(id);

      return null;
    },
  };
}

async function withApi(
  polygonModel: PolygonModelLike,
  run: (baseUrl: string) => Promise<void>,
) {
  const app = createApp({
    polygonModel,
    wait: async () => undefined,
  });

  const server = createServer(app);

  await new Promise<void>(resolve => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const { port } = server.address() as AddressInfo;

  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await closeServer(server);
  }
}

async function closeServer(server: Server) {
  await new Promise<void>((resolve, reject) => {
    server.close(error => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

describe('polygon API', () => {
  it('returns saved polygons from MongoDB', async () => {
    const polygonModel = createTestPolygonModel({
      findResult: [
        {
          _id: 'polygon-1',
          name: 'Triangle',
          points: [
            [0, 0],
            [10, 0],
            [0, 10],
          ],
        },
      ],
    });

    await withApi(polygonModel, async baseUrl => {
      const response = await fetch(`${baseUrl}/polygons`);

      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), [
        {
          id: 'polygon-1',
          name: 'Triangle',
          points: [
            [0, 0],
            [10, 0],
            [0, 10],
          ],
        },
      ]);
    });
  });

  it('allows browser preflight requests from local client origins', async () => {
    const polygonModel = createTestPolygonModel();

    await withApi(polygonModel, async baseUrl => {
      const response = await fetch(`${baseUrl}/polygons`, {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://127.0.0.1:5173',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers':
            'content-type',
        },
      });

      assert.equal(response.status, 204);
      assert.equal(
        response.headers.get('access-control-allow-origin'),
        'http://127.0.0.1:5173',
      );
    });
  });

  it('creates a polygon and returns the created record', async () => {
    const polygonModel = createTestPolygonModel();
    const polygon = {
      name: 'Square',
      points: [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
      ],
    };

    await withApi(polygonModel, async baseUrl => {
      const response = await fetch(`${baseUrl}/polygons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(polygon),
      });

      assert.equal(response.status, 200);
      assert.deepEqual(polygonModel.createdPolygons, [
        polygon,
      ]);
      assert.deepEqual(await response.json(), {
        id: 'created-id',
        name: 'Square',
        points: polygon.points,
      });
    });
  });

  it('rejects invalid polygon input without creating a record', async () => {
    const polygonModel = createTestPolygonModel();

    await withApi(polygonModel, async baseUrl => {
      const response = await fetch(`${baseUrl}/polygons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: '',
          points: [
            [0, 0],
            [10, 0],
          ],
        }),
      });

      const body = (await response.json()) as {
        error: string;
      };

      assert.equal(response.status, 400);
      assert.match(body.error, /String must contain/);
      assert.deepEqual(polygonModel.createdPolygons, []);
    });
  });

  it('rejects malformed JSON requests', async () => {
    const polygonModel = createTestPolygonModel();

    await withApi(polygonModel, async baseUrl => {
      const response = await fetch(`${baseUrl}/polygons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{',
      });

      const body = (await response.json()) as {
        error: string;
      };

      assert.equal(response.status, 400);
      assert.match(body.error, /JSON/);
      assert.deepEqual(polygonModel.createdPolygons, []);
    });
  });

  it('deletes a polygon by id', async () => {
    const polygonModel = createTestPolygonModel();

    await withApi(polygonModel, async baseUrl => {
      const response = await fetch(
        `${baseUrl}/polygons/polygon-1`,
        {
          method: 'DELETE',
        },
      );

      assert.equal(response.status, 200);
      assert.deepEqual(polygonModel.deletedIds, [
        'polygon-1',
      ]);
      assert.deepEqual(await response.json(), {
        success: true,
      });
    });
  });

  it('returns a safe 500 response when MongoDB reads fail', async () => {
    const polygonModel = createTestPolygonModel({
      findError: new Error('database is down'),
    });

    await withApi(polygonModel, async baseUrl => {
      const response = await fetch(`${baseUrl}/polygons`);

      assert.equal(response.status, 500);
      assert.deepEqual(await response.json(), {
        error: 'Internal server error',
      });
    });
  });

  it('returns a safe 500 response when MongoDB creates fail', async () => {
    const polygonModel = createTestPolygonModel({
      createError: new Error('insert failed'),
    });

    await withApi(polygonModel, async baseUrl => {
      const response = await fetch(`${baseUrl}/polygons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Triangle',
          points: [
            [0, 0],
            [10, 0],
            [0, 10],
          ],
        }),
      });

      assert.equal(response.status, 500);
      assert.deepEqual(await response.json(), {
        error: 'Internal server error',
      });
    });
  });

  it('returns a safe 500 response when MongoDB deletes fail', async () => {
    const polygonModel = createTestPolygonModel({
      deleteError: new Error('delete failed'),
    });

    await withApi(polygonModel, async baseUrl => {
      const response = await fetch(
        `${baseUrl}/polygons/polygon-1`,
        {
          method: 'DELETE',
        },
      );

      assert.equal(response.status, 500);
      assert.deepEqual(await response.json(), {
        error: 'Internal server error',
      });
    });
  });
});
