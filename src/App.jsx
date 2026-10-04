import "./App.css";
import { useState, useEffect, useRef } from "react";
import { createEngine } from "./utils/engine";
import { Chess } from "chess.js";
import Board from "./components/Board";
import History from "./components/History";
import GameStart from "./components/GameStart";
import GameEnd from "./components/GameEnd";

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

  const [started, setStarted] = useState(false);
  const [endDismissed, setEndDismissed] = useState(false);

  const [playerColor, setPlayerColor] = useState("w");

  //Load engine
  useEffect(() => {
    engineRef.current = createEngine();
    return () => engineRef.current?.terminate();
  }, []);

  useEffect(() => {
    if (!started || game.turn() === playerColor || game.isGameOver()) return;

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
          setThinking(false);
        });
    }, aiDelay);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [history, level, aiDelay, started, playerColor]);

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

  function handleStart({ color, level }) {
    const resolved =
      color === "random" ? (Math.random() < 0.5 ? "w" : "b") : color;

    setPlayerColor(resolved);
    setLevel(level);
    setStarted(true);
  }

  function getResult(game) {
    if (game.isCheckmate()) {
      return { type: "win", winner: game.turn() === "w" ? "b" : "w" };
    }
    if (game.isStalemate()) return { type: "draw", reason: "stalemate" };
    if (game.isInsufficientMaterial())
      return { type: "draw", reason: "insufficient" };
    if (game.isThreefoldRepetition())
      return { type: "draw", reason: "threefold" };
    if (game.isDraw()) return { type: "draw", reason: "fiftymove" };
    return null;
  }

  function handleNewGame() {
    game.reset();
    setHistory([]);
    setFenHistory([game.fen()]);
    setViewPlay(null);
    setLastMove(null);
    setThinking(false);
    setEndDismissed(false);
    engineRef.current?.newGame();

    setStarted(false); // GameStart modal will be shown again
  }

  const currentPlay = viewPlay ?? history.length;
  const viewOnly = viewPlay !== null;
  const fen = fenHistory[currentPlay];

  const result = game.isGameOver() ? getResult(game) : null;

  return (
    <div className="app">
      {!started && <GameStart onStart={handleStart} />}

      {started && result && !endDismissed && (
        <GameEnd
          result={result}
          playerColor={playerColor}
          onNewGame={handleNewGame}
        />
      )}

      <Board
        game={game}
        fen={fen}
        onMove={handleMove}
        viewOnly={viewOnly}
        locked={thinking || game.turn() !== playerColor}
        lastMove={lastMove}
        flipped={playerColor === "b"}
      />
      <History moves={history} currentPlay={currentPlay} onSelect={goToPlay} />
    </div>
  );
}
