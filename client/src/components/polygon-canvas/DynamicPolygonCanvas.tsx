import {
  useEffect,
  useRef,
} from 'react';
import type {
  MutableRefObject,
  PointerEvent,
} from 'react';

import { Point } from '../../types/polygon';
import { setupHiDPICanvas } from '../../utils/canvas';
import { drawPolygon } from '../../utils/geometry';

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
} from './canvasConstants';
import styles from './PolygonCanvas.module.css';

type Props = {
  activePointCount: number;
  activePolygonRef: MutableRefObject<Point[]>;
  isDrawing: boolean;
  addPoint: (point: Point) => void;
  finishPolygon: () => void;
  startDrawing: () => void;
};

function drawPoint(
  context: CanvasRenderingContext2D,
  point: Point,
) {
  context.save();
  context.beginPath();
  context.arc(point.x, point.y, 6, 0, Math.PI * 2);
  context.fillStyle = '#ffcc00';
  context.shadowColor = '#ffcc00';
  context.shadowBlur = 10;
  context.fill();
  context.restore();
}

function getCanvasPoint(
  event: PointerEvent<HTMLCanvasElement>,
): Point {
  const rect = event.currentTarget.getBoundingClientRect();

  return {
    x:
      ((event.clientX - rect.left) / rect.width) *
      CANVAS_WIDTH,
    y:
      ((event.clientY - rect.top) / rect.height) *
      CANVAS_HEIGHT,
  };
}

export function DynamicPolygonCanvas({
  activePointCount,
  activePolygonRef,
  isDrawing,
  addPoint,
  finishPolygon,
  startDrawing,
}: Props) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  function draw() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) {
      return;
    }

    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (activePolygonRef.current.length === 0) {
      return;
    }

    drawPolygon(context, activePolygonRef.current, {
      strokeStyle: '#ffcc00',
      fillStyle: 'rgba(255,204,0,0.12)',
    });

    for (const point of activePolygonRef.current) {
      drawPoint(context, point);
    }
  }

  function handlePointerDown(
    event: PointerEvent<HTMLCanvasElement>,
  ) {
    if (event.detail === 2) {
      return;
    }

    if (!isDrawing) {
      startDrawing();
    }

    addPoint(getCanvasPoint(event));
    requestAnimationFrame(draw);
  }

  function handleDoubleClick() {
    if (isDrawing) {
      finishPolygon();
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      setupHiDPICanvas(canvas, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }, []);

  useEffect(() => {
    draw();
  }, [activePointCount, isDrawing]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.dynamicCanvas}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
    />
  );
}
