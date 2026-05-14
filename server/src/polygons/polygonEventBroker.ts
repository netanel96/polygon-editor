import type { Response } from 'express';

import type { PolygonEvent } from './polygonTypes';

export type PolygonEventBroker = {
  subscribe: (response: Response) => () => void;
  publish: (event: PolygonEvent) => void;
};

export class SsePolygonEventBroker
  implements PolygonEventBroker
{
  private readonly clients = new Set<Response>();

  subscribe(response: Response) {
    this.clients.add(response);

    return () => {
      this.clients.delete(response);
      response.end();
    };
  }

  publish(event: PolygonEvent) {
    const payload = `data: ${JSON.stringify(event)}\n\n`;

    for (const client of this.clients) {
      client.write(payload);
    }
  }
}
