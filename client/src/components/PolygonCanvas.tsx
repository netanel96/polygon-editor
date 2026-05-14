import { useEffect, useRef } from 'react';

import { Polygon, Point } from '../types/polygon';

import { drawPolygon } from '../utils/geometry';
import { setupHiDPICanvas } from '../utils/canvas';

type Props = {
  polygons: Polygon[];
  hoveredDeleteId: string | null;
  activePolygonRef: React.MutableRefObject<Point[]>;
  isDrawing: boolean;
  addPoint: (point: Point) => void;
  startDrawing: () => void;
  finishPolygon: () => void;
};

const WIDTH = 900;
const HEIGHT = 600;

export function PolygonCanvas({
  polygons,
  hoveredDeleteId,
  activePolygonRef,
  isDrawing,
  addPoint,
  startDrawing,
  finishPolygon,
}: Props) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const imageRef = useRef<HTMLImageElement | null>(
    null,
  );

  const framePendingRef = useRef(false);

  function scheduleDraw() {
    if (framePendingRef.current) {
      return;
    }

    framePendingRef.current = true;

    requestAnimationFrame(() => {
      framePendingRef.current = false;

      draw();
    });
  }

  function drawPoint(
    ctx: CanvasRenderingContext2D,
    point: Point,
  ) {
    ctx.save();

    ctx.beginPath();

    ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);

    ctx.fillStyle = '#ffcc00';

    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 10;

    ctx.fill();

    ctx.restore();
  }

  function draw() {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    if (imageRef.current) {
      ctx.drawImage(
        imageRef.current,
        0,
        0,
        WIDTH,
        HEIGHT,
      );
    }

    for (const polygon of polygons) {
      const highlighted =
        hoveredDeleteId === polygon.id;

      drawPolygon(ctx, polygon.points, {
        strokeStyle: highlighted
          ? '#ffffff'
          : '#00e0ff',

        fillStyle: 'rgba(0,224,255,0.15)',

        lineWidth: highlighted ? 4 : 2,
      });
    }

    if (activePolygonRef.current.length > 0) {
      drawPolygon(ctx, activePolygonRef.current, {
        strokeStyle: '#ffcc00',
        fillStyle: 'rgba(255,204,0,0.12)',
      });

      for (const point of activePolygonRef.current) {
        drawPoint(ctx, point);
      }
    }
  }

  function getCanvasPoint(
    event: React.PointerEvent<HTMLCanvasElement>,
  ): Point {
    const rect =
      event.currentTarget.getBoundingClientRect();

    return {
      x:
        ((event.clientX - rect.left) / rect.width) *
        WIDTH,

      y:
        ((event.clientY - rect.top) / rect.height) *
        HEIGHT,
    };
  }

  function handlePointerDown(
    event: React.PointerEvent<HTMLCanvasElement>,
  ) {
    if (event.detail === 2) {
      return;
    }

    const point = getCanvasPoint(event);

    if (!isDrawing) {
      startDrawing();
    }

    addPoint(point);

    scheduleDraw();
  }

  function handleDoubleClick() {
    if (!isDrawing) {
      return;
    }

    finishPolygon();
  }

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    setupHiDPICanvas(canvas, WIDTH, HEIGHT);

    const image = new Image();

    image.src = 'https://picsum.photos/1920/1080';

    image.onload = () => {
      imageRef.current = image;

      draw();
    };
  }, []);

  useEffect(() => {
    scheduleDraw();
  }, [polygons, hoveredDeleteId, isDrawing]);

  return (
    <canvas
      ref={canvasRef}
      className="editor-canvas"
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
    />
  );
}
