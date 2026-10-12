import { DEFAULT_PIECE_SET } from "./utils/pieceSets";
export const DEFAULT_LEVEL = 10;
export const AI_DELAY_MS = 600;
export const HINT_SKILL = 20;

export const DEFAULT_SETTINGS = {
  pieceSet: DEFAULT_PIECE_SET,
  pageBg: "#1f1e1b",
  boardLight: "#ddd4c6",
  boardDark: "#0d453e",
  accent: "#165476",

  showMoveHints: true,
  moveHintColor: "#00ff00",
  showSelected: true,
  selectedColor: "#ffea00",
  showCaptures: true,
  showCaptured: true,
  captureColor: "#ff4d4d",
  showHint: true,
  hintColor: "#4da3ff",
  showCoordinates: true,
  showLastMove: true,
  lastMoveColor: "#f5c542",
  showAnnotations: true,
  annotationColor: "#b36bff",
};

export const BOARD_THEMES = [
  { id: "forest", label: "Forest", light: "#ddd4c6", dark: "#0d453e" },
  { id: "ocean", label: "Ocean", light: "#dee8ed", dark: "#245678" },
  { id: "classic", label: "Classic", light: "#f0d9b5", dark: "#b58863" },
  { id: "midnight", label: "Midnight", light: "#c9d1d9", dark: "#343a40" },
  { id: "lavender", label: "Lavender", light: "#e6dff0", dark: "#7868a6" },
  { id: "rose", label: "Rose", light: "#f4d6d8", dark: "#b56576" },
  { id: "sunset", label: "Sunset", light: "#f8dfc4", dark: "#c05a45" },
  { id: "desert", label: "Desert", light: "#ead8b5", dark: "#9b7653" },
  { id: "mint", label: "Mint", light: "#d8f0e3", dark: "#43866b" },
  { id: "ice", label: "Ice", light: "#e5f4f9", dark: "#5b9bb5" },
  { id: "cherry", label: "Cherry", light: "#f2d5d9", dark: "#8e354a" },
  { id: "coffee", label: "Coffee", light: "#e6d5c3", dark: "#634832" },
  { id: "slate", label: "Slate", light: "#d9e0e7", dark: "#596b7c" },
  { id: "emerald", label: "Emerald", light: "#d4eadb", dark: "#176b50" },
  { id: "sapphire", label: "Sapphire", light: "#d8e5f7", dark: "#2855a6" },
  { id: "ruby", label: "Ruby", light: "#f3d6d9", dark: "#982b3c" },
  { id: "amethyst", label: "Amethyst", light: "#e8d9f2", dark: "#754c91" },
  { id: "autumn", label: "Autumn", light: "#f0d7b5", dark: "#a64b2a" },
  { id: "spring", label: "Spring", light: "#e6efcf", dark: "#78964b" },
  { id: "monochrome", label: "Monochrome", light: "#eeeeee", dark: "#555555" },
  { id: "charcoal", label: "Charcoal", light: "#c5c5c5", dark: "#292929" },
  { id: "gold", label: "Gold", light: "#f5e6b8", dark: "#a68127" },
  { id: "coral", label: "Coral", light: "#f9d6c5", dark: "#d65f50" },
  { id: "teal", label: "Teal", light: "#d4e9e6", dark: "#287d78" },
  { id: "nord", label: "Nord", light: "#e5e9f0", dark: "#4c566a" },
  { id: "dracula", label: "Dracula", light: "#e2dff4", dark: "#44475a" },
  { id: "cyberpunk", label: "Cyberpunk", light: "#f5e6a8", dark: "#6b3fa0" },
  { id: "candy", label: "Candy", light: "#f8dff0", dark: "#83b9e5" },
  { id: "volcano", label: "Volcano", light: "#f2d4bd", dark: "#873b2e" },
  { id: "arctic", label: "Arctic", light: "#eaf3f8", dark: "#527d99" },
];

// o que cada preset guarda (só aparência; interruptores não entram)
export const PRESET_KEYS = [
  "pieceSet",
  "boardLight",
  "boardDark",
  "pageBg",
  "accent",
  "moveHintColor",
  "selectedColor",
  "captureColor",
  "hintColor",
  "lastMoveColor",
  "annotationColor",
];

export const MAX_SAVED_PRESETS = 3;

export const BUILT_IN_PRESETS = [
  {
    id: "classic",
    name: "Classic",
    values: {
      pieceSet: "classic",
      boardLight: "#f0d9b5",
      boardDark: "#b58863",
      pageBg: "#1f1e1b",
      accent: "#81b64c",
    },
  },
  {
    id: "wood",
    name: "Wood",
    values: {
      pieceSet: "neo_wood",
      boardLight: "#ecd9b5",
      boardDark: "#a3774e",
      pageBg: "#1c1713",
      accent: "#d9a441",
    },
  },
  {
    id: "knights",
    name: "Knights",
    values: {
      pieceSet: "8qetl",
      boardLight: "#c5c5c5",
      boardDark: "#292929",
      pageBg: "#1f1e1b",
      accent: "#1f6b93",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    values: {
      pieceSet: "ocean",
      boardLight: "#dee3e6",
      boardDark: "#8ca2ad",
      pageBg: "#111a21",
      accent: "#3a8fd9",
    },
  },
  {
    id: "icy",
    name: "Icy",
    values: {
      pieceSet: "icy_sea",
      boardLight: "#e6f0f5",
      boardDark: "#6f9bb3",
      pageBg: "#10181d",
      accent: "#5cc8e8",
    },
  },
  {
    id: "neon",
    name: "Neon",
    values: {
      pieceSet: "neon",
      boardLight: "#2e2e4d",
      boardDark: "#16162b",
      pageBg: "#0b0b17",
      accent: "#00e5ff",
    },
  },
];
