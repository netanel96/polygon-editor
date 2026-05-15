import type { MutableRefObject } from 'react';

import { Point, Polygon } from '../../types/polygon';

import { DynamicPolygonCanvas } from './DynamicPolygonCanvas';
import { StaticPolygonCanvas } from './StaticPolygonCanvas';
import styles from './PolygonCanvas.module.css';

type Props = {
  activePointCount: number;
  polygons: Polygon[];
  hoveredDeleteId: string | null;
  activePolygonRef: MutableRefObject<Point[]>;
  isDrawing: boolean;
  addPoint: (point: Point) => void;
  startDrawing: () => void;
  finishPolygon: () => void;
};

export function PolygonCanvas({
  activePointCount,
  polygons,
  hoveredDeleteId,
  activePolygonRef,
  isDrawing,
  addPoint,
  startDrawing,
  finishPolygon,
}: Props) {
  return (
    <div className={styles.stage}>
      <StaticPolygonCanvas
        polygons={polygons}
        hoveredDeleteId={hoveredDeleteId}
      />

      <DynamicPolygonCanvas
        activePointCount={activePointCount}
        activePolygonRef={activePolygonRef}
        isDrawing={isDrawing}
        addPoint={addPoint}
        startDrawing={startDrawing}
        finishPolygon={finishPolygon}
      />
    </div>
  );
}
