// skill 1 → depth 1 | skill 20 → depth 18
export function skillToDepth(skill) {
  return Math.round(1 + ((skill - 1) * 17) / 19);
}

// skill 1 → 200ms | skill 20 → 2100ms
export function skillToMovetime(skill) {
  return 100 + skill * 100;
}

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

  function getBestMove(fen, skill = 10) {
    const depth = skillToDepth(skill);
    const movetime = skillToMovetime(skill);

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
