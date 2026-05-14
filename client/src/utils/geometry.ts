import { Point } from '../types/polygon';

export function drawPolygon(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  options?: {
    strokeStyle?: string;
    fillStyle?: string;
    lineWidth?: number;
  },
) {
  if (points.length === 0) {
    return;
  }

  ctx.beginPath();

  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.closePath();

  ctx.strokeStyle = options?.strokeStyle ?? '#00e0ff';
  ctx.lineWidth = options?.lineWidth ?? 2;

  ctx.stroke();

  if (options?.fillStyle) {
    ctx.fillStyle = options.fillStyle;
    ctx.fill();
  }
}