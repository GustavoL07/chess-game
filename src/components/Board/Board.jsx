import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import {
  getSquareColor,
  toSquareNotation,
  squareToPosition,
} from "../../utils/pieces";
import Square from "./Square";
import "./Board.css";

const INDICES = [0, 1, 2, 3, 4, 5, 6, 7];

export default function Board({
  game,
  fen,
  onMove,
  viewOnly,
  locked,
  lastMove,
  flipped,
  hint,
  pieceSet
}) {
  const [selectedSquare, setSelectedSquare] = useState(null);

  // ao revisar o histórico, limpa a seleção
  useEffect(() => {
    if (viewOnly) setSelectedSquare(null);
  }, [viewOnly]);

  const displayGame = viewOnly ? new Chess(fen) : game;
  const board = displayGame.board();
  const inCheck = displayGame.inCheck();
  const turn = displayGame.turn();

  const movableSquares = new Set(
    selectedSquare
      ? game.moves({ square: selectedSquare, verbose: true }).map((m) => m.to)
      : [],
  );

  const indices = flipped ? [...INDICES].reverse() : INDICES;
  const dir = flipped ? -1 : 1;

  function selectIfOwn(square, piece) {
    const isOwn = piece && piece.color === game.turn();
    setSelectedSquare(isOwn ? square : null);
  }

  function handleSquareClick(rowIndex, colIndex) {
    if (viewOnly || locked) return;

    const targetSquare = toSquareNotation(rowIndex, colIndex);
    const piece = game.get(targetSquare);

    if (!selectedSquare) {
      selectIfOwn(targetSquare, piece);
      return;
    }

    if (selectedSquare === targetSquare) {
      setSelectedSquare(null);
      return;
    }

    try {
      const move = game.move({
        from: selectedSquare,
        to: targetSquare,
        promotion: "q",
      });
      setSelectedSquare(null);
      onMove(move);
      return;
    } catch {
      // lance inválido: tenta trocar a seleção
    }

    selectIfOwn(targetSquare, piece);
  }

  function getMoveStyle(square, rowIndex, colIndex) {
    if (viewOnly || !lastMove || lastMove.to !== square) return undefined;
    const from = squareToPosition(lastMove.from);
    return {
      "--dx": (from.col - colIndex) * dir,
      "--dy": (from.row - rowIndex) * dir,
    };
  }

  return (
    <div className="board">
      {indices.map((rowIndex) =>
        indices.map((colIndex) => {
          const piece = board[rowIndex][colIndex];
          const square = toSquareNotation(rowIndex, colIndex);

          return (
            <Square
              key={square}
              piece={piece}
              colorClass={getSquareColor(rowIndex, colIndex)}
              isSelected={selectedSquare === square}
              isMovable={movableSquares.has(square)}
              isHintFrom={!viewOnly && hint?.from === square}
              isHintTo={!viewOnly && hint?.to === square}
              isInCheck={
                !!piece && inCheck && piece.type === "k" && piece.color === turn
              }
              moveStyle={
                piece ? getMoveStyle(square, rowIndex, colIndex) : undefined
              }
              moveKey={lastMove?.id}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
              pieceSet={pieceSet}
            />
          );
        }),
      )}
    </div>
  );
}
