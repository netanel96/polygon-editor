import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';

import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { createApp } from '../src/app';
import { config } from '../src/config';

dotenv.config();

function getIntegrationMongoUrl() {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error(
      'MONGO_URL is required for integration tests',
    );
  }

  const parsed = new URL(mongoUrl);
  const baseDatabase = parsed.pathname.replace(
    /^\//,
    '',
  );

  parsed.pathname = `/${baseDatabase || 'polygon-editor'}-integration-test`;

  return parsed.toString();
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

describe('polygon API MongoDB integration', () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    await mongoose.connect(getIntegrationMongoUrl());
    await mongoose.connection.dropDatabase();

    const app = createApp();

    server = createServer(app);

    await new Promise<void>(resolve => {
      server.listen(0, '127.0.0.1', resolve);
    });

    const { port } = server.address() as AddressInfo;

    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await closeServer(server);
  });

  it('creates, reads, and deletes polygons through real MongoDB', async () => {
    const polygon = {
      name: 'Mongo Triangle',
      points: [
        [0, 0],
        [20, 0],
        [0, 20],
      ],
    };

    const createResponse = await fetch(
      `${baseUrl}/polygons`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(polygon),
      },
    );

    assert.equal(createResponse.status, 200);

    const created = (await createResponse.json()) as {
      id: string;
      name: string;
      points: number[][];
    };

    assert.match(created.id, /^[a-f\d]{24}$/);
    assert.equal(created.name, polygon.name);
    assert.deepEqual(created.points, polygon.points);

    const listResponse = await fetch(
      `${baseUrl}/polygons`,
    );

    assert.equal(listResponse.status, 200);

    const polygons = (await listResponse.json()) as Array<{
      id: string;
      name: string;
      points: number[][];
    }>;

    assert.deepEqual(polygons, [created]);

    const deleteResponse = await fetch(
      `${baseUrl}/polygons/${created.id}`,
      {
        method: 'DELETE',
      },
    );

    assert.equal(deleteResponse.status, 200);
    assert.deepEqual(await deleteResponse.json(), {
      success: true,
    });

    const emptyListResponse = await fetch(
      `${baseUrl}/polygons`,
    );

    assert.equal(emptyListResponse.status, 200);
    assert.deepEqual(await emptyListResponse.json(), []);

    assert.equal(config.apiRequestDelayMs, 0);
  });
});
