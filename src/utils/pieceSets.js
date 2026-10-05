// Descobre sozinho os conjuntos de peças em src/assets/pieces/<nome>/<cor><tipo>.svg
// Ex.: src/assets/pieces/cburnett/wk.svg  (w/b + k,q,r,b,n,p, tudo minúsculo)
// Para adicionar um conjunto novo, basta criar a pasta com os 12 SVGs.
const files = import.meta.glob("../assets/pieces/*/*.svg", {
  eager: true,
  import: "default",
});

const sets = {};
for (const [path, url] of Object.entries(files)) {
  const match = path.match(/pieces\/([^/]+)\/([wb][kqrbnp])\.svg$/);
  if (!match) continue;
  const [, setName, key] = match;
  (sets[setName] ??= {})[key] = url;
}

export const PIECE_SETS = Object.keys(sets);

export function formatSetName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// color: "w" | "b"   type: "k" | "q" | "r" | "b" | "n" | "p"
export function getPieceUrl(setName, color, type) {
  const set = sets[setName] ?? sets.cburnett ?? Object.values(sets)[0];
  return set?.[color + type];
}
