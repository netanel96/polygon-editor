import { makeAutoObservable } from 'mobx';

import { polygonGateway } from '../api/polygonApi';
import { Point, Polygon } from '../types/polygon';

import { ActivePolygonStore } from './ActivePolygonStore';
import { EditorFeedbackStore } from './EditorFeedbackStore';
import { PolygonCollectionStore } from './PolygonCollectionStore';

function getRemainingPointMessage(pointCount: number) {
  const remainingPointCount = 3 - pointCount;

  return `Add ${remainingPointCount} more point${
    remainingPointCount === 1 ? '' : 's'
  } to finish this polygon.`;
}

function createOptimisticPolygon(
  index: number,
  points: Point[],
): Polygon {
  return {
    id: `temp-${crypto.randomUUID()}`,
    name: `Polygon ${index}`,
    points,
    pending: true,
  };
}

export class PolygonEditorStore {
  readonly activePolygon = new ActivePolygonStore();
  readonly feedback = new EditorFeedbackStore();
  readonly polygonCollection = new PolygonCollectionStore();

  private unsubscribeFromPolygonChanges:
    | (() => void)
    | null = null;

  constructor() {
    makeAutoObservable(
      this,
      {
        activePolygon: false,
        feedback: false,
        polygonCollection: false,
      },
      { autoBind: true },
    );
  }

  get error() {
    return this.feedback.error;
  }

  init() {
    void this.loadPolygons();

    this.unsubscribeFromPolygonChanges = polygonGateway.subscribe({
      onCreate: polygon => {
        this.polygonCollection.upsertPolygon(polygon);
      },
      onDelete: id => {
        this.polygonCollection.removePolygon(id);
      },
    });

    return this.unsubscribeFromPolygonChangesEvents;
  }

  unsubscribeFromPolygonChangesEvents() {
    this.unsubscribeFromPolygonChanges?.();
    this.unsubscribeFromPolygonChanges = null;
  }

  clearError() {
    this.feedback.clearError();
  }

  async loadPolygons() {
    try {
      this.polygonCollection.setLoading(true);
      this.feedback.clearError();

      const polygons = await polygonGateway.fetchAll();

      this.polygonCollection.setPolygons(polygons);
    } catch {
      this.feedback.setError('Failed to load polygons');
    } finally {
      this.polygonCollection.setLoading(false);
    }
  }

  startDrawing() {
    this.activePolygon.start();
  }

  addPoint(point: Point) {
    this.activePolygon.addPoint(point);
  }

  clearEditedPolygon() {
    this.activePolygon.clear();
    this.feedback.clearError();
  }

  clearLoadedPolygons() {
    this.polygonCollection.clearLoaded();
    this.feedback.clearError();
  }

  async finishPolygon() {
    const points = [...this.activePolygon.points];

    if (points.length < 3) {
      this.feedback.setError(
        getRemainingPointMessage(points.length),
      );

      return;
    }

    const optimisticPolygon = createOptimisticPolygon(
      this.polygonCollection.count + 1,
      points,
    );

    this.polygonCollection.appendPolygon(optimisticPolygon);
    this.activePolygon.clear();

    try {
      this.feedback.clearError();

      const createdPolygon =
        await polygonGateway.create(optimisticPolygon);

      this.polygonCollection.replaceOptimisticPolygon(
        optimisticPolygon.id,
        createdPolygon,
      );
    } catch {
      this.polygonCollection.removePolygon(
        optimisticPolygon.id,
      );
      this.feedback.setError('Failed to save polygon');
    }
  }

  async removePolygon(id: string) {
    const polygonToDelete =
      this.polygonCollection.findPolygon(id);

    if (!polygonToDelete || polygonToDelete.pending) {
      return;
    }

    this.polygonCollection.removePolygon(id);

    try {
      this.feedback.clearError();

      await polygonGateway.deleteById(id);
    } catch {
      this.polygonCollection.appendPolygon(polygonToDelete);
      this.feedback.setError('Failed to delete polygon');
    }
  }
}
