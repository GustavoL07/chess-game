import { useEffect, useRef } from "react";
import { saveGame, deleteGame } from "../utils/gameStorage";

// Grava a partida quando ela termina. Se o jogador desfizer o lance final e a
// partida voltar a estar em andamento, o registro é apagado (e gravado de novo
// quando ela terminar outra vez).
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
    // fora de uma partida (menu, nova partida, revisão): zera o controle
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
    // só reage ao início e ao fim da partida; os outros valores são lidos nesse instante
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, finished]);
}
