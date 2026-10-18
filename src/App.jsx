import "./App.css";
import { useState, useEffect } from "react";
import { useChessGame } from "./hooks/useChessGame";
import { useAI } from "./hooks/useAI";
import { useSettings } from "./hooks/useSettings";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useGameRecorder } from "./hooks/useGameRecorder";
import { DEFAULT_LEVEL } from "./constants";
import gear from "./assets/images/gear.svg";
import Board from "./components/Board/Board";
import History from "./components/History/History";
import Home from "./components/Home/Home";
import GameStart from "./components/GameStart/GameStart";
import GameEnd from "./components/GameEnd/GameEnd";
import Settings from "./components/Settings/Settings";
import Stats from "./components/Stats/Stats";

function getStatus({
  reviewing,
  started,
  result,
  hinting,
  thinking,
  viewOnly,
}) {
  if (reviewing) return "Game review";
  if (!started) return "";
  if (result) return "Game over";
  if (hinting) return "Calculating hint…";
  if (thinking) return "AI is thinking…";
  if (viewOnly) return "Reviewing game";
  return "Your turn";
}

export default function App() {
  // "home" (menu) | "setup" (nova partida) | "playing" | "review" (partida antiga)
  const [phase, setPhase] = useState("home");
  const started = phase === "playing";
  const reviewing = phase === "review";

  const [endDismissed, setEndDismissed] = useState(false);
  const [playerColor, setPlayerColor] = useState("w");
  const [level, setLevel] = useState(DEFAULT_LEVEL);
  const [manualFlip, setManualFlip] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
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

  // grava a partida quando ela termina
  useGameRecorder({ started, result, history, playerColor, level });

  // a confirmação do reinício expira sozinha
  useEffect(() => {
    if (!confirmingRestart) return;
    const id = setTimeout(() => setConfirmingRestart(false), 3000);
    return () => clearTimeout(id);
  }, [confirmingRestart]);

  function handleStart({ color, level }) {
    const resolved =
      color === "random" ? (Math.random() < 0.5 ? "w" : "b") : color;
    setPlayerColor(resolved);
    setLevel(level);
    setPhase("playing");
  }

  function handleNewGame() {
    chess.reset();
    ai.newGame();
    setEndDismissed(false);
    setManualFlip(false);
    setPhase("setup");
  }

  function handleUndo() {
    if (ai.thinking || history.length === 0) return;
    chess.undo(playerColor);
    setEndDismissed(false);
  }

  function requestRestart() {
    if (history.length > 0 && !confirmingRestart) {
      setConfirmingRestart(true);
      return;
    }
    setConfirmingRestart(false);
    handleNewGame();
  }

  function toggleHistory() {
    update("historyCollapsed", !settings.historyCollapsed);
  }

  // abre uma partida gravada: tabuleiro na posição inicial e histórico completo
  function handleOpenGame(record) {
    chess.load(record.moves);
    setPlayerColor(record.playerColor);
    setManualFlip(false);
    setShowStats(false);
    setPhase("review");
  }

  // sai da revisão e volta à lista de partidas
  function handleExitReview() {
    chess.reset();
    setPhase("home");
    setShowStats(true);
  }

  const isPlayerTurn = started && !result && game.turn() === playerColor;
  const minUndoLength = playerColor === "b" ? 1 : 0; // IA abre a partida de brancas
  const canUndo = started && !ai.thinking && history.length > minUndoLength;
  const canHint = isPlayerTurn && !ai.thinking && !ai.hinting && !viewOnly;

  const gameEndVisible = started && Boolean(result) && !endDismissed;
  const inGameScreen = started || reviewing;

  // atalhos funcionam no jogo e na revisão, desde que não haja janela aberta
  const shortcutsEnabled =
    inGameScreen && !showSettings && !showStats && !gameEndVisible;

  useKeyboardShortcuts(
    {
      h: () => canHint && ai.requestHint(),
      u: () => canUndo && handleUndo(),
      r: () => !reviewing && requestRestart(),
      f: () => setManualFlip((flipped) => !flipped),
      c: toggleHistory,
      ArrowLeft: () => chess.goToPlay(chess.currentPlay - 1),
      ArrowRight: () => chess.goToPlay(chess.currentPlay + 1),
      ArrowUp: () => chess.goToPlay(0),
      ArrowDown: () => chess.goToPlay(history.length),
    },
    shortcutsEnabled,
  );

  return (
    <div className="app">
      {phase !== "home" && (
        <button
          type="button"
          className="settings-fab"
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
        >
          <img className="gear-icon" src={gear} alt="settings" />
        </button>
      )}

      {phase === "home" && (
        <Home
          pieceSet={settings.pieceSet}
          onNewGame={() => setPhase("setup")}
          onStats={() => setShowStats(true)}
          onSettings={() => setShowSettings(true)}
        />
      )}

      {phase === "setup" && (
        <GameStart
          onStart={handleStart}
          onBack={() => setPhase("home")}
          pieceSet={settings.pieceSet}
        />
      )}

      {showStats && (
        <Stats
          pieceSet={settings.pieceSet}
          onOpenGame={handleOpenGame}
          onClose={() => setShowStats(false)}
        />
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

      {gameEndVisible && (
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
        locked={ai.thinking || game.turn() !== playerColor || reviewing}
        lastMove={chess.lastMove}
        highlightMove={chess.highlightMove}
        flipped={(playerColor === "b") !== manualFlip}
        hint={ai.hint}
        pieceSet={settings.pieceSet}
        captured={chess.captured}
        materialDiff={chess.materialDiff}
        annotationsEnabled={settings.showAnnotations}
        dragEnabled={settings.dragAndDrop}
      />

      <History
        moves={history}
        currentPlay={chess.currentPlay}
        onSelect={chess.goToPlay}
        onUndo={handleUndo}
        onHint={ai.requestHint}
        onFlip={() => setManualFlip((flipped) => !flipped)}
        onRestart={requestRestart}
        confirmingRestart={confirmingRestart}
        canUndo={canUndo}
        canHint={canHint}
        status={getStatus({
          reviewing,
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
        reviewing={reviewing}
        onExit={handleExitReview}
      />
    </div>
  );
}
