import { useState, useEffect } from "react";
import { Chess } from "chess.js";

// Reproduz uma partida lance a lance, em loop. Só para exibição (tela inicial).
// moves: lista de lances em SAN. Devolve { board, lastMove } do momento atual.
export function useDemoGame(
  moves,
  { startDelay = 1200, moveDelay = 1500, endPause = 5000 } = {},
) {
  const [frame, setFrame] = useState(() => ({
    board: new Chess().board(),
    lastMove: null,
  }));

  useEffect(() => {
    const game = new Chess();
    let index = 0;
    let id = 0;
    let timer;

    function publish(lastMove) {
      setFrame({
        board: game.board(),
        // o id muda a cada lance, para a animação da peça reiniciar
        lastMove: lastMove ? { ...lastMove, id: ++id } : null,
      });
    }

    // fim da partida: espera um pouco e recomeça do zero
    function restart() {
      game.reset();
      index = 0;
      publish(null);
      timer = setTimeout(step, startDelay);
    }

    function step() {
      const move = game.move(moves[index++]);
      publish({ from: move.from, to: move.to });

      timer =
        index >= moves.length
          ? setTimeout(restart, endPause)
          : setTimeout(step, moveDelay);
    }

    timer = setTimeout(step, startDelay);
    return () => clearTimeout(timer);
  }, [moves, startDelay, moveDelay, endPause]);

  return frame;
}
