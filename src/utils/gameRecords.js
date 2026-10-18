const REASON_TITLES = {
  stalemate: "Stalemate",
  insufficient: "Insufficient material",
  threefold: "Threefold repetition",
  fiftymove: "50-move rule",
};

// Título de uma partida: "White won", "Black won", "Stalemate"...
export function getResultTitle(result) {
  if (result.type === "win") {
    return `${result.winner === "w" ? "White" : "Black"} won`;
  }
  return REASON_TITLES[result.reason] ?? "Draw";
}

// Resultado do ponto de vista de quem jogou: "win" | "loss" | "draw"
export function getOutcome(game) {
  if (game.result.type === "draw") return "draw";
  return game.result.winner === game.playerColor ? "win" : "loss";
}

// dd/mm/aa hh:mm
export function formatDate(timestamp) {
  const d = new Date(timestamp);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${pad(d.getFullYear() % 100)} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

export function getStats(games) {
  const stats = {
    total: games.length,
    asWhite: 0,
    asBlack: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0,
  };

  for (const game of games) {
    if (game.playerColor === "w") stats.asWhite += 1;
    else stats.asBlack += 1;

    const outcome = getOutcome(game);
    if (outcome === "win") stats.wins += 1;
    else if (outcome === "loss") stats.losses += 1;
    else stats.draws += 1;
  }

  stats.winRate = stats.total
    ? Math.round((stats.wins / stats.total) * 100)
    : 0;
  return stats;
}
