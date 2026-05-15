import { makeAutoObservable } from 'mobx';

import { Point } from '../types/polygon';

export class ActivePolygonStore {
  points: Point[] = [];
  isDrawing = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get pointCount() {
    return this.points.length;
  }

  start() {
    this.points = [];
    this.isDrawing = true;
  }

  addPoint(point: Point) {
    this.points.push(point);
  }

  clear() {
    this.points = [];
    this.isDrawing = false;
  }
}
