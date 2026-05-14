import { useEffect, useRef, useState } from 'react';

import {
  createPolygon,
  deletePolygon,
  fetchPolygons,
  subscribeToPolygonChanges,
} from '../api/polygonApi';

import { Point, Polygon } from '../types/polygon';

export function usePolygonEditor() {
  const [polygons, setPolygons] = useState<Polygon[]>([]);

  const [hoveredDeleteId, setHoveredDeleteId] =
    useState<string | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const activePolygonRef = useRef<Point[]>([]);

  const [activePointCount, setActivePointCount] =
    useState(0);

  function clearError() {
    setError(null);
  }

  function upsertPolygon(nextPolygon: Polygon) {
    setPolygons(prev => {
      const existingIndex = prev.findIndex(
        polygon => polygon.id === nextPolygon.id,
      );

      if (existingIndex === -1) {
        return [...prev, nextPolygon];
      }

      return prev.map(polygon =>
        polygon.id === nextPolygon.id
          ? nextPolygon
          : polygon,
      );
    });
  }

  async function loadPolygons() {
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
  }

  useEffect(() => {
    loadPolygons();
  }, []);

  useEffect(() => {
    return subscribeToPolygonChanges({
      onCreate: upsertPolygon,
      onDelete: id => {
        setPolygons(prev =>
          prev.filter(polygon => polygon.id !== id),
        );
      },
    });
  }, []);

  function startDrawing() {
    activePolygonRef.current = [];

    setActivePointCount(0);

    setIsDrawing(true);
  }

  function addPoint(point: Point) {
    activePolygonRef.current.push(point);

    setActivePointCount(activePolygonRef.current.length);
  }

  function clearEditedPolygon() {
    activePolygonRef.current = [];

    setActivePointCount(0);
    setIsDrawing(false);
    setError(null);
  }

  function clearLoadedPolygons() {
    setPolygons([]);
    setHoveredDeleteId(null);
    setError(null);
  }

  async function finishPolygon() {
    const points = [...activePolygonRef.current];

    if (points.length < 3) {
      const remainingPointCount = 3 - points.length;

      setError(
        `Add ${remainingPointCount} more point${
          remainingPointCount === 1 ? '' : 's'
        } to finish this polygon.`,
      );

      return;
    }

    const optimisticPolygon: Polygon = {
      id: `temp-${crypto.randomUUID()}`,
      name: `Polygon ${polygons.length + 1}`,
      points,
      pending: true,
    };

    setPolygons(prev => [...prev, optimisticPolygon]);

    activePolygonRef.current = [];

    setActivePointCount(0);

    setIsDrawing(false);

    try {
      setError(null);

      const createdPolygon =
        await createPolygon(optimisticPolygon);

      setPolygons(prev => {
        const withoutOptimistic = prev.filter(
          polygon => polygon.id !== optimisticPolygon.id,
        );
        const existingSaved = withoutOptimistic.some(
          polygon => polygon.id === createdPolygon.id,
        );

        if (existingSaved) {
          return withoutOptimistic.map(polygon =>
            polygon.id === createdPolygon.id
              ? createdPolygon
              : polygon,
          );
        }

        return [...withoutOptimistic, createdPolygon];
      });
    } catch {
      setPolygons(prev =>
        prev.filter(
          polygon => polygon.id !== optimisticPolygon.id,
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
      prev.filter(polygon => polygon.id !== id),
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
    activePolygonRef,
    isDrawing,
    activePointCount,
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
