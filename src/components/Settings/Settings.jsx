import { useEffect } from "react";
import { PIECE_SETS, getPieceUrl, formatSetName } from "../../utils/pieceSets";
import { BOARD_THEMES } from "../../constants";
import "./Settings.css";

// 2 linhas x 4 colunas, só para visualizar peças e cores juntas
const PREVIEW = ["br", "bq", "bk", "bn", "wp", "wr", "wk", "wn"];

export default function Settings({
  settings,
  onChange,
  onApplyTheme,
  onReset,
  onClose,
}) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
        <h2 id="st-title" className="modal-title">
          Settings
        </h2>

        <div className="settings-preview" aria-hidden="true">
          {PREVIEW.map((key, i) => {
            const isDark = ((i % 4) + Math.floor(i / 4)) % 2 === 1;
            return (
              <div key={key} className={isDark ? "dark" : "light"}>
                <img src={getPieceUrl(settings.pieceSet, key[0], key[1])} alt="" />
              </div>
            );
          })}
        </div>

        <section className="modal-section">
          <h3 className="modal-subtitle">Pieces</h3>
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
                <span className="piece-option-name">{formatSetName(name)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="modal-section">
          <h3 className="modal-subtitle">Board</h3>
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
                  title={theme.label}
                  aria-label={`${theme.label} board`}
                >
                  <span style={{ background: theme.light }} />
                  <span style={{ background: theme.dark }} />
                </button>
              );
            })}
          </div>

          <ColorField
            label="Light squares"
            value={settings.boardLight}
            onChange={(v) => onChange("boardLight", v)}
          />
          <ColorField
            label="Dark squares"
            value={settings.boardDark}
            onChange={(v) => onChange("boardDark", v)}
          />
        </section>

        <section className="modal-section">
          <h3 className="modal-subtitle">Interface</h3>
          <ColorField
            label="Page background"
            value={settings.pageBg}
            onChange={(v) => onChange("pageBg", v)}
          />
          <ColorField
            label="Accent color"
            value={settings.accent}
            onChange={(v) => onChange("accent", v)}
          />
        </section>

        <button type="button" className="start-button" onClick={onClose}>
          Done
        </button>
        <button type="button" className="secondary-button" onClick={onReset}>
          Reset to defaults
        </button>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="color-field">
      <span>{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}