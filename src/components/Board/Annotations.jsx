import { squareToPosition } from "../../utils/pieces";
import "./Annotations.css";

const ARROW_WIDTH = 0.15;
const HEAD_LENGTH = 0.6;
const HEAD_HALF_WIDTH = 0.28;
const START_GAP = 0.2;
const TIP_GAP = 0.1;
const CIRCLE_RADIUS = 0.44;
const CIRCLE_WIDTH = 0.08;

function center(square, flipped) {
  const { row, col } = squareToPosition(square);
  return {
    x: (flipped ? 7 - col : col) + 0.5,
    y: (flipped ? 7 - row : row) + 0.5,
  };
}

function Circle({ square, flipped }) {
  const { x, y } = center(square, flipped);
  return (
    <circle
      cx={x}
      cy={y}
      r={CIRCLE_RADIUS}
      fill="none"
      stroke="currentColor"
      strokeWidth={CIRCLE_WIDTH}
    />
  );
}

function Arrow({ from, to, flipped }) {
  const a = center(from, flipped);
  const b = center(to, flipped);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;

  const start = { x: a.x + ux * START_GAP, y: a.y + uy * START_GAP };
  const tip = { x: b.x - ux * TIP_GAP, y: b.y - uy * TIP_GAP };
  const base = { x: tip.x - ux * HEAD_LENGTH, y: tip.y - uy * HEAD_LENGTH };

  const px = -uy * HEAD_HALF_WIDTH;
  const py = ux * HEAD_HALF_WIDTH;

  return (
    <>
      <line
        x1={start.x}
        y1={start.y}
        x2={base.x}
        y2={base.y}
        stroke="currentColor"
        strokeWidth={ARROW_WIDTH}
      />
      <polygon
        fill="currentColor"
        points={`${tip.x},${tip.y} ${base.x + px},${base.y + py} ${base.x - px},${base.y - py}`}
      />
    </>
  );
}

export default function Annotations({ annotations, drawing, flipped }) {
  const items = drawing
    ? [...annotations, { ...drawing, preview: true }]
    : annotations;

  return (
    <svg className="board-annotations" viewBox="0 0 8 8" aria-hidden="true">
      {items.map(({ from, to, preview }) => (
        <g
          key={`${from}-${to}${preview ? "-preview" : ""}`}
          opacity={preview ? 0.55 : 0.85}
        >
          {from === to ? (
            <Circle square={from} flipped={flipped} />
          ) : (
            <Arrow from={from} to={to} flipped={flipped} />
          )}
        </g>
      ))}
    </svg>
  );
}
