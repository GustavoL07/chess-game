export const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9 };
const DISPLAY_ORDER = ["p", "n", "b", "r", "q"];

export function getCaptured(moveHistory, upTo = moveHistory.length) {
  const result = { w: [], b: [] };

  for (const move of moveHistory.slice(0, upTo)) {
    if (move.captured) result[move.color].push(move.captured);
  }

  for (const color of ["w", "b"]) {
    result[color].sort(
      (a, b) => DISPLAY_ORDER.indexOf(a) - DISPLAY_ORDER.indexOf(b),
    );
  }
  return result;
}

export function getMaterialDiff(fen) {
  const placement = fen.split(" ")[0];
  let diff = 0;

  for (const char of placement) {
    const value = PIECE_VALUES[char.toLowerCase()];
    if (!value) continue;
    diff += char === char.toUpperCase() ? value : -value;
  }
  return diff;
}
