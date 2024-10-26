import {
	useState,
	useRef,
	useEffect,
	MouseEvent,
	MutableRefObject,
	RefObject,
} from 'react';
import { Anchor, Point } from './types';
import {
	drawPath,
	drawHandles,
	drawPoints,
	drawLine,
	clearCanvas,
} from './utils';

import './App.scss';

const config = {
	dimension: {
		width: 800,
		height: 600,
	},
};

export default function App() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const handleCanvasRef = useRef<HTMLCanvasElement>(null);
	const previewCanvasRef = useRef<HTMLCanvasElement>(null);

	const [anchors, setAnchors] = useState<Anchor[]>([]);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const [mousePosition, setMousePosition] = useState<Point | null>(null);
	const [currentAnchor, setCurrentAnchor] = useState<Anchor | null>(null);

	const onMouseDown = (e: MouseEvent) => {
		setIsDragging(true);
		const { offsetX: x, offsetY: y } = e.nativeEvent;
		const anchor: Point = {
			x,
			y,
		};

		setAnchors([...anchors, { point: anchor }]);
	};

	const onDrag = (e: MouseEvent) => {
		// only run when mouse is dragging
		if (!isDragging) return;

		const { offsetX: x, offsetY: y } = e.nativeEvent;
		const handle1 = { x, y };

		const lastAnchor = anchors[anchors.length - 1];
		const lastAnchorPoint = lastAnchor.point;
		const handle2 = {
			x: 2 * lastAnchorPoint.x - handle1.x,
			y: 2 * lastAnchorPoint.y - handle1.y,
		};

		setAnchors(prevAnchors => {
			const updatedAnchors = [...prevAnchors];
			updatedAnchors[updatedAnchors.length - 1] = {
				...lastAnchor,
				handle1,
				handle2,
			};
			return updatedAnchors;
		});
	};

	const onMouseUp = () => {
		setIsDragging(false);
	};

	const onMouseMove = ({
		nativeEvent: { offsetX: x, offsetY: y },
	}: MouseEvent) => {
		// update mouse position
		setMousePosition({ x, y });
	};

	useEffect(() => {
		if (!canvasRef || !canvasRef.current) return;
		const canvas = canvasRef as RefObject<HTMLCanvasElement>; // assert type here because TS is not picking up the null check above

		const context = canvasRef.current.getContext('2d');
		if (!context) return;

		drawPath(canvas, context, anchors);

		if (!handleCanvasRef || !handleCanvasRef.current) return;
		const handleCanvas = handleCanvasRef as MutableRefObject<HTMLCanvasElement>; // assert type here because TS is not picking up the null check above

		const handleCanvasContext = handleCanvas.current.getContext('2d');
		if (!handleCanvasContext || !anchors.length) return;

		drawPoints(handleCanvas, anchors);
		const lastAnchor = anchors[anchors.length - 1];
		const prevAnchor = anchors?.[anchors.length - 2] ?? null;
		// for now are are requiring both handle but curve can be drawn with one handle as well.
		// we can revisit this later
		if (!lastAnchor.handle1 || !lastAnchor.handle2) return;

		drawHandles(
			handleCanvas,
			lastAnchor.handle1,
			lastAnchor.handle2,
			prevAnchor,
		);
	}, [anchors]);

	useEffect(() => {
		if (!previewCanvasRef || !previewCanvasRef.current || !mousePosition)
			return;
		const canvas = previewCanvasRef as MutableRefObject<HTMLCanvasElement>; // assert type here because TS is not picking up the null check above

		const context = canvas.current.getContext('2d');
		if (!context || !anchors.length) return;

		const lastAnchor = anchors[anchors.length - 1];
		context.clearRect(0, 0, canvas.current.width, canvas.current.height);

		drawLine(context, lastAnchor.point, mousePosition);
	}, [mousePosition, anchors]);

	// useEffect(() => {
	// 	if (!handleCanvasRef || !handleCanvasRef.current) return;
	// 	const canvas = handleCanvasRef as MutableRefObject<HTMLCanvasElement>; // assert type here because TS is not picking up the null check above

	// 	const context = handleCanvasRef.current.getContext('2d');
	// 	if (!context || !anchors.length) return;
	// 	drawPoints(canvas, anchors);
	// 	const lastAnchor = anchors[anchors.length - 1];

	// 	// for now are are requiring both handle but curve can be drawn with one handle as well.
	// 	// we can revisit this later
	// 	if (!lastAnchor.handle1 || !lastAnchor.handle2) return;

	// 	drawHandles(canvas, lastAnchor.handle1, lastAnchor.handle2);
	// }, [anchors]);

	const onClickClear = () => {
		clearCanvas(canvasRef);
		clearCanvas(previewCanvasRef);
		clearCanvas(handleCanvasRef);
		setAnchors([]);
	};

	return (
		<div
			id="container"
			style={{ width: config.dimension.width, height: config.dimension.height }}
		>
			<div>
				<div id="toolbar">
					<button onClick={onClickClear}>Clear</button>
					<p>Simple pen tool!</p>
				</div>
			</div>
			<canvas
				ref={previewCanvasRef}
				onMouseMoveCapture={onMouseMove}
				onMouseDown={onMouseDown}
				onMouseMove={onDrag}
				onMouseUp={onMouseUp}
				width={config.dimension.width}
				height={config.dimension.height}
				style={{ zIndex: 3 }}
			/>
			<canvas
				ref={handleCanvasRef}
				width={config.dimension.width}
				height={config.dimension.height}
				style={{ zIndex: 2 }}
			/>
			<canvas
				ref={canvasRef}
				width={config.dimension.width}
				height={config.dimension.height}
				style={{ zIndex: 0 }}
			/>
		</div>
	);
}
