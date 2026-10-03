import { useState } from "react";
import {
  getPieceImage,
  getSquareColor,
  toSquareNotation,
} from "../utils/pieces";
import "./Board.css";

function squareToPosition(square) {
  return {
    row: 8 - parseInt(square[1], 10),
    col: square.charCodeAt(0) - 97,
  };
}

export default function Board({ game, onMove }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null);

  const [anim, setAnim] = useState({ id: 0, moves: [] });

  const board = game.board();

  function handleSquareClick(rowIndex, colIndex) {
    const targetSquare = toSquareNotation(rowIndex, colIndex);
    const piece = game.get(targetSquare);

    if (!selectedSquare) {
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(targetSquare);
        setSelectedPiece(piece);
      }
      return;
    }

    if (selectedSquare === targetSquare) {
      setSelectedSquare(null);
      setSelectedPiece(null);
      return;
    }

    try {
      const move = game.move({
        from: selectedSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (move) {
        const moves = [{ from: move.from, to: move.to }];

        setAnim((prev) => ({ id: prev.id + 1, moves }));
        setSelectedSquare(null);
        setSelectedPiece(null);

        onMove();
        return;
      }
    } catch (error) {}

    if (piece && piece.color === game.turn()) {
      setSelectedSquare(targetSquare);
      setSelectedPiece(piece);
    } else {
      setSelectedSquare(null);
      setSelectedPiece(null);
    }
  }

  return (
    <div className="board">
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          const square = toSquareNotation(rowIndex, colIndex);
          const isSelected = selectedSquare === square;

          const movement = anim.moves.find((m) => m.to === square);
          let moveStyle;
          if (movement && piece) {
            const from = squareToPosition(movement.from);
            moveStyle = {
              "--dx": from.col - colIndex,
              "--dy": from.row - rowIndex,
            };
          }

          const isInCheck =
            game.inCheck() &&
            piece &&
            piece.type === "k" &&
            piece.color === game.turn();
          const movableSquares = selectedPiece
            ? game
                .moves({ square: selectedSquare, verbose: true })
                .map((m) => m.to)
            : [];

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`square ${getSquareColor(rowIndex, colIndex)} ${isSelected ? "selected" : ""} ${moveStyle ? "has-moving" : ""} ${movableSquares.includes(square) ? "movable" : ""}`}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            >
              {piece && (
                <img
                  key={moveStyle ? `moved-${anim.id}` : "piece"}
                  src={getPieceImage(piece)}
                  style={moveStyle}
                  className={`${isSelected ? "selected-piece" : ""} ${moveStyle ? "moving" : ""} ${isInCheck ? "in-check" : ""}`}
                  alt={`${piece.color} ${piece.type}`}
                />
              )}
            </div>
          );
        }),
      )}
    </div>
  );
}
