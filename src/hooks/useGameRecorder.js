import { useEffect, useRef } from "react";
import { saveGame, deleteGame } from "../utils/gameStorage";

export function useGameRecorder({
  started,
  result,
  history,
  playerColor,
  level,
}) {
  const savedId = useRef(null);
  const finished = Boolean(result);

  useEffect(() => {
    if (!started) {
      savedId.current = null;
      return;
    }

    if (finished && !savedId.current) {
      const id = String(Date.now());
      saveGame({
        id,
        date: Date.now(),
        moves: history,
        result,
        playerColor,
        level,
      });
      savedId.current = id;
    } else if (!finished && savedId.current) {
      deleteGame(savedId.current);
      savedId.current = null;
    }
  }, [started, finished]);
}
