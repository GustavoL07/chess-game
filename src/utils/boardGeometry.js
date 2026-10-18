import { toSquareNotation, squareToPosition } from "./pieces";

export const BOARD_INDICES = [0, 1, 2, 3, 4, 5, 6, 7];

export function getOrder(flipped) {
  return flipped ? [...BOARD_INDICES].reverse() : BOARD_INDICES;
}

export function toVisualPosition(square, flipped) {
  const { row, col } = squareToPosition(square);
  return {
    row: flipped ? 7 - row : row,
    col: flipped ? 7 - col : col,
  };
}

export function squareFromPointer(
  event,
  boardElement,
  flipped,
  { strict = false } = {},
) {
  const rect = boardElement.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  if (strict && (x < 0 || x >= 1 || y < 0 || y >= 1)) return null;

  const clamp = (n) => Math.min(7, Math.max(0, n));
  const col = clamp(Math.floor(x * 8));
  const row = clamp(Math.floor(y * 8));
  return toSquareNotation(flipped ? 7 - row : row, flipped ? 7 - col : col);
}
