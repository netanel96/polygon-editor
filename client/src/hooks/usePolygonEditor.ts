import { useCallback, useEffect, useState } from 'react';

import {
  createPolygon,
  deletePolygon,
  fetchPolygons,
  subscribeToPolygonChanges,
} from '../api/polygonApi';

import { Point, Polygon } from '../types/polygon';
import {
  removePolygonById,
  replaceOptimisticPolygon,
  upsertPolygon,
} from '../utils/polygonCollection';

import { useActivePolygon } from './useActivePolygon';

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

export function usePolygonEditor() {
  const [polygons, setPolygons] = useState<Polygon[]>([]);

  const [hoveredDeleteId, setHoveredDeleteId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const activePolygon = useActivePolygon();

  function clearError() {
    setError(null);
  }

  const loadPolygons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchPolygons();

      setPolygons(data);
    } catch {
      setError('Failed to load polygons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPolygons();
  }, [loadPolygons]);

  useEffect(() => {
    return subscribeToPolygonChanges({
      onCreate: polygon => {
        setPolygons(prev => upsertPolygon(prev, polygon));
      },
      onDelete: id => {
        setPolygons(prev => removePolygonById(prev, id));
      },
    });
  }, []);

  function startDrawing() {
    activePolygon.start();
  }

  function addPoint(point: Point) {
    activePolygon.addPoint(point);
  }

  function clearEditedPolygon() {
    activePolygon.clear();
    setError(null);
  }

  function clearLoadedPolygons() {
    setPolygons([]);
    setHoveredDeleteId(null);
    setError(null);
  }

  async function finishPolygon() {
    const points = [...activePolygon.pointsRef.current];

    if (points.length < 3) {
      setError(getRemainingPointMessage(points.length));

      return;
    }

    const optimisticPolygon = createOptimisticPolygon(
      polygons.length + 1,
      points,
    );

    setPolygons(prev => [...prev, optimisticPolygon]);

    activePolygon.clear();

    try {
      setError(null);

      const createdPolygon =
        await createPolygon(optimisticPolygon);

      setPolygons(prev => {
        return replaceOptimisticPolygon(
          prev,
          optimisticPolygon.id,
          createdPolygon,
        );
      });
    } catch {
      setPolygons(prev =>
        removePolygonById(
          prev,
          optimisticPolygon.id,
        ),
      );

      setError('Failed to save polygon');
    }
  }

  async function removePolygon(id: string) {
    const polygonToDelete = polygons.find(
      polygon => polygon.id === id,
    );

    if (!polygonToDelete || polygonToDelete.pending) {
      return;
    }

    setPolygons(prev =>
      removePolygonById(prev, id),
    );

    try {
      setError(null);

      await deletePolygon(id);
    } catch {
      setPolygons(prev => [...prev, polygonToDelete]);

      setError('Failed to delete polygon');
    }
  }

  return {
    polygons,
    hoveredDeleteId,
    setHoveredDeleteId,
    activePolygonRef: activePolygon.pointsRef,
    isDrawing: activePolygon.isDrawing,
    activePointCount: activePolygon.pointCount,
    loading,
    error,
    startDrawing,
    addPoint,
    finishPolygon,
    clearEditedPolygon,
    clearLoadedPolygons,
    removePolygon,
    loadPolygons,
    clearError,
  };
}
