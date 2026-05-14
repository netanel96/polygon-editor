import { Polygon } from '../types/polygon';

export function upsertPolygon(
  polygons: Polygon[],
  nextPolygon: Polygon,
) {
  const existingPolygon = polygons.some(
    polygon => polygon.id === nextPolygon.id,
  );

  if (!existingPolygon) {
    return [...polygons, nextPolygon];
  }

  return polygons.map(polygon =>
    polygon.id === nextPolygon.id ? nextPolygon : polygon,
  );
}

export function removePolygonById(
  polygons: Polygon[],
  id: string,
) {
  return polygons.filter(polygon => polygon.id !== id);
}

export function replaceOptimisticPolygon(
  polygons: Polygon[],
  optimisticId: string,
  savedPolygon: Polygon,
) {
  return upsertPolygon(
    removePolygonById(polygons, optimisticId),
    savedPolygon,
  );
}
