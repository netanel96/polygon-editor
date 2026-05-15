import type { Response } from 'express';

import type { PolygonEvent } from '../domain';
import type {
  PolygonConnectionStore,
  PolygonEventConnection,
} from '../events';

function writeSseHeaders(response: Response) {
  response.setHeader('Content-Type', 'text/event-stream');
  response.setHeader('Cache-Control', 'no-cache');
  response.setHeader('Connection', 'keep-alive');
  response.flushHeaders?.();
  response.write(': connected\n\n');
}

function formatSseEvent(event: PolygonEvent) {
  return `data: ${JSON.stringify(event)}\n\n`;
}

function createSsePolygonConnection(
  response: Response,
): PolygonEventConnection {
  writeSseHeaders(response);

  return {
    send(event) {
      response.write(formatSseEvent(event));
    },
  };
}

export function addSseConnection(
  connections: PolygonConnectionStore,
  response: Response,
) {
  return connections.addConnection(
    createSsePolygonConnection(response),
  );
}
