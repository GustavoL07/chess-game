import { useState, useEffect } from "react";
import { DEFAULT_SETTINGS } from "../constants";
import { PIECE_SETS } from "../utils/pieceSets";

const STORAGE_KEY = "chess-settings";

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const merged = { ...DEFAULT_SETTINGS, ...saved };
    if (!PIECE_SETS.includes(merged.pieceSet)) {
      merged.pieceSet = DEFAULT_SETTINGS.pieceSet;
    }
    return merged;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(load);

  useEffect(() => {
    const style = document.documentElement.style;
    style.setProperty("--page-bg", settings.pageBg);
    style.setProperty("--board-light", settings.boardLight);
    style.setProperty("--board-dark", settings.boardDark);
    style.setProperty("--accent", settings.accent);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // armazenamento indisponível: segue sem persistir
    }
  }, [settings]);

  function update(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function applyTheme(theme) {
    setSettings((prev) => ({
      ...prev,
      boardLight: theme.light,
      boardDark: theme.dark,
    }));
  }

  function reset() {
    setSettings({ ...DEFAULT_SETTINGS });
  }

  return { settings, update, applyTheme, reset };
}
