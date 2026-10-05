import "./App.css";
import { useState } from "react";
import { useChessGame } from "./hooks/useChessGame";
import { useAI } from "./hooks/useAI";
import { DEFAULT_LEVEL } from "./constants";
import Board from "./components/Board/Board";
import History from "./components/History/History";
import GameStart from "./components/GameStart/GameStart";
import GameEnd from "./components/GameEnd/GameEnd";
import Settings from "./components/Settings/Settings";
import { useSettings } from "./hooks/useSettings";

function getStatus({ started, result, hinting, thinking, viewOnly }) {
  if (!started) return "";
  if (result) return "Game over";
  if (hinting) return "Calculating hint…";
  if (thinking) return "AI is thinking…";
  if (viewOnly) return "Reviewing game";
  return "Your turn";
}

export default function App() {
  const [started, setStarted] = useState(false);
  const [endDismissed, setEndDismissed] = useState(false);
  const [playerColor, setPlayerColor] = useState("w");
  const [level, setLevel] = useState(DEFAULT_LEVEL);
  const [manualFlip, setManualFlip] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { settings, update, applyTheme, reset } = useSettings();
  const chess = useChessGame();
  const { game, history, result, viewOnly } = chess;

  const ai = useAI({
    game,
    started,
    playerColor,
    level,
    history,
    onMove: chess.applyMove,
  });

  function handleStart({ color, level }) {
    const resolved =
      color === "random" ? (Math.random() < 0.5 ? "w" : "b") : color;
    setPlayerColor(resolved);
    setLevel(level);
    setStarted(true);
  }

  function handleNewGame() {
    chess.reset();
    ai.newGame();
    setEndDismissed(false);
    setManualFlip(false);
    setStarted(false);
  }

  function handleUndo() {
    if (ai.thinking || history.length === 0) return;
    chess.undo(playerColor);
    setEndDismissed(false);
  }

  const isPlayerTurn = started && !result && game.turn() === playerColor;
  const minUndoLength = playerColor === "b" ? 1 : 0;
  const canUndo = started && !ai.thinking && history.length > minUndoLength;
  const canHint = isPlayerTurn && !ai.thinking && !ai.hinting && !viewOnly;

  return (
    <div className="app">
      {!started && (
        <GameStart onStart={handleStart} pieceSet={settings.pieceSet} />
      )}

      {showSettings && (
        <Settings
          settings={settings}
          onChange={update}
          onApplyTheme={applyTheme}
          onReset={reset}
          onClose={() => setShowSettings(false)}
        />
      )}

      {started && result && !endDismissed && (
        <GameEnd
          result={result}
          playerColor={playerColor}
          onNewGame={handleNewGame}
          onReview={() => setEndDismissed(true)}
          pieceSet={settings.pieceSet}
        />
      )}

      <Board
        game={game}
        fen={chess.fen}
        onMove={chess.applyMove}
        viewOnly={viewOnly}
        locked={ai.thinking || game.turn() !== playerColor}
        lastMove={chess.lastMove}
        flipped={(playerColor === "b") !== manualFlip}
        hint={ai.hint}
        pieceSet={settings.pieceSet}
      />

      <History
        moves={history}
        currentPlay={chess.currentPlay}
        onSelect={chess.goToPlay}
        onUndo={handleUndo}
        onHint={ai.requestHint}
        onFlip={() => setManualFlip((f) => !f)}
        onRestart={handleNewGame}
        canUndo={canUndo}
        canHint={canHint}
        status={getStatus({
          started,
          result,
          hinting: ai.hinting,
          thinking: ai.thinking,
          viewOnly,
        })}
        onSettings={() => setShowSettings(true)}
      />
    </div>
  );
}
