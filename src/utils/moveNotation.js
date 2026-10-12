const PIECE_TYPES = { K: "k", Q: "q", R: "r", B: "b", N: "n" };

// Quebra a notação SAN em pedaços de texto e peças, para trocar as letras por imagens:
//   "Nxe5+"   -> [{ piece: "n" }, "xe5+"]
//   "exd8=Q#" -> ["exd8=", { piece: "q" }, "#"]
//   "e4", "O-O" -> sem peças, ficam como texto
export function splitMove(san) {
  const parts = [];
  let rest = san;

  // peça no início (Cf3, Dxd5, Rg1...). Peões não têm letra.
  if (PIECE_TYPES[rest[0]]) {
    parts.push({ piece: PIECE_TYPES[rest[0]] });
    rest = rest.slice(1);
  }

  // promoção (e8=Q)
  const promotion = rest.match(/^(.*=)([QRBN])(.*)$/);
  if (promotion) {
    const [, before, letter, after] = promotion;
    parts.push(before, { piece: PIECE_TYPES[letter] });
    if (after) parts.push(after);
  } else if (rest) {
    parts.push(rest);
  }

  return parts;
}
