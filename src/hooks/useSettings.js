import { useState, useEffect } from "react";
import {
  DEFAULT_SETTINGS,
  PRESET_KEYS,
  BUILT_IN_PRESETS,
  MAX_SAVED_PRESETS,
} from "../constants";
import { PIECE_SETS } from "../utils/pieceSets";

const SETTINGS_KEY = "chess-settings";
const PRESETS_KEY = "chess-presets";

// configuração -> variável CSS em :root
const COLOR_VARS = {
  pageBg: "--page-bg",
  boardLight: "--board-light",
  boardDark: "--board-dark",
  accent: "--accent",
  moveHintColor: "--move-hint",
  selectedColor: "--select-color",
  captureColor: "--capture-color",
  hintColor: "--hint-color",
  lastMoveColor: "--last-move",
  annotationColor: "--annotation-color",
};

// interruptor -> atributo em :root que esconde o destaque quando a opção está desligada
const HIDE_ATTRS = {
  showMoveHints: "data-hide-move-hints",
  showSelected: "data-hide-selected",
  showCaptures: "data-hide-captures",
  showHint: "data-hide-hint",
  showLastMove: "data-hide-last-move",
  showCoordinates: "data-hide-coordinates",
  showCaptured: "data-hide-captured",
};

function readJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // armazenamento indisponível: segue sem persistir
  }
}

function loadSettings() {
  const merged = { ...DEFAULT_SETTINGS, ...readJSON(SETTINGS_KEY) };
  if (!PIECE_SETS.includes(merged.pieceSet)) {
    merged.pieceSet = DEFAULT_SETTINGS.pieceSet;
  }
  return merged;
}

function loadSavedPresets() {
  const saved = readJSON(PRESETS_KEY);
  if (!Array.isArray(saved)) return [];
  return saved.filter((p) => p && p.id && p.name && p.values);
}

// Preferências visuais: aplica como variáveis CSS e salva no navegador.
// Também gerencia os presets (combinações de aparência).
export function useSettings() {
  const [settings, setSettings] = useState(loadSettings);
  const [savedPresets, setSavedPresets] = useState(loadSavedPresets);

  useEffect(() => {
    const root = document.documentElement;

    for (const [key, cssVar] of Object.entries(COLOR_VARS)) {
      root.style.setProperty(cssVar, settings[key]);
    }
    for (const [key, attr] of Object.entries(HIDE_ATTRS)) {
      root.toggleAttribute(attr, !settings[key]);
    }

    writeJSON(SETTINGS_KEY, settings);
  }, [settings]);

  useEffect(() => {
    writeJSON(PRESETS_KEY, savedPresets);
  }, [savedPresets]);

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

  // ---- presets ----

  // os de fábrica só aparecem se o conjunto de peças deles existir em assets/pieces
  const builtIn = BUILT_IN_PRESETS.filter(
    (p) => !p.values.pieceSet || PIECE_SETS.includes(p.values.pieceSet),
  ).map((p) => ({ ...p, builtIn: true }));

  const presets = [...builtIn, ...savedPresets];

  function applyPreset(preset) {
    const values = { ...preset.values };
    // um preset salvo pode apontar para um conjunto de peças que não existe mais
    if (values.pieceSet && !PIECE_SETS.includes(values.pieceSet)) {
      delete values.pieceSet;
    }
    setSettings((prev) => ({ ...prev, ...values }));
  }

  function savePreset(name) {
    const values = Object.fromEntries(PRESET_KEYS.map((k) => [k, settings[k]]));
    setSavedPresets((prev) =>
      prev.length >= MAX_SAVED_PRESETS
        ? prev
        : [...prev, { id: `user-${Date.now()}`, name, values }],
    );
  }

  function deletePreset(id) {
    setSavedPresets((prev) => prev.filter((p) => p.id !== id));
  }

  return {
    settings,
    update,
    applyTheme,
    reset,
    presets,
    applyPreset,
    savePreset,
    deletePreset,
  };
}