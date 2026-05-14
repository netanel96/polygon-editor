import { Point, Polygon } from '../types/polygon';

import type { ServerPolygon } from './polygonDto';

export function toClientPolygon(
  serverPolygon: ServerPolygon,
): Polygon {
  return {
    id: serverPolygon.id,
    name: serverPolygon.name,
    points: serverPolygon.points.map(([x, y]) => ({
      x,
      y,
    })),
  };
}

export function toServerPoints(
  points: Point[],
): number[][] {
  return points.map(point => [point.x, point.y]);
}
