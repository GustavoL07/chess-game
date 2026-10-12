import { useEffect, useRef, useState } from "react";
import { PIECE_SETS, getPieceUrl, formatSetName } from "../../utils/pieceSets";
import { BOARD_THEMES } from "../../constants";
import "./Settings.css";

const PREVIEW = [
  "bp",
  "bb",
  "bn",
  "br",
  "bq",
  "bk",
  "wp",
  "wb",
  "wn",
  "wr",
  "wq",
  "wk",
];

const TABS = [
  { id: "pieces", label: "Pieces" },
  { id: "board", label: "Board" },
  { id: "highlights", label: "Highlights" },
  { id: "interface", label: "Interface" },
];

export default function Settings({
  settings,
  onChange,
  onApplyTheme,
  onReset,
  onClose,
}) {
  const [tab, setTab] = useState("pieces");
  const bodyRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ao trocar de aba, volta ao topo
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="st-title"
      >
        <header className="settings-head">
          <h2 id="st-title" className="modal-title">
            Settings
          </h2>

          <div className="settings-preview" aria-hidden="true">
            {PREVIEW.map((key, i) => (
              <div key={key} className={i % 2 === 1 ? "dark" : "light"}>
                <img
                  src={getPieceUrl(settings.pieceSet, key[0], key[1])}
                  alt=""
                />
              </div>
            ))}
          </div>

          <div className="settings-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                aria-controls="settings-panel"
                className={`settings-tab ${tab === t.id ? "active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>

        <div
          className="settings-body"
          ref={bodyRef}
          id="settings-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
        >
          <div className="settings-panel">
            {tab === "pieces" && (
              <div className="piece-grid">
                {PIECE_SETS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={`piece-option ${settings.pieceSet === name ? "active" : ""}`}
                    onClick={() => onChange("pieceSet", name)}
                  >
                    <span className="piece-option-images">
                      <img src={getPieceUrl(name, "w", "n")} alt="" />
                      <img src={getPieceUrl(name, "b", "n")} alt="" />
                    </span>
                    <span className="piece-option-name">
                      {formatSetName(name)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {tab === "board" && (
              <>
                <h3 className="modal-subtitle">Grid</h3>
                <div className="setting-group">
                  <ToggleRow
                    label="Square names"
                    description="Letters and numbers around the board"
                    enabled={settings.showCoordinates}
                    onToggle={(v) => onChange("showCoordinates", v)}
                  />
                </div>
                <h3 className="modal-subtitle">Themes</h3>
                <div className="theme-grid">
                  {BOARD_THEMES.map((theme) => {
                    const active =
                      settings.boardLight === theme.light &&
                      settings.boardDark === theme.dark;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        className={`theme-option ${active ? "active" : ""}`}
                        onClick={() => onApplyTheme(theme)}
                        aria-label={`${theme.label} board`}
                      >
                        <span
                          className="theme-swatch"
                          style={{ "--l": theme.light, "--d": theme.dark }}
                        />
                        <span className="theme-name">{theme.label}</span>
                      </button>
                    );
                  })}
                </div>

                <h3 className="modal-subtitle">Custom colors</h3>
                <div className="setting-group">
                  <ColorRow
                    label="Light squares"
                    value={settings.boardLight}
                    onChange={(v) => onChange("boardLight", v)}
                  />
                  <ColorRow
                    label="Dark squares"
                    value={settings.boardDark}
                    onChange={(v) => onChange("boardDark", v)}
                  />
                </div>
              </>
            )}

            {tab === "highlights" && (
              <div className="setting-group">
                <ToggleRow
                  label="Last move"
                  description="Marks the squares of the previous move"
                  enabled={settings.showLastMove}
                  color={settings.lastMoveColor}
                  onToggle={(v) => onChange("showLastMove", v)}
                  onColor={(v) => onChange("lastMoveColor", v)}
                />
                <ToggleRow
                  label="Possible moves"
                  description="Dots on the squares a piece can reach"
                  enabled={settings.showMoveHints}
                  color={settings.moveHintColor}
                  onToggle={(v) => onChange("showMoveHints", v)}
                  onColor={(v) => onChange("moveHintColor", v)}
                />
                <ToggleRow
                  label="Selected piece"
                  description="Outline and lift on the chosen piece"
                  enabled={settings.showSelected}
                  color={settings.selectedColor}
                  onToggle={(v) => onChange("showSelected", v)}
                  onColor={(v) => onChange("selectedColor", v)}
                />
                <ToggleRow
                  label="Capturable pieces"
                  description="Ring around pieces you can take"
                  enabled={settings.showCaptures}
                  color={settings.captureColor}
                  onToggle={(v) => onChange("showCaptures", v)}
                  onColor={(v) => onChange("captureColor", v)}
                />
                <ToggleRow
                  label="AI hint"
                  description="Piece to move and its target square"
                  enabled={settings.showHint}
                  color={settings.hintColor}
                  onToggle={(v) => onChange("showHint", v)}
                  onColor={(v) => onChange("hintColor", v)}
                />
              </div>
            )}

            {tab === "interface" && (
              <div className="setting-group">
                <ColorRow
                  label="Page background"
                  value={settings.pageBg}
                  onChange={(v) => onChange("pageBg", v)}
                />
                <ColorRow
                  label="Accent color"
                  value={settings.accent}
                  onChange={(v) => onChange("accent", v)}
                />
              </div>
            )}
          </div>
        </div>

        <footer className="settings-footer">
          <button type="button" className="secondary-button" onClick={onReset}>
            Reset to defaults
          </button>
          <button type="button" className="start-button" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}

function ColorRow({ label, value, onChange }) {
  return (
    <label className="setting-row">
      <span className="setting-text">
        <span className="setting-label">{label}</span>
      </span>
      <input
        className="setting-color"
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function ToggleRow({ label, description, enabled, color, onToggle, onColor }) {
  return (
    <div className="setting-row">
      <label className="setting-main">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span className="toggle-track" />
        <span className="setting-text">
          <span className="setting-label">{label}</span>
          <span className="setting-desc">{description}</span>
        </span>
      </label>

      {onColor && (
        <input
          className="setting-color"
          type="color"
          value={color}
          disabled={!enabled}
          onChange={(e) => onColor(e.target.value)}
          aria-label={`${label} color`}
        />
      )}
    </div>
  );
}
