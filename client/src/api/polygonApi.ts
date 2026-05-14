import { Polygon, Point } from '../types/polygon';

import { config } from '../config';

type ServerPolygon = {
  id: string;
  name: string;
  points: number[][];
};

type PolygonEvent =
  | {
      type: 'created';
      polygon: ServerPolygon;
    }
  | {
      type: 'deleted';
      id: string;
    };

type PolygonSubscriptionHandlers = {
  onCreate: (polygon: Polygon) => void;
  onDelete: (id: string) => void;
  onError?: () => void;
};

function toClientPolygon(serverPolygon: ServerPolygon): Polygon {
  return {
    id: serverPolygon.id,
    name: serverPolygon.name,
    points: serverPolygon.points.map(([x, y]) => ({
      x,
      y,
    })),
  };
}

function toServerPoints(points: Point[]): number[][] {
  return points.map(point => [point.x, point.y]);
}

export async function fetchPolygons(): Promise<Polygon[]> {
  const response = await fetch(`${config.apiUrl}/polygons`);

  if (!response.ok) {
    throw new Error('Failed to fetch polygons');
  }

  const data: ServerPolygon[] = await response.json();

  return data.map(toClientPolygon);
}

export async function createPolygon(
  polygon: Polygon,
): Promise<Polygon> {
  const response = await fetch(`${config.apiUrl}/polygons`, {
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

export async function deletePolygon(id: string) {
  const response = await fetch(`${config.apiUrl}/polygons/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete polygon');
  }
}

export function subscribeToPolygonChanges({
  onCreate,
  onDelete,
  onError,
}: PolygonSubscriptionHandlers) {
  const source = new EventSource(
    `${config.apiUrl}/polygons/events`,
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
