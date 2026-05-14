import { useEffect, useRef, useState } from 'react';

import {
  createPolygon,
  deletePolygon,
  fetchPolygons,
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

  function clearError() {
    setError(null);
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

  function startDrawing() {
    activePolygonRef.current = [];

    setIsDrawing(true);
  }

  function addPoint(point: Point) {
    activePolygonRef.current.push(point);
  }

  async function finishPolygon() {
    const points = [...activePolygonRef.current];

    if (points.length < 3) {
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

    setIsDrawing(false);

    try {
      setError(null);

      const createdPolygon =
        await createPolygon(optimisticPolygon);

      setPolygons(prev =>
        prev.map(polygon =>
          polygon.id === optimisticPolygon.id
            ? createdPolygon
            : polygon,
        ),
      );
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
    loading,
    error,
    startDrawing,
    addPoint,
    finishPolygon,
    removePolygon,
    loadPolygons,
    clearError,
  };
}
