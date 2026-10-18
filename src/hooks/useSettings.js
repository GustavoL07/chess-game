import { useState, useEffect } from "react";
import { BUILT_IN_PRESETS, MAX_SAVED_PRESETS } from "../constants";
import {
  DEFAULT_SETTINGS,
  COLOR_VARS,
  HIDE_ATTRS,
  PRESET_KEYS,
} from "../settings/schema";
import { PIECE_SETS } from "../utils/pieceSets";

const SETTINGS_KEY = "chess-settings";
const PRESETS_KEY = "chess-presets";

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
  } catch {}
}

function loadSettings() {
  const saved = readJSON(SETTINGS_KEY) ?? {};
  const merged = { ...DEFAULT_SETTINGS };

  for (const [key, fallback] of Object.entries(DEFAULT_SETTINGS)) {
    if (key === "pieceSet") continue;
    if (typeof saved[key] === typeof fallback) merged[key] = saved[key];
  }

  if (PIECE_SETS.includes(saved.pieceSet)) merged.pieceSet = saved.pieceSet;

  return merged;
}

function loadSavedPresets() {
  const saved = readJSON(PRESETS_KEY);
  if (!Array.isArray(saved)) return [];
  return saved.filter((p) => p && p.id && p.name && p.values);
}

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

  const builtIn = BUILT_IN_PRESETS.filter(
    (p) => !p.values.pieceSet || PIECE_SETS.includes(p.values.pieceSet),
  ).map((p) => ({ ...p, builtIn: true }));

  const presets = [...builtIn, ...savedPresets];

  function applyPreset(preset) {
    const values = { ...preset.values };
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
