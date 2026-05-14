import { useRef, useState } from 'react';

import { Point } from '../types/polygon';

export function useActivePolygon() {
  const pointsRef = useRef<Point[]>([]);
  const [pointCount, setPointCount] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);

  function start() {
    pointsRef.current = [];
    setPointCount(0);
    setIsDrawing(true);
  }

  function addPoint(point: Point) {
    pointsRef.current.push(point);
    setPointCount(pointsRef.current.length);
  }

  function clear() {
    pointsRef.current = [];
    setPointCount(0);
    setIsDrawing(false);
  }

  function consumePoints() {
    const points = [...pointsRef.current];

    clear();

    return points;
  }

  return {
    pointsRef,
    pointCount,
    isDrawing,
    start,
    addPoint,
    clear,
    consumePoints,
  };
}
