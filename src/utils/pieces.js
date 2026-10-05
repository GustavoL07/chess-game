import { getPieceUrl } from "./pieceSets";

// set: nome da pasta em assets/pieces (ex.: "cburnett")
export function getPieceImage(piece, set) {
  if (!piece) return null;
  return getPieceUrl(set, piece.color, piece.type);
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