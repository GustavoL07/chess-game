import wp from "../assets/pieces/cburnett/wp.svg";
import wr from "../assets/pieces/cburnett/wr.svg";
import wn from "../assets/pieces/cburnett/wn.svg";
import wb from "../assets/pieces/cburnett/wb.svg";
import wq from "../assets/pieces/cburnett/wq.svg";
import wk from "../assets/pieces/cburnett/wk.svg";
import bp from "../assets/pieces/cburnett/bp.svg";
import br from "../assets/pieces/cburnett/br.svg";
import bn from "../assets/pieces/cburnett/bn.svg";
import bb from "../assets/pieces/cburnett/bb.svg";
import bq from "../assets/pieces/cburnett/bq.svg";
import bk from "../assets/pieces/cburnett/bk.svg";

export const pieceImages = {
  "w-p": wp,
  "w-r": wr,
  "w-n": wn,
  "w-b": wb,
  "w-q": wq,
  "w-k": wk,
  "b-p": bp,
  "b-r": br,
  "b-n": bn,
  "b-b": bb,
  "b-q": bq,
  "b-k": bk,
};

export function getPieceImage(piece) {
  if (!piece) return null;
  const { type, color } = piece;
  return pieceImages[`${color}-${type}`];
}

export function getSquareColor(rowIndex, colIndex) {
  return (rowIndex + colIndex) % 2 === 0 ? "light" : "dark";
}

export function toSquareNotation(rowIndex, colIndex) {
  const colLetter = String.fromCharCode(97 + colIndex);
  const rowNumber = 8 - rowIndex;
  return `${colLetter}${rowNumber}`;
}

export function squareToPosition(square) {
  return {
    row: 8 - parseInt(square[1], 10),
    col: square.charCodeAt(0) - 97,
  };
}
