import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import {
  getSquareColor,
  toSquareNotation,
  squareToPosition,
} from "../../utils/pieces";
import Square from "./Square";
import PromotionPicker from "./PromotionPicker";
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
  pieceSet,
}) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [pendingPromotion, setPendingPromotion] = useState(null);

  useEffect(() => {
    if (viewOnly) setSelectedSquare(null);
  }, [viewOnly]);

  useEffect(() => {
    setPendingPromotion(null);
  }, [fen, viewOnly]);

  useEffect(() => {
    if (!pendingPromotion) return;
    function onKey(e) {
      if (e.key === "Escape") setPendingPromotion(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pendingPromotion]);

  const displayGame = viewOnly ? new Chess(fen) : game;
  const board = displayGame.board();
  const inCheck = displayGame.inCheck();
  const turn = displayGame.turn();

  const targets = selectedSquare
    ? game.moves({ square: selectedSquare, verbose: true })
    : [];

  const movableSquares = new Set(
    targets.filter((m) => !m.flags.includes("c")).map((m) => m.to),
  );
  const capturableSquares = new Set(
    targets.filter((m) => m.flags.includes("c")).map((m) => m.to),
  );

  const indices = flipped ? [...INDICES].reverse() : INDICES;
  const dir = flipped ? -1 : 1;

  function selectIfOwn(square, piece) {
    const isOwn = piece && piece.color === game.turn();
    setSelectedSquare(isOwn ? square : null);
  }

  function handleSquareClick(rowIndex, colIndex) {
    if (viewOnly || locked || pendingPromotion) return;

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

    const candidates = game
      .moves({ square: selectedSquare, verbose: true })
      .filter((m) => m.to === targetSquare);

    if (candidates.length === 0) {
      selectIfOwn(targetSquare, piece);
      return;
    }

    if (candidates[0].promotion) {
      setPendingPromotion({
        from: selectedSquare,
        to: targetSquare,
        color: game.turn(),
      });
      return;
    }

    const move = game.move({ from: selectedSquare, to: targetSquare });
    setSelectedSquare(null);
    onMove(move);
  }

  function handlePromotionPick(pieceType) {
    if (!pendingPromotion) return;
    const { from, to } = pendingPromotion;
    setPendingPromotion(null);

    try {
      const move = game.move({ from, to, promotion: pieceType });
      setSelectedSquare(null);
      onMove(move);
    } catch {}
  }

  function getMoveStyle(square, rowIndex, colIndex) {
    if (viewOnly || !lastMove || lastMove.to !== square) return undefined;
    const from = squareToPosition(lastMove.from);
    return {
      "--dx": (from.col - colIndex) * dir,
      "--dy": (from.row - rowIndex) * dir,
    };
  }

  let promotionPlacement = null;
  if (pendingPromotion) {
    const { row, col } = squareToPosition(pendingPromotion.to);
    promotionPlacement = {
      col: flipped ? 7 - col : col,
      atTop: (flipped ? 7 - row : row) === 0,
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
              isCapturable={capturableSquares.has(square)}
              isHintFrom={!viewOnly && hint?.from === square}
              isHintTo={!viewOnly && hint?.to === square}
              isInCheck={
                !!piece && inCheck && piece.type === "k" && piece.color === turn
              }
              moveStyle={
                piece ? getMoveStyle(square, rowIndex, colIndex) : undefined
              }
              moveKey={lastMove?.id}
              pieceSet={pieceSet}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            />
          );
        }),
      )}

      {pendingPromotion && (
        <PromotionPicker
          color={pendingPromotion.color}
          col={promotionPlacement.col}
          atTop={promotionPlacement.atTop}
          pieceSet={pieceSet}
          onSelect={handlePromotionPick}
          onCancel={() => setPendingPromotion(null)}
        />
      )}
    </div>
  );
}
