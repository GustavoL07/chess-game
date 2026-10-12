import { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import {
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
}) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  // promoção aguardando escolha: { from, to, color }
  const [pendingPromotion, setPendingPromotion] = useState(null);

  // setas e círculos desenhados com o botão direito: { from, to } (from === to = círculo)
  const boardRef = useRef(null);
  const [annotations, setAnnotations] = useState([]);
  const [drawing, setDrawing] = useState(null);

  // qualquer mudança de posição apaga as marcações
  useEffect(() => {
    setAnnotations([]);
    setDrawing(null);
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

  // Esc cancela a escolha
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

    // lance ilegal: tenta trocar a seleção
    if (candidates.length === 0) {
      selectIfOwn(targetSquare, piece);
      return;
    }

    // promoção: espera o jogador escolher a peça
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
    } catch {
      // a posição mudou enquanto a janela estava aberta
    }
  }

  // casa sob o ponteiro (considera o tabuleiro girado)
  function squareFromPointer(e) {
    const rect = boardRef.current.getBoundingClientRect();
    const clamp = (n) => Math.min(7, Math.max(0, n));
    const col = clamp(Math.floor(((e.clientX - rect.left) / rect.width) * 8));
    const row = clamp(Math.floor(((e.clientY - rect.top) / rect.height) * 8));
    return toSquareNotation(flipped ? 7 - row : row, flipped ? 7 - col : col);
  }

  function handleBoardPointerDown(e) {
    if (!annotationsEnabled) return;

    // clique esquerdo apaga as marcações (e segue o fluxo normal do clique)
    if (e.button === 0) {
      setAnnotations((prev) => (prev.length ? [] : prev));
      return;
    }

    if (e.button !== 2) return;
    const square = squareFromPointer(e);
    e.currentTarget.setPointerCapture(e.pointerId); // acompanha o ponteiro fora do tabuleiro
    setDrawing({ from: square, to: square });
  }

  function handleBoardPointerMove(e) {
    if (!drawing) return;
    const square = squareFromPointer(e);
    if (square !== drawing.to) setDrawing({ ...drawing, to: square });
  }

  function handleBoardPointerUp(e) {
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

  function getMoveStyle(square, rowIndex, colIndex) {
    if (viewOnly || !lastMove || lastMove.to !== square) return undefined;
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
        className="board"
        ref={boardRef}
        onPointerDown={handleBoardPointerDown}
        onPointerMove={handleBoardPointerMove}
        onPointerUp={handleBoardPointerUp}
        onPointerCancel={() => setDrawing(null)}
        onContextMenu={(e) => annotationsEnabled && e.preventDefault()}
      >
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
    </div>
  );
}
