import { Polygon } from '../types/polygon';

import { config } from '../config';

import type { PolygonEvent, ServerPolygon } from './polygonDto';
import type {
  PolygonGateway,
  PolygonSubscriptionHandlers,
} from './polygonGateway';
import {
  toClientPolygon,
  toServerPoints,
} from './polygonMapper';

export class HttpPolygonGateway implements PolygonGateway {
  private readonly apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async fetchAll(): Promise<Polygon[]> {
    const response = await fetch(`${this.apiUrl}/polygons`);

    if (!response.ok) {
      throw new Error('Failed to fetch polygons');
    }

    const data: ServerPolygon[] = await response.json();

    return data.map(toClientPolygon);
  }

  async create(polygon: Polygon): Promise<Polygon> {
    const response = await fetch(`${this.apiUrl}/polygons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: polygon.name,
        points: toServerPoints(polygon.points),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create polygon');
    }

    const data: ServerPolygon = await response.json();

    return toClientPolygon(data);
  }

  async deleteById(id: string) {
    const response = await fetch(
      `${this.apiUrl}/polygons/${id}`,
      {
        method: 'DELETE',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to delete polygon');
    }
  }

  subscribe({
    onCreate,
    onDelete,
    onError,
  }: PolygonSubscriptionHandlers) {
    const source = new EventSource(
      `${this.apiUrl}/polygons/events`,
    );

    source.onmessage = event => {
      const data = JSON.parse(event.data) as PolygonEvent;

      if (data.type === 'created') {
        onCreate(toClientPolygon(data.polygon));
        return;
      }

      onDelete(data.id);
    };

    source.onerror = () => {
      onError?.();
    };

    return () => {
      source.close();
    };
  }
}

export const polygonGateway: PolygonGateway = new HttpPolygonGateway(
  config.apiUrl,
);
