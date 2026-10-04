import { useState, useEffect, useRef } from "react";
import { createEngine } from "../utils/engine";
import { AI_DELAY_MS, HINT_SKILL } from "../constants";

export function useAI({ game, started, playerColor, level, history, onMove }) {
  const engineRef = useRef(null);
  const onMoveRef = useRef(onMove);
  const [thinking, setThinking] = useState(false);
  const [hint, setHint] = useState(null);
  const [hinting, setHinting] = useState(false);

  useEffect(() => {
    onMoveRef.current = onMove;
  });

  useEffect(() => {
    engineRef.current = createEngine();
    return () => engineRef.current?.terminate();
  }, []);

  useEffect(() => {
    setHint(null);
  }, [history]);

  useEffect(() => {
    if (!started || game.turn() === playerColor || game.isGameOver()) return;

    let cancelled = false;
    setThinking(true);

    const timeoutId = setTimeout(async () => {
      try {
        const uci = await engineRef.current.getBestMove(game.fen(), level);
        if (cancelled || !uci) return;
        const move = game.move({
          from: uci.slice(0, 2),
          to: uci.slice(2, 4),
          promotion: uci[4],
        });
        onMoveRef.current(move);
      } catch (error) {
        console.error("Falha ao obter a jogada da IA:", error);
      }
    }, AI_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      setThinking(false);
    };
  }, [history, level, started, playerColor, game]);

  async function requestHint() {
    setHinting(true);
    try {
      const uci = await engineRef.current.getBestMove(game.fen(), HINT_SKILL);
      if (uci) setHint({ from: uci.slice(0, 2), to: uci.slice(2, 4) });
    } catch (error) {}
    setHinting(false);
  }

  function newGame() {
    setHint(null);
    engineRef.current?.newGame();
  }

  return { thinking, hint, hinting, requestHint, newGame };
}
