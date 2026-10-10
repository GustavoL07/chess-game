const files = import.meta.glob("../assets/pieces/*/*.{svg,png,webp}", {
  eager: true,
  import: "default",
});

const PIECE_KEYS = ["wk", "wq", "wr", "wb", "wn", "wp", "bk", "bq", "br", "bb", "bn", "bp"];

const allSets = {};
for (const [path, url] of Object.entries(files)) {
  const match = path.match(/pieces\/([^/]+)\/([wb][kqrbnp])\.(?:svg|png|webp)$/i);
  if (!match) continue;
  const [, setName, key] = match;
  (allSets[setName] ??= {})[key.toLowerCase()] = url;
}

// só entram conjuntos com as 12 peças
const sets = {};
for (const [name, pieces] of Object.entries(allSets)) {
  const missing = PIECE_KEYS.filter((k) => !pieces[k]);
  if (missing.length === 0) {
    sets[name] = pieces;
  } else if (import.meta.env.DEV) {
    console.warn(`[pieceSets] "${name}" ignorado, faltam: ${missing.join(", ")}`);
  }
}

export const PIECE_SETS = Object.keys(sets).sort();

export const DEFAULT_PIECE_SET = PIECE_SETS.includes("classic")
  ? "classic"
  : PIECE_SETS[0];

export function formatSetName(name) {
  const text = name.replace(/[_-]/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// color: "w" | "b"   type: "k" | "q" | "r" | "b" | "n" | "p"
export function getPieceUrl(setName, color, type) {
  const set = sets[setName] ?? sets[DEFAULT_PIECE_SET];
  return set?.[color + type];
}