export function getResult(game) {
  if (game.isCheckmate()) {
    return { type: "win", winner: game.turn() === "w" ? "b" : "w" };
  }

  if (game.isStalemate()) return { type: "draw", reason: "stalemate" };

  if (game.isInsufficientMaterial())
    return { type: "draw", reason: "insufficient" };
  if (game.isThreefoldRepetition())
    return { type: "draw", reason: "threefold" };

  if (game.isDraw()) return { type: "draw", reason: "fiftymove" };

  return null;
}
