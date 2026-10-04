export const LEVELS = {
  iniciante: { skill: 0, depth: 1, movetime: 150 },
  intermediario: { skill: 8, depth: 8, movetime: 500 },
  avancado: { skill: 14, depth: 12, movetime: 1000 },
  mestre: { skill: 20, depth: 16, movetime: 2000 },
};

export function createEngine(path = "/stockfish/stockfish-19-lite-single.js") {
  const worker = new Worker(path);
  let pending = null;

  worker.onmessage = (e) => {
    const line = typeof e.data === "string" ? e.data : "";
    if (line.startsWith("bestmove") && pending) {
      const uci = line.split(" ")[1];
      pending(uci === "(none)" ? null : uci);
      pending = null;
    }
  };

  const send = (cmd) => worker.postMessage(cmd);
  send("uci");
  send("isready");

  function getBestMove(fen, levelName = "intermediario") {
    const { skill, depth, movetime } = LEVELS[levelName];
    return new Promise((resolve) => {
      pending = resolve;
      send(`setoption name Skill Level value ${skill}`);
      send(`position fen ${fen}`);
      send(`go depth ${depth} movetime ${movetime}`);
    });
  }

  function newGame() {
    send("ucinewgame");
  }

  function terminate() {
    worker.terminate();
  }

  return { getBestMove, newGame, terminate };
}
