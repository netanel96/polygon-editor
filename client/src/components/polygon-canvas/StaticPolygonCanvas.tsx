import { useEffect, useRef } from 'react';

import { Polygon } from '../../types/polygon';
import { setupHiDPICanvas } from '../../utils/canvas';
import { drawPolygon } from '../../utils/geometry';

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
} from './canvasConstants';
import styles from './PolygonCanvas.module.css';

type Props = {
  hoveredDeleteId: string | null;
  polygons: Polygon[];
};

export function StaticPolygonCanvas({
  hoveredDeleteId,
  polygons,
}: Props) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(
    null,
  );

  function draw() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) {
      return;
    }

    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (imageRef.current) {
      context.drawImage(
        imageRef.current,
        0,
        0,
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
      );
    }

    for (const polygon of polygons) {
      const highlighted = hoveredDeleteId === polygon.id;

      drawPolygon(context, polygon.points, {
        strokeStyle: highlighted ? '#ffffff' : '#00e0ff',
        fillStyle: 'rgba(0,224,255,0.15)',
        lineWidth: highlighted ? 4 : 2,
      });
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    setupHiDPICanvas(canvas, CANVAS_WIDTH, CANVAS_HEIGHT);

    const image = new Image();

    image.src = 'https://picsum.photos/1920/1080';
    image.onload = () => {
      imageRef.current = image;
      draw();
    };
  }, []);

  useEffect(() => {
    draw();
  }, [polygons, hoveredDeleteId]);

  return (
    <canvas ref={canvasRef} className={styles.canvas} />
  );
}
