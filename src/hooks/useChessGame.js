import { useState, useRef } from "react";
import { Chess } from "chess.js";
import { getResult } from "../utils/result";

export function useChessGame() {
  const [game] = useState(() => new Chess());
  const [history, setHistory] = useState([]);
  const [fenHistory, setFenHistory] = useState([game.fen()]);
  const [viewPlay, setViewPlay] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const moveId = useRef(0);

  function applyMove(move) {
    setHistory(game.history());
    setFenHistory((prev) => [...prev, game.fen()]);
    setViewPlay(null);
    setLastMove({ from: move.from, to: move.to, id: ++moveId.current });
  }

  function goToPlay(play) {
    const clamped = Math.max(0, Math.min(play, history.length));
    setViewPlay(clamped === history.length ? null : clamped);
  }

  function undo(playerColor) {
    do {
      game.undo();
    } while (game.turn() !== playerColor && game.history().length > 0);

    const moves = game.history();
    setHistory(moves);
    setFenHistory((prev) => prev.slice(0, moves.length + 1));
    setViewPlay(null);
    setLastMove(null);
  }

  function reset() {
    game.reset();
    setHistory([]);
    setFenHistory([game.fen()]);
    setViewPlay(null);
    setLastMove(null);
  }

  const currentPlay = viewPlay ?? history.length;

  return {
    game,
    history,
    lastMove,
    currentPlay,
    viewOnly: viewPlay !== null,
    fen: fenHistory[currentPlay],
    result: game.isGameOver() ? getResult(game) : null,
    applyMove,
    goToPlay,
    undo,
    reset,
  };
}
