import "./App.css";
import { useState, useEffect } from "react";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useChessGame } from "./hooks/useChessGame";
import { useAI } from "./hooks/useAI";
import { DEFAULT_LEVEL } from "./constants";
import Board from "./components/Board/Board";
import History from "./components/History/History";
import GameStart from "./components/GameStart/GameStart";
import GameEnd from "./components/GameEnd/GameEnd";
import Settings from "./components/Settings/Settings";
import { useSettings } from "./hooks/useSettings";
import gear from "./assets/images/gear.svg";

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
  const [confirmingRestart, setConfirmingRestart] = useState(false);

  const {
    settings,
    update,
    applyTheme,
    reset,
    presets,
    applyPreset,
    savePreset,
    deletePreset,
  } = useSettings();
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

  useEffect(() => {
    if (!confirmingRestart) return;
    const id = setTimeout(() => setConfirmingRestart(false), 3000);
    return () => clearTimeout(id);
  }, [confirmingRestart]);

  function requestRestart() {
    if (history.length > 0 && !confirmingRestart) {
      setConfirmingRestart(true);
      return;
    }
    setConfirmingRestart(false);
    handleNewGame();
  }

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

  function toggleHistory() {
    update("historyCollapsed", !settings.historyCollapsed);
  }

  const isPlayerTurn = started && !result && game.turn() === playerColor;
  const minUndoLength = playerColor === "b" ? 1 : 0;
  const canUndo = started && !ai.thinking && history.length > minUndoLength;
  const canHint = isPlayerTurn && !ai.thinking && !ai.hinting && !viewOnly;

  const modalOpen =
    !started || showSettings || Boolean(result && !endDismissed);
  useKeyboardShortcuts(
    {
      h: () => canHint && ai.requestHint(),
      u: () => canUndo && handleUndo(),
      r: requestRestart,
      f: () => setManualFlip((flipped) => !flipped),
      c: toggleHistory,
      ArrowLeft: () => chess.goToPlay(chess.currentPlay - 1),
      ArrowRight: () => chess.goToPlay(chess.currentPlay + 1),
      ArrowUp: () => chess.goToPlay(0),
      ArrowDown: () => chess.goToPlay(history.length),
    },
    !modalOpen,
  );

  return (
    <div className="app">
      <button
        type="button"
        className="settings-fab"
        onClick={() => setShowSettings(true)}
        aria-label="Settings"
      >
        <img className="gear-icon" src={gear} alt="" />
      </button>

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
          presets={presets}
          onApplyPreset={applyPreset}
          onSavePreset={savePreset}
          onDeletePreset={deletePreset}
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
        highlightMove={chess.highlightMove}
        flipped={(playerColor === "b") !== manualFlip}
        hint={ai.hint}
        pieceSet={settings.pieceSet}
        captured={chess.captured}
        materialDiff={chess.materialDiff}
        annotationsEnabled={settings.showAnnotations}
      />

      <History
        moves={history}
        currentPlay={chess.currentPlay}
        onSelect={chess.goToPlay}
        onUndo={handleUndo}
        onHint={ai.requestHint}
        onFlip={() => setManualFlip((f) => !f)}
        onRestart={requestRestart}
        confirmingRestart={confirmingRestart}
        canUndo={canUndo}
        canHint={canHint}
        status={getStatus({
          started,
          result,
          hinting: ai.hinting,
          thinking: ai.thinking,
          viewOnly,
        })}
        pieceSet={settings.pieceSet}
        moveIcons={settings.showMoveIcons}
        collapsed={settings.historyCollapsed}
        onToggleCollapse={toggleHistory}
      />
    </div>
  );
}
