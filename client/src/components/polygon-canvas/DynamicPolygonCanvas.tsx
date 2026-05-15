import type {PointerEvent,} from 'react';
import {useEffect, useRef,} from 'react';
import { observer } from 'mobx-react-lite';

import {Point} from '../../types/polygon';
import { usePolygonEditorStore } from '../../stores';
import {setupHiDPICanvas} from '../../utils/canvas';
import {drawPolygon} from '../../utils/geometry';
import {CANVAS_HEIGHT, CANVAS_WIDTH,} from './canvasConstants';
import styles from './PolygonCanvas.module.css';

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

export const DynamicPolygonCanvas = observer(
    function DynamicPolygonCanvas() {
    const editor = usePolygonEditorStore();
    const { activePolygon } = editor;
    const canvasRef =
        useRef<HTMLCanvasElement | null>(null);

    function draw() {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (!canvas || !context) {
            return;
        }

        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        if (activePolygon.points.length === 0) {
            return;
        }

        drawPolygon(context, activePolygon.points, {
            strokeStyle: '#ffcc00',
            fillStyle: 'rgba(255,204,0,0.12)',
        });

        for (const point of activePolygon.points) {
            drawPoint(context, point);
        }
    }

    function handlePointerDown(
        event: PointerEvent<HTMLCanvasElement>,
    ) {
        if (event.detail === 2) {
            return;
        }

        if (!activePolygon.isDrawing) {
            editor.startDrawing();
        }

        editor.addPoint(getCanvasPoint(event));
        requestAnimationFrame(draw);
    }

    function handleDoubleClick() {
        if (activePolygon.isDrawing) {
            void editor.finishPolygon();
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
    }, [activePolygon.pointCount, activePolygon.isDrawing]);

    return (
        <canvas
            ref={canvasRef}
            className={styles.dynamicCanvas}
            onPointerDown={handlePointerDown}
            onDoubleClick={handleDoubleClick}
        />
    );
});
