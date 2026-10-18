import { useMemo, useRef } from "react";
import { Chess } from "chess.js";
import {
  getSquareColor,
  toSquareNotation,
  squareToPosition,
} from "../../utils/pieces";
import { getOrder, toVisualPosition } from "../../utils/boardGeometry";
import { useMoveInput } from "../../hooks/useMoveInput";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import { useAnnotations } from "../../hooks/useAnnotations";
import BoardFrame from "./BoardFrame";
import Square from "./Square";
import PromotionPicker from "./PromotionPicker";
import Annotations from "./Annotations";
import DragGhost from "./DragGhost";
import "./Board.css";

export default function Board({
  game,
  fen,
  onMove,
  viewOnly,
  locked,
  lastMove,
  highlightMove,
  flipped,
  hint,
  pieceSet,
  captured,
  materialDiff,
  annotationsEnabled = true,
  dragEnabled = true,
}) {
  const boardRef = useRef(null);

  const input = useMoveInput({ game, fen, viewOnly, locked, onMove });

  const drag = useDragAndDrop({
    enabled: dragEnabled,
    blocked: viewOnly || locked || Boolean(input.pendingPromotion),
    game,
    fen,
    flipped,
    boardRef,
    tryMove: input.tryMove,
    onSelect: input.setSelectedSquare,
  });

  const notes = useAnnotations({
    enabled: annotationsEnabled,
    fen,
    flipped,
    boardRef,
  });

  const displayGame = useMemo(
    () => (viewOnly ? new Chess(fen) : game),
    [viewOnly, fen, game],
  );
  const board = displayGame.board();
  const inCheck = displayGame.inCheck();
  const turn = displayGame.turn();

  const order = getOrder(flipped);
  const dir = flipped ? -1 : 1;

  function handlePointerDown(e) {
    notes.onPointerDown(e);
    drag.onPointerDown(e);
  }

  function handlePointerMove(e) {
    drag.onPointerMove(e);
    notes.onPointerMove(e);
  }

  function handlePointerUp(e) {
    drag.onPointerUp(e);
    notes.onPointerUp(e);
  }

  function handlePointerCancel() {
    drag.onPointerCancel();
    notes.onPointerCancel();
  }

  function getMoveStyle(square, rowIndex, colIndex) {
    if (
      viewOnly ||
      !lastMove ||
      lastMove.to !== square ||
      lastMove.animate === false
    ) {
      return undefined;
    }
    const from = squareToPosition(lastMove.from);
    return {
      "--dx": (from.col - colIndex) * dir,
      "--dy": (from.row - rowIndex) * dir,
    };
  }
  let promotionPlacement = null;
  if (input.pendingPromotion) {
    const { row, col } = toVisualPosition(input.pendingPromotion.to, flipped);
    promotionPlacement = { col, atTop: row === 0 };
  }

  return (
    <>
      <BoardFrame
        flipped={flipped}
        captured={captured}
        materialDiff={materialDiff}
        pieceSet={pieceSet}
      >
        <div
          className={`board ${drag.dragging ? "dragging" : ""}`}
          ref={boardRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onContextMenu={notes.onContextMenu}
        >
          {order.map((rowIndex) =>
            order.map((colIndex) => {
              const piece = board[rowIndex][colIndex];
              const square = toSquareNotation(rowIndex, colIndex);
              const isMovable = input.movableSquares.has(square);
              const isCapturable = input.capturableSquares.has(square);

              return (
                <Square
                  key={square}
                  piece={piece}
                  colorClass={getSquareColor(rowIndex, colIndex)}
                  isSelected={input.selectedSquare === square}
                  isMovable={isMovable}
                  isCapturable={isCapturable}
                  isLastFrom={highlightMove?.from === square}
                  isLastTo={highlightMove?.to === square}
                  isHintFrom={!viewOnly && hint?.from === square}
                  isHintTo={!viewOnly && hint?.to === square}
                  isInCheck={
                    !!piece &&
                    inCheck &&
                    piece.type === "k" &&
                    piece.color === turn
                  }
                  isDragSource={drag.dragging?.from === square}
                  isDragOver={
                    drag.dragOver === square && (isMovable || isCapturable)
                  }
                  moveStyle={
                    piece ? getMoveStyle(square, rowIndex, colIndex) : undefined
                  }
                  moveKey={lastMove?.id}
                  pieceSet={pieceSet}
                  onClick={() =>
                    !drag.ignoreClick() && input.handleSquareClick(square)
                  }
                />
              );
            }),
          )}

          {notes.enabled && (
            <Annotations
              annotations={notes.annotations}
              drawing={notes.drawing}
              flipped={flipped}
            />
          )}

          {input.pendingPromotion && (
            <PromotionPicker
              color={input.pendingPromotion.color}
              col={promotionPlacement.col}
              atTop={promotionPlacement.atTop}
              pieceSet={pieceSet}
              onSelect={input.pickPromotion}
              onCancel={input.cancelPromotion}
            />
          )}
        </div>
      </BoardFrame>

      {drag.dragging && (
        <DragGhost
          imgRef={drag.ghostRef}
          piece={drag.dragging.piece}
          size={drag.dragging.size}
          pieceSet={pieceSet}
        />
      )}
    </>
  );
}
