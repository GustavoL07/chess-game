import { useState, useRef } from "react";
import { Chess } from "chess.js";
import { getResult } from "../utils/result";
import { getCaptured, getMaterialDiff } from "../utils/material";

export function useChessGame() {
  const [game] = useState(() => new Chess());
  const [history, setHistory] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]); // { from, to, color, captured } por lance
  const [fenHistory, setFenHistory] = useState([game.fen()]);
  const [viewPlay, setViewPlay] = useState(null); // null = posição atual
  const [lastMove, setLastMove] = useState(null);
  const moveId = useRef(0);

  function readMoves() {
    return game
      .history({ verbose: true })
      .map(({ from, to, color, captured }) => ({
        from,
        to,
        color,
        captured: captured ?? null,
      }));
  }

  // Chame depois de um game.move() bem-sucedido
  function applyMove(move) {
    setHistory(game.history());
    setMoveHistory(readMoves());
    setFenHistory((prev) => [...prev, game.fen()]);
    setViewPlay(null);
    setLastMove({ from: move.from, to: move.to, id: ++moveId.current });
  }

  function goToPlay(play) {
    const clamped = Math.max(0, Math.min(play, history.length));
    setViewPlay(clamped === history.length ? null : clamped);
  }

  // Desfaz até voltar a ser a vez do jogador
  function undo(playerColor) {
    do {
      game.undo();
    } while (game.turn() !== playerColor && game.history().length > 0);

    const moves = game.history();
    setHistory(moves);
    setMoveHistory(readMoves());
    setFenHistory((prev) => prev.slice(0, moves.length + 1));
    setViewPlay(null);
    setLastMove(null);
  }

  function reset() {
    game.reset();
    setHistory([]);
    setMoveHistory([]);
    setFenHistory([game.fen()]);
    setViewPlay(null);
    setLastMove(null);
  }

  const currentPlay = viewPlay ?? history.length;
  const displayedFen = fenHistory[currentPlay];

  return {
    game,
    history,
    lastMove,
    highlightMove: currentPlay > 0 ? moveHistory[currentPlay - 1] : null,
    captured: getCaptured(moveHistory, currentPlay),
    materialDiff: getMaterialDiff(displayedFen),
    currentPlay,
    viewOnly: viewPlay !== null,
    fen: displayedFen,
    result: game.isGameOver() ? getResult(game) : null,
    applyMove,
    goToPlay,
    undo,
    reset,
  };
}
