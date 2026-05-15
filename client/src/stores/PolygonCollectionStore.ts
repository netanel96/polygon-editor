import { makeAutoObservable } from 'mobx';

import { Polygon } from '../types/polygon';
import {
  removePolygonById,
  replaceOptimisticPolygon,
  upsertPolygon,
} from '../utils/polygonCollection';

export class PolygonCollectionStore {
  polygons: Polygon[] = [];
  hoveredDeleteId: string | null = null;
  loading = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get count() {
    return this.polygons.length;
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setPolygons(polygons: Polygon[]) {
    this.polygons = polygons;
  }

  appendPolygon(polygon: Polygon) {
    this.polygons = [...this.polygons, polygon];
  }

  upsertPolygon(polygon: Polygon) {
    this.polygons = upsertPolygon(this.polygons, polygon);
  }

  removePolygon(id: string) {
    this.polygons = removePolygonById(this.polygons, id);
  }

  replaceOptimisticPolygon(
    optimisticId: string,
    savedPolygon: Polygon,
  ) {
    this.polygons = replaceOptimisticPolygon(
      this.polygons,
      optimisticId,
      savedPolygon,
    );
  }

  setHoveredDeleteId(id: string | null) {
    this.hoveredDeleteId = id;
  }

  findPolygon(id: string) {
    return this.polygons.find(polygon => polygon.id === id);
  }

  clearLoaded() {
    this.polygons = [];
    this.hoveredDeleteId = null;
  }
}
