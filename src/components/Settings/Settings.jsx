import { useEffect, useRef, useState } from "react";
import { PIECE_SETS, getPieceUrl, formatSetName } from "../../utils/pieceSets";
import { BOARD_THEMES } from "../../constants";
import SettingGroup from "./SettingRows";
import Presets from "./Presets";
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
  presets,
  onApplyPreset,
  onSavePreset,
  onDeletePreset,
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

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  const rowProps = { settings, onChange };

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
              <>
                <h3 className="modal-subtitle">Presets</h3>
                <Presets
                  presets={presets}
                  settings={settings}
                  onApply={onApplyPreset}
                  onSave={onSavePreset}
                  onDelete={onDeletePreset}
                />

                <h3 className="modal-subtitle">Piece set</h3>
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
              </>
            )}

            {tab === "board" && (
              <>
                <SettingGroup tab="board" group="Grid" {...rowProps} />

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

                <SettingGroup tab="board" group="Custom colors" {...rowProps} />
              </>
            )}

            {tab === "highlights" && (
              <SettingGroup tab="highlights" {...rowProps} />
            )}

            {tab === "interface" && (
              <SettingGroup tab="interface" {...rowProps} />
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
