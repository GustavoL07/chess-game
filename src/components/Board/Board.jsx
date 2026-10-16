import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Chess } from "chess.js";
import {
  getPieceImage,
  getSquareColor,
  toSquareNotation,
  squareToPosition,
} from "../../utils/pieces";
import Square from "./Square";
import PromotionPicker from "./PromotionPicker";
import CapturedPieces from "./CapturedPieces";
import Annotations from "./Annotations";
import "./Board.css";

const INDICES = [0, 1, 2, 3, 4, 5, 6, 7];
const EMPTY_CAPTURED = { w: [], b: [] };
const DRAG_THRESHOLD = 4; // px de movimento até um clique virar arrasto

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
  captured = EMPTY_CAPTURED,
  materialDiff = 0,
  annotationsEnabled = true,
  dragEnabled = true,
}) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  // promoção aguardando escolha: { from, to, color }
  const [pendingPromotion, setPendingPromotion] = useState(null);

  const boardRef = useRef(null);

  // setas e círculos desenhados com o botão direito: { from, to } (from === to = círculo)
  const [annotations, setAnnotations] = useState([]);
  const [drawing, setDrawing] = useState(null);

  // arrastar e soltar. O gesto fica num ref (a posição muda a cada movimento do
  // mouse e não deve redesenhar o tabuleiro); só o início/fim e a casa sob o
  // ponteiro viram estado.
  const dragRef = useRef(null);
  const ghostRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [dragging, setDragging] = useState(null); // { from, piece, size }
  const [dragOver, setDragOver] = useState(null); // casa sob o ponteiro

  function cancelDrag() {
    dragRef.current = null;
    setDragging(null);
    setDragOver(null);
  }

  // qualquer mudança de posição apaga as marcações e interrompe um arrasto
  useEffect(() => {
    setAnnotations([]);
    setDrawing(null);
    cancelDrag();
  }, [fen]);

  // desligar o recurso em Settings também limpa o que estava desenhado
  useEffect(() => {
    if (!annotationsEnabled) {
      setAnnotations([]);
      setDrawing(null);
    }
  }, [annotationsEnabled]);

  // ao revisar o histórico, limpa a seleção
  useEffect(() => {
    if (viewOnly) setSelectedSquare(null);
  }, [viewOnly]);

  // qualquer mudança de posição (undo, navegação) invalida a promoção pendente
  useEffect(() => {
    setPendingPromotion(null);
  }, [fen, viewOnly]);

  // Esc cancela a escolha da promoção
  useEffect(() => {
    if (!pendingPromotion) return;
    function onKey(e) {
      if (e.key === "Escape") setPendingPromotion(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pendingPromotion]);

  // Esc cancela o arrasto: a peça volta e o soltar seguinte não faz nada
  useEffect(() => {
    if (!dragging) return;
    function onKey(e) {
      if (e.key !== "Escape") return;
      if (dragRef.current) dragRef.current.cancelled = true;
      setDragging(null);
      setDragOver(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dragging]);

  // posiciona a peça que acompanha o cursor (direto no DOM, sem re-render)
  function positionGhost() {
    const drag = dragRef.current;
    if (!drag || !ghostRef.current) return;
    ghostRef.current.style.transform = `translate(${drag.x}px, ${drag.y}px) translate(-50%, -50%)`;
  }

  // a peça acabou de aparecer: coloca no lugar antes de pintar a tela
  useLayoutEffect(() => {
    if (dragging) positionGhost();
  }, [dragging]);

  const displayGame = viewOnly ? new Chess(fen) : game;
  const board = displayGame.board();
  const inCheck = displayGame.inCheck();
  const turn = displayGame.turn();

  const targets = selectedSquare
    ? game.moves({ square: selectedSquare, verbose: true })
    : [];

  // flag "c" = captura normal (a peça está na casa de destino)
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

  // Tenta jogar from -> to. Devolve false se o lance não é legal.
  // animate: false quando a peça já foi levada até a casa (arrastar e soltar).
  function tryMove(from, to, { animate = true } = {}) {
    const candidates = game
      .moves({ square: from, verbose: true })
      .filter((m) => m.to === to);

    if (candidates.length === 0) return false;

    // promoção: espera o jogador escolher a peça
    if (candidates[0].promotion) {
      setPendingPromotion({ from, to, color: game.turn() });
      return true;
    }

    const move = game.move({ from, to });
    setSelectedSquare(null);
    onMove(move, { animate });
    return true;
  }

  function handleSquareClick(rowIndex, colIndex) {
    // o clique que o navegador dispara ao soltar um arrasto não conta
    if (suppressClickRef.current) return;
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

    // lance ilegal: tenta trocar a seleção
    if (!tryMove(selectedSquare, targetSquare)) {
      selectIfOwn(targetSquare, piece);
    }
  }

  function handlePromotionPick(pieceType) {
    if (!pendingPromotion) return;
    const { from, to } = pendingPromotion;
    setPendingPromotion(null);

    try {
      const move = game.move({ from, to, promotion: pieceType });
      setSelectedSquare(null);
      onMove(move);
    } catch {
      // a posição mudou enquanto a janela estava aberta
    }
  }

  // casa sob o ponteiro (considera o tabuleiro girado).
  // strict: devolve null se o ponteiro está fora do tabuleiro.
  function squareFromPointer(e, { strict = false } = {}) {
    const rect = boardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    if (strict && (x < 0 || x >= 1 || y < 0 || y >= 1)) return null;

    const clamp = (n) => Math.min(7, Math.max(0, n));
    const col = clamp(Math.floor(x * 8));
    const row = clamp(Math.floor(y * 8));
    return toSquareNotation(flipped ? 7 - row : row, flipped ? 7 - col : col);
  }

  // pressionou sobre uma peça sua: pode virar um arrasto se o ponteiro se mover
  function startDragCandidate(e) {
    if (!dragEnabled || !e.isPrimary || viewOnly || locked || pendingPromotion)
      return;

    const from = squareFromPointer(e);
    const piece = game.get(from);
    if (!piece || piece.color !== game.turn()) return;

    dragRef.current = {
      pointerId: e.pointerId,
      from,
      piece,
      startX: e.clientX,
      startY: e.clientY,
      x: e.clientX,
      y: e.clientY,
      active: false,
      cancelled: false,
    };
  }

  function handleBoardPointerDown(e) {
    if (e.button === 0) {
      // clique esquerdo apaga as marcações e pode iniciar um arrasto
      if (annotationsEnabled)
        setAnnotations((prev) => (prev.length ? [] : prev));
      startDragCandidate(e);
      return;
    }

    if (!annotationsEnabled || e.button !== 2) return;
    const square = squareFromPointer(e);
    e.currentTarget.setPointerCapture(e.pointerId); // acompanha o ponteiro fora do tabuleiro
    setDrawing({ from: square, to: square });
  }

  function handleBoardPointerMove(e) {
    const drag = dragRef.current;

    if (drag && drag.pointerId === e.pointerId) {
      // botão já foi solto fora da janela: descarta o gesto
      if (!(e.buttons & 1)) {
        cancelDrag();
        return;
      }
      if (drag.cancelled) return;

      drag.x = e.clientX;
      drag.y = e.clientY;

      if (!drag.active) {
        const moved = Math.hypot(
          e.clientX - drag.startX,
          e.clientY - drag.startY,
        );
        if (moved < DRAG_THRESHOLD) return;

        // virou arrasto: seleciona a peça (mostra os lances) e cria a peça fantasma.
        // A captura do ponteiro só entra agora; antes disso ela mudaria o alvo do clique.
        drag.active = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        setSelectedSquare(drag.from);
        setDragging({
          from: drag.from,
          piece: drag.piece,
          size: boardRef.current.getBoundingClientRect().width / 8,
        });
      }

      positionGhost();
      const over = squareFromPointer(e, { strict: true });
      setDragOver((prev) => (prev === over ? prev : over));
      return;
    }

    if (!drawing) return;
    const square = squareFromPointer(e);
    if (square !== drawing.to) setDrawing({ ...drawing, to: square });
  }

  function handleBoardPointerUp(e) {
    const drag = dragRef.current;

    if (drag && drag.pointerId === e.pointerId) {
      dragRef.current = null;

      if (drag.active) {
        // o navegador ainda dispara um "click" depois de soltar: ignora-o
        suppressClickRef.current = true;
        setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);

        const target = squareFromPointer(e, { strict: true });
        setDragging(null);
        setDragOver(null);

        if (!drag.cancelled && target && target !== drag.from) {
          // a peça já está na casa, então o lance não precisa deslizar
          tryMove(drag.from, target, { animate: false });
        }
        return;
      }
      // sem arrasto era um clique comum: o fluxo do onClick cuida dele
    }

    if (!drawing || e.button !== 2) return;
    const { from, to } = drawing;
    setDrawing(null);

    // desenhar a mesma marcação de novo a remove
    setAnnotations((prev) => {
      const same = (a) => a.from === from && a.to === to;
      return prev.some(same)
        ? prev.filter((a) => !same(a))
        : [...prev, { from, to }];
    });
  }

  function handleBoardPointerCancel() {
    cancelDrag();
    setDrawing(null);
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

  // posição visual da janela de promoção (considera o tabuleiro girado)
  let promotionPlacement = null;
  if (pendingPromotion) {
    const { row, col } = squareToPosition(pendingPromotion.to);
    promotionPlacement = {
      col: flipped ? 7 - col : col,
      atTop: (flipped ? 7 - row : row) === 0,
    };
  }

  // faixas de capturas: a de cima pertence à cor que está no topo
  const topColor = flipped ? "w" : "b";
  const bottomColor = flipped ? "b" : "w";
  const opposite = (color) => (color === "w" ? "b" : "w");
  const advantageOf = (color) =>
    Math.max(0, color === "w" ? materialDiff : -materialDiff);

  // nomes das casas: seguem a orientação do tabuleiro
  // (brancas embaixo: 8..1 e a..h | pretas embaixo: 1..8 e h..a)
  const ranks = indices.map((rowIndex) => 8 - rowIndex);
  const files = indices.map((colIndex) => String.fromCharCode(97 + colIndex));

  return (
    <div className="board-wrap">
      <CapturedPieces
        position="top"
        pieces={captured[topColor]}
        color={opposite(topColor)}
        advantage={advantageOf(topColor)}
        pieceSet={pieceSet}
      />

      <div className="board-ranks" aria-hidden="true">
        {ranks.map((rank) => (
          <span key={rank}>{rank}</span>
        ))}
      </div>

      <div
        className={`board ${dragging ? "dragging" : ""}`}
        ref={boardRef}
        onPointerDown={handleBoardPointerDown}
        onPointerMove={handleBoardPointerMove}
        onPointerUp={handleBoardPointerUp}
        onPointerCancel={handleBoardPointerCancel}
        onContextMenu={(e) => annotationsEnabled && e.preventDefault()}
      >
        {indices.map((rowIndex) =>
          indices.map((colIndex) => {
            const piece = board[rowIndex][colIndex];
            const square = toSquareNotation(rowIndex, colIndex);
            const isLegalTarget =
              movableSquares.has(square) || capturableSquares.has(square);

            return (
              <Square
                key={square}
                piece={piece}
                colorClass={getSquareColor(rowIndex, colIndex)}
                isSelected={selectedSquare === square}
                isMovable={movableSquares.has(square)}
                isCapturable={capturableSquares.has(square)}
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
                isDragSource={dragging?.from === square}
                isDragOver={dragOver === square && isLegalTarget}
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

        {annotationsEnabled && (
          <Annotations
            annotations={annotations}
            drawing={drawing}
            flipped={flipped}
          />
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

      <div className="board-files" aria-hidden="true">
        {files.map((file) => (
          <span key={file}>{file}</span>
        ))}
      </div>

      <CapturedPieces
        position="bottom"
        pieces={captured[bottomColor]}
        color={opposite(bottomColor)}
        advantage={advantageOf(bottomColor)}
        pieceSet={pieceSet}
      />

      {dragging &&
        createPortal(
          <img
            ref={ghostRef}
            className="drag-ghost"
            src={getPieceImage(dragging.piece, pieceSet)}
            style={{ width: dragging.size, height: dragging.size }}
            alt=""
            draggable={false}
          />,
          document.body,
        )}
    </div>
  );
}
