import { getPieceImage } from "../../utils/pieces";
import { splitMove } from "../../utils/moveNotation";

export default function MoveLabel({ san, color, pieceSet, icons }) {
  if (!icons) return san;

  return splitMove(san).map((part, i) =>
    typeof part === "string" ? (
      <span key={i}>{part}</span>
    ) : (
      <img
        key={i}
        className="move-piece"
        src={getPieceImage({ color, type: part.piece }, pieceSet)}
        alt=""
      />
    ),
  );
}
