import { getPieceImage } from "../../utils/pieces";
import "./Square.css";

// Só desenha uma casa; toda a lógica fica no Board.
export default function Square({
  piece,
  colorClass, // "light" | "dark"
  isSelected,
  isMovable,
  isHintFrom,
  isHintTo,
  isInCheck,
  moveStyle, // { "--dx", "--dy" } quando a peça acabou de chegar aqui
  moveKey, // id do lance, para reiniciar a animação
  onClick,
}) {
  const classes = [
    "square",
    colorClass,
    isSelected && "selected",
    moveStyle && "has-moving",
    isMovable && "movable",
    isHintFrom && "hint-from",
    isHintTo && "hint-to",
  ]
    .filter(Boolean)
    .join(" ");

  const pieceClasses = [
    isSelected && "selected-piece",
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
          src={getPieceImage(piece)}
          style={moveStyle}
          className={pieceClasses}
          alt={`${piece.color} ${piece.type}`}
        />
      )}
    </div>
  );
}
