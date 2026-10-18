import { DEFAULT_PIECE_SET } from "../utils/pieceSets";

export const SETTINGS_ROWS = [
  // ---- Board ----
  {
    tab: "board",
    group: "Grid",
    label: "Square names",
    description: "Letters and numbers around the board",
    toggle: {
      key: "showCoordinates",
      default: true,
      attr: "data-hide-coordinates",
    },
  },
  {
    tab: "board",
    group: "Grid",
    label: "Captured pieces",
    description: "Taken pieces and material advantage",
    toggle: { key: "showCaptured", default: true, attr: "data-hide-captured" },
  },
  {
    tab: "board",
    group: "Custom colors",
    label: "Light squares",
    color: { key: "boardLight", default: "#ddd4c6", cssVar: "--board-light" },
  },
  {
    tab: "board",
    group: "Custom colors",
    label: "Dark squares",
    color: { key: "boardDark", default: "#0d453e", cssVar: "--board-dark" },
  },

  // ---- Highlights ----
  {
    tab: "highlights",
    label: "Last move",
    description: "Marks the squares of the previous move",
    toggle: { key: "showLastMove", default: true, attr: "data-hide-last-move" },
    color: { key: "lastMoveColor", default: "#f5c542", cssVar: "--last-move" },
  },
  {
    tab: "highlights",
    label: "Possible moves",
    description: "Dots on the squares a piece can reach",
    toggle: {
      key: "showMoveHints",
      default: true,
      attr: "data-hide-move-hints",
    },
    color: { key: "moveHintColor", default: "#00ff00", cssVar: "--move-hint" },
  },
  {
    tab: "highlights",
    label: "Selected piece",
    description: "Outline and lift on the chosen piece",
    toggle: { key: "showSelected", default: true, attr: "data-hide-selected" },
    color: {
      key: "selectedColor",
      default: "#ffea00",
      cssVar: "--select-color",
    },
  },
  {
    tab: "highlights",
    label: "Capturable pieces",
    description: "Ring around pieces you can take",
    toggle: { key: "showCaptures", default: true, attr: "data-hide-captures" },
    color: {
      key: "captureColor",
      default: "#ff4d4d",
      cssVar: "--capture-color",
    },
  },
  {
    tab: "highlights",
    label: "AI hint",
    description: "Piece to move and its target square",
    toggle: { key: "showHint", default: true, attr: "data-hide-hint" },
    color: { key: "hintColor", default: "#4da3ff", cssVar: "--hint-color" },
  },
  {
    tab: "highlights",
    label: "Arrows and circles",
    description: "Right-click to draw, left-click to clear",
    toggle: { key: "showAnnotations", default: true }, // prop do Board
    color: {
      key: "annotationColor",
      default: "#b36bff",
      cssVar: "--annotation-color",
    },
  },

  // ---- Interface ----
  {
    tab: "interface",
    label: "Page background",
    color: { key: "pageBg", default: "#1f1e1b", cssVar: "--page-bg" },
  },
  {
    tab: "interface",
    label: "Accent color",
    color: { key: "accent", default: "#165476", cssVar: "--accent" },
  },
  {
    tab: "interface",
    label: "Piece icons in moves",
    description: "Show pieces as images instead of letters (Nf3)",
    toggle: { key: "showMoveIcons", default: false }, // prop do History
  },
  {
    tab: "interface",
    label: "Drag and drop",
    description: "Move pieces by dragging, besides clicking",
    toggle: { key: "dragAndDrop", default: true }, // prop do Board
  },
];

// Configurações sem linha na lista: o conjunto de peças tem a sua própria grade
// no Settings, e o histórico recolhido é alterado pelo botão ‹ › e pela tecla C.
const STANDALONE_DEFAULTS = {
  pieceSet: DEFAULT_PIECE_SET,
  historyCollapsed: false,
};

const toggles = SETTINGS_ROWS.filter((row) => row.toggle).map(
  (row) => row.toggle,
);
const colors = SETTINGS_ROWS.filter((row) => row.color).map((row) => row.color);

// uma chave repetida (copiar e colar uma entrada) apagaria uma configuração em silêncio
const keys = [
  ...Object.keys(STANDALONE_DEFAULTS),
  ...toggles.map((t) => t.key),
  ...colors.map((c) => c.key),
];
const duplicated = keys.filter((key, i) => keys.indexOf(key) !== i);
if (duplicated.length > 0) {
  throw new Error(
    `settings/schema.js: chave repetida: ${duplicated.join(", ")}`,
  );
}

export const DEFAULT_SETTINGS = Object.fromEntries([
  ...Object.entries(STANDALONE_DEFAULTS),
  ...toggles.map((t) => [t.key, t.default]),
  ...colors.map((c) => [c.key, c.default]),
]);

// configuração -> variável CSS em :root
export const COLOR_VARS = Object.fromEntries(
  colors.filter((c) => c.cssVar).map((c) => [c.key, c.cssVar]),
);

// interruptor -> atributo em :root que esconde o destaque quando a opção está desligada
export const HIDE_ATTRS = Object.fromEntries(
  toggles.filter((t) => t.attr).map((t) => [t.key, t.attr]),
);

// O que um preset guarda: o conjunto de peças e todas as cores.
// Interruptores não entram (são preferências de comportamento, não de aparência).
export const PRESET_KEYS = ["pieceSet", ...colors.map((c) => c.key)];
