import { useState } from "react";
import { getPieceUrl } from "../../utils/pieceSets";
import { MAX_SAVED_PRESETS } from "../../constants";
import "./Presets.css";

export default function Presets({
  presets,
  settings,
  onApply,
  onSave,
  onDelete,
}) {
  const [name, setName] = useState("");

  const savedCount = presets.filter((p) => !p.builtIn).length;
  const isFull = savedCount >= MAX_SAVED_PRESETS;

  function handleSubmit(e) {
    e.preventDefault();
    if (isFull) return;
    onSave(name.trim() || `Preset ${savedCount + 1}`);
    setName("");
  }

  return (
    <div className="presets">
      <div className="preset-grid">
        {presets.map((preset) => {
          const v = preset.values;

          const active = Object.entries(v).every(
            ([k, val]) => settings[k] === val,
          );

          return (
            <div
              key={preset.id}
              className={`preset-card ${active ? "active" : ""}`}
            >
              <button
                type="button"
                className="preset-main"
                onClick={() => onApply(preset)}
              >
                <span
                  className="preset-swatch"
                  style={{
                    "--l": v.boardLight ?? settings.boardLight,
                    "--d": v.boardDark ?? settings.boardDark,
                  }}
                >
                  <img
                    src={getPieceUrl(v.pieceSet ?? settings.pieceSet, "w", "n")}
                    alt=""
                  />
                </span>
                <span className="preset-name">{preset.name}</span>
              </button>

              {!preset.builtIn && (
                <button
                  type="button"
                  className="preset-delete"
                  onClick={() => onDelete(preset.id)}
                  aria-label={`Delete preset ${preset.name}`}
                  title="Delete preset"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      <form className="preset-save" onSubmit={handleSubmit}>
        <input
          className="preset-input"
          type="text"
          value={name}
          maxLength={24}
          placeholder="Name your current look"
          aria-label="Preset name"
          disabled={isFull}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="preset-save-button" disabled={isFull}>
          Save
        </button>
      </form>

      {isFull && (
        <p className="preset-note">
          Limit of {MAX_SAVED_PRESETS} saved presets reached. Delete one to save
          a new one.
        </p>
      )}
    </div>
  );
}
