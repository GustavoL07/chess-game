// Atalhos mostrados no popup da tela inicial.
// Se mudar o mapa em App.jsx (useKeyboardShortcuts), atualize esta lista também.
export const SHORTCUTS = [
  { keys: ["H"], action: "Show a hint" },
  { keys: ["U"], action: "Undo your last move" },
  { keys: ["R"], action: "Restart (press twice to confirm)" },
  { keys: ["F"], action: "Flip the board" },
  { keys: ["C"], action: "Collapse or expand the history" },
  { keys: ["←", "→"], action: "Previous or next move" },
  { keys: ["↑", "↓"], action: "First position or current position" },
  { keys: ["Esc"], action: "Cancel a drag or close a window" },
];
