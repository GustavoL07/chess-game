import { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { createEngine } from "./utils/engine";
import Board from "./components/Board";
import History from "./components/History";
import "./App.css";

export default function App() {
  const [game] = useState(() => new Chess());
  const [history, setHistory] = useState([]);
  const [fenHistory, setFenHistory] = useState([game.fen()]);
  const [viewPlay, setViewPlay] = useState(null);

  const [level, setLevel] = useState("intermediario");
  const [aiDelay, setAiDelay] = useState(600);
  const [thinking, setThinking] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const engineRef = useRef(null);

  useEffect(() => {
    engineRef.current = createEngine();
    return () => engineRef.current?.terminate();
  }, []);

  useEffect(() => {
    if (game.turn() !== "b" || game.isGameOver()) return;

    let cancelled = false;
    setThinking(true);

    const timeoutId = setTimeout(() => {
      engineRef.current
        .getBestMove(game.fen(), level)
        .then((uci) => {
          if (cancelled) return;
          if (uci) {
            const move = game.move({
              from: uci.slice(0, 2),
              to: uci.slice(2, 4),
              promotion: uci[4],
            });
            handleMove(move);
          }
          setThinking(false);
        })
        .catch((error) => {
          if (cancelled) return;
          console.error("Falha ao obter a jogada da IA:", error);
          setThinking(false);
        });
    }, aiDelay);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [history, level, aiDelay]);

  function handleMove(move) {
    setHistory(game.history());
    setFenHistory((prev) => [...prev, game.fen()]);
    setViewPlay(null);
    setLastMove((prev) => ({
      from: move.from,
      to: move.to,
      id: (prev?.id ?? 0) + 1,
    }));
  }

  function goToPlay(play) {
    const clamped = Math.max(0, Math.min(play, history.length));
    setViewPlay(clamped === history.length ? null : clamped);
  }

  const currentPlay = viewPlay ?? history.length;
  const viewOnly = viewPlay !== null;
  const fen = fenHistory[currentPlay];

  return (
    <div className="app">
      <Board
        game={game}
        fen={fen}
        onMove={handleMove}
        viewOnly={viewOnly}
        locked={thinking || game.turn() !== "w"}
        lastMove={lastMove}
      />
      <History moves={history} currentPlay={currentPlay} onSelect={goToPlay} />
    </div>
  );
}
