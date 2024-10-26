import { MutableRefObject, RefObject } from 'react';
import { Anchor, Point } from './types';

export const drawPath = (
	canvasRef: RefObject<HTMLCanvasElement>,
	context: CanvasRenderingContext2D,
	anchors: Anchor[],
) => {
	if (anchors.length < 2) return;

	context.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

	context.strokeStyle = 'black';

	context.beginPath();

	anchors.forEach((anchor, i) => {
		if (i === 0) {
			context.moveTo(anchor.point.x, anchor.point.y);
			return;
		}
		const prevAnchor = anchors[i - 1];
		// Draw a cubic Bezier curve
		context.bezierCurveTo(
			// fallback to original point if no handle
			prevAnchor?.handle1?.x ?? prevAnchor.point.x,
			prevAnchor?.handle1?.y ?? prevAnchor.point.y,
			// fallback to original point if no handle
			anchor?.handle2?.x ?? anchor.point.x,
			anchor?.handle2?.y ?? anchor.point.y,
			anchor.point.x,
			anchor.point.y,
		);
	});
	context.stroke();
};

export const drawPoints = (
	canvasRef: MutableRefObject<HTMLCanvasElement>,
	anchors: Anchor[],
) => {
	const context = canvasRef.current?.getContext('2d');
	if (!context) return;

	// Draw each point with a highlight
	context.fillStyle = 'black';
	anchors.forEach(({ point }) => {
		context.beginPath();
		context.arc(point.x, point.y, 2, 0, 2 * Math.PI);
		context.fill();
	});
};

export const drawHandles = (
	canvasRef: MutableRefObject<HTMLCanvasElement>,
	handle1: Point,
	handle2: Point,
	lastAnchor: Anchor | null = null,
) => {
	const context = canvasRef.current?.getContext('2d');
	if (!context) return;

	context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
	context.fillStyle = 'white';
	context.strokeStyle = 'black';

	drawLine(context, handle1, handle2);

	context.beginPath();
	context.arc(handle1.x, handle1.y, 3, 0, 2 * Math.PI);
	context.fill();
	context.stroke();

	context.beginPath();
	context.arc(handle2.x, handle2.y, 3, 0, 2 * Math.PI);
	context.fill();
	context.stroke();

	// high last anchor adjacent handle
	if (lastAnchor && lastAnchor.handle1) {
		drawLine(context, lastAnchor.handle1, lastAnchor.point);

		context.beginPath();
		context.arc(lastAnchor.handle1.x, lastAnchor.handle1.y, 3, 0, 2 * Math.PI);
		context.fill();
		context.stroke();
	}
};

export const drawLine = (
	context: CanvasRenderingContext2D,
	point1: Point,
	point2: Point,
) => {
	console.log('draw line');
	context.beginPath();
	context.moveTo(point1.x, point1.y);
	context.lineTo(point2.x, point2.y);
	context.stroke();
};

export const clearCanvas = (canvasRef: RefObject<HTMLCanvasElement>) => {
	if (!canvasRef) return;

	const context = canvasRef.current?.getContext('2d');
	if (context && canvasRef.current) {
		context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
	}
};
