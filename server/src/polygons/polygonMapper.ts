import type { PolygonDto, PolygonRecord } from './polygonTypes';

export function toPolygonDto(
  polygon: PolygonRecord,
): PolygonDto {
  return {
    id: String(polygon._id),
    name: polygon.name,
    points: polygon.points,
  };
}
