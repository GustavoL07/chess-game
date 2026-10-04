import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import {
  getPieceImage,
  getSquareColor,
  toSquareNotation,
  squareToPosition,
} from "../utils/pieces";
import "./Board.css";

export default function Board({
  game,
  fen,
  onMove,
  viewOnly,
  locked,
  lastMove,
}) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null);

  useEffect(() => {
    if (viewOnly) {
      setSelectedSquare(null);
      setSelectedPiece(null);
    }
  }, [viewOnly]);

  const displayGame = viewOnly ? new Chess(fen) : game;
  const board = displayGame.board();

  const movableSquares = selectedPiece
    ? game.moves({ square: selectedSquare, verbose: true }).map((m) => m.to)
    : [];
  const inCheck = displayGame.inCheck();
  const turn = displayGame.turn();

  function handleSquareClick(rowIndex, colIndex) {
    if (viewOnly || locked) return;

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
        setSelectedSquare(null);
        setSelectedPiece(null);
        onMove(move);
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

          const movement =
            !viewOnly && lastMove && lastMove.to === square ? lastMove : null;

          let moveStyle;
          if (movement && piece) {
            const from = squareToPosition(movement.from);
            moveStyle = {
              "--dx": from.col - colIndex,
              "--dy": from.row - rowIndex,
            };
          }

          const isInCheck =
            inCheck && piece && piece.type === "k" && piece.color === turn;

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`square ${getSquareColor(rowIndex, colIndex)} ${isSelected ? "selected" : ""} ${moveStyle ? "has-moving" : ""} ${movableSquares.includes(square) ? "movable" : ""}`}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            >
              {piece && (
                <img
                  key={moveStyle ? `moved-${lastMove.id}` : "piece"}
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
