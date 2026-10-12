import { getPieceImage } from "../../utils/pieces";
import "./Square.css";

export default function Square({
  piece,
  colorClass,
  isSelected,
  isMovable,
  isCapturable,
  isLastFrom,
  isLastTo,
  isHintFrom,
  isHintTo,
  isInCheck,
  moveStyle,
  moveKey,
  onClick,
  pieceSet,
}) {
  const classes = [
    "square",
    colorClass,
    isSelected && "selected",
    moveStyle && "has-moving",
    isMovable && "movable",
    isCapturable && "capturable",
    isLastFrom && "last-from",
    isLastTo && "last-to",
    isHintFrom && "hint-from",
    isHintTo && "hint-to",
  ]
    .filter(Boolean)
    .join(" ");

  const pieceClasses = [
    isSelected && "selected-piece",
    isHintFrom && "hint-piece",
    moveStyle && "moving",
    isInCheck && "in-check",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} onClick={onClick}>
      {piece && (
        <img
          key={moveStyle ? `moved-${moveKey}` : "piece"}
          src={getPieceImage(piece, pieceSet)}
          style={moveStyle}
          className={pieceClasses}
          alt={`${piece.color} ${piece.type}`}
        />
      )}
    </div>
  );
}
