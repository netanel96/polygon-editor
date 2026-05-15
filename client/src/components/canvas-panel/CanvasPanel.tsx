import type {MutableRefObject} from 'react';

import {Point, Polygon} from '../../types/polygon';
import {PolygonCanvas} from '../polygon-canvas';
import {Toolbar} from '../toolbar';

import styles from './CanvasPanel.module.css';

type Props = {
  activePointCount: number;
  activePolygonRef: MutableRefObject<Point[]>;
  hoveredDeleteId: string | null;
  isDrawing: boolean;
  loading: boolean;
  polygons: Polygon[];
  addPoint: (point: Point) => void;
  clearEditedPolygon: () => void;
  clearLoadedPolygons: () => void;
  finishPolygon: () => void;
  loadPolygons: () => void;
  startDrawing: () => void;
};

export function CanvasPanel({
  activePointCount,
  activePolygonRef,
  hoveredDeleteId,
  isDrawing,
  loading,
  polygons,
  addPoint,
  clearEditedPolygon,
  clearLoadedPolygons,
  finishPolygon,
  loadPolygons,
  startDrawing,
}: Props) {
  return (
    <main className={styles.panel}>
      <h1 className={styles.title}>Polygon Editor</h1>

      <Toolbar
        isDrawing={isDrawing}
        activePointCount={activePointCount}
        loading={loading}
        onFinish={finishPolygon}
        onClearEdit={clearEditedPolygon}
        onLoad={loadPolygons}
        onClearLoaded={clearLoadedPolygons}
      />

      <PolygonCanvas
        activePointCount={activePointCount}
        polygons={polygons}
        hoveredDeleteId={hoveredDeleteId}
        activePolygonRef={activePolygonRef}
        isDrawing={isDrawing}
        addPoint={addPoint}
        startDrawing={startDrawing}
        finishPolygon={finishPolygon}
      />
    </main>
  );
}
