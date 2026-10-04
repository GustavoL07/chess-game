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

  const [level, setLevel] = useState(10);
  const [aiDelay, setAiDelay] = useState(600);
  const [thinking, setThinking] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const engineRef = useRef(null);

  const [started, setStarted] = useState(false);
  const [endDismissed, setEndDismissed] = useState(false);

  const [playerColor, setPlayerColor] = useState("w");

  const [hint, setHint] = useState(null);
  const [hinting, setHinting] = useState(false);
  const [manualFlip, setManualFlip] = useState(false);
  const moveId = useRef(0);

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
    setHint(null);
    setLastMove({ from: move.from, to: move.to, id: ++moveId.current });
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
    setHint(null);
    setManualFlip(false);
    engineRef.current?.newGame();

    setStarted(false); // GameStart modal will be shown again
  }

  function handleUndo() {
    if (thinking || history.length === 0) return;

    // desfaz até voltar a ser a vez do jogador (lance dele + resposta da IA)
    do {
      game.undo();
    } while (game.turn() !== playerColor && game.history().length > 0);

    const moves = game.history();
    setHistory(moves);
    setFenHistory((prev) => prev.slice(0, moves.length + 1));
    setViewPlay(null);
    setLastMove(null);
    setHint(null);
    setEndDismissed(false);
  }

  async function handleHint() {
    setHinting(true);
    try {
      const uci = await engineRef.current.getBestMove(game.fen(), 20);
      if (uci) setHint({ from: uci.slice(0, 2), to: uci.slice(2, 4) });
    } catch (error) {
      console.error("Falha ao obter a dica:", error);
    }
    setHinting(false);
  }

  const result = game.isGameOver() ? getResult(game) : null;

  const currentPlay = viewPlay ?? history.length;
  const viewOnly = viewPlay !== null;
  const fen = fenHistory[currentPlay];

  const isPlayerTurn = started && !result && game.turn() === playerColor;
  const minUndoLength = playerColor === "b" ? 1 : 0; // IA abre a partida de brancas
  const canUndo = started && !thinking && history.length > minUndoLength;
  const canHint = isPlayerTurn && !thinking && !hinting && !viewOnly;

  const status = !started
    ? ""
    : result
      ? "Game over"
      : hinting
        ? "Calculating hint…"
        : thinking
          ? "AI is thinking…"
          : viewOnly
            ? "Reviewing game"
            : "Your turn";

  return (
    <div className="app">
      {!started && <GameStart onStart={handleStart} />}

      {started && result && !endDismissed && (
        <GameEnd
          result={result}
          playerColor={playerColor}
          onNewGame={handleNewGame}
          onReview={() => setEndDismissed(true)}
        />
      )}

      <Board
        game={game}
        fen={fen}
        onMove={handleMove}
        viewOnly={viewOnly}
        locked={thinking || game.turn() !== playerColor}
        lastMove={lastMove}
        flipped={(playerColor === "b") !== manualFlip}
        hint={hint}
      />
      <History
        moves={history}
        currentPlay={currentPlay}
        onSelect={goToPlay}
        onUndo={handleUndo}
        onHint={handleHint}
        onFlip={() => setManualFlip((f) => !f)}
        onRestart={handleNewGame}
        canUndo={canUndo}
        canHint={canHint}
        status={status}
      />
    </div>
  );
}
