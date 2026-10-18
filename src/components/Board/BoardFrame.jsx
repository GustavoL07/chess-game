import { getOrder } from "../../utils/boardGeometry";
import CapturedPieces from "./CapturedPieces";

const EMPTY_CAPTURED = { w: [], b: [] };
const opposite = (color) => (color === "w" ? "b" : "w");

export default function BoardFrame({
  flipped,
  captured = EMPTY_CAPTURED,
  materialDiff = 0,
  pieceSet,
  children,
}) {
  const topColor = flipped ? "w" : "b";
  const bottomColor = flipped ? "b" : "w";
  const advantageOf = (color) =>
    Math.max(0, color === "w" ? materialDiff : -materialDiff);

  const order = getOrder(flipped);
  const ranks = order.map((row) => 8 - row);
  const files = order.map((col) => String.fromCharCode(97 + col));

  return (
    <div className="board-wrap">
      <CapturedPieces
        position="top"
        pieces={captured[topColor]}
        color={opposite(topColor)}
        advantage={advantageOf(topColor)}
        pieceSet={pieceSet}
      />

      <div className="board-ranks" aria-hidden="true">
        {ranks.map((rank) => (
          <span key={rank}>{rank}</span>
        ))}
      </div>

      {children}

      <div className="board-files" aria-hidden="true">
        {files.map((file) => (
          <span key={file}>{file}</span>
        ))}
      </div>

      <CapturedPieces
        position="bottom"
        pieces={captured[bottomColor]}
        color={opposite(bottomColor)}
        advantage={advantageOf(bottomColor)}
        pieceSet={pieceSet}
      />
    </div>
  );
}
