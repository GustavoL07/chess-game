import { useState } from "react";
import { getPieceUrl } from "../../utils/pieceSets";
import "./GameStart.css";
import dice from "../../assets/images/dice.png";

function levelLabel(level) {
  if (level <= 5) return "Beginner";
  if (level <= 10) return "Intermediate";
  if (level <= 15) return "Advanced";
  return "Master";
}

export default function GameStart({ onStart, onBack, pieceSet }) {
  const [color, setColor] = useState("w");
  const [level, setLevel] = useState(10);

  const colors = [
    { id: "w", label: "White", icon: getPieceUrl(pieceSet, "w", "k") },
    { id: "random", label: "Random", icon: dice },
    { id: "b", label: "Black", icon: getPieceUrl(pieceSet, "b", "k") },
  ];

  function handleStart() {
    onStart?.({ color, level });
  }

  return (
    <div className="modal-overlay">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gs-title"
      >
        <h2 id="gs-title" className="modal-title">
          New Game
        </h2>

        <section className="modal-section">
          <h3 className="modal-subtitle">Play as</h3>
          <div className="option-row">
            {colors.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`option-card ${color === c.id ? "active" : ""}`}
                onClick={() => setColor(c.id)}
              >
                <img className="option-icon" src={c.icon} alt="" />
                <span className="option-label">{c.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="modal-section">
          <h3 className="modal-subtitle">AI Level</h3>

          <div className="level-header">
            <span className="level-value">{level}</span>
            <span className="option-desc">{levelLabel(level)}</span>
          </div>

          <input
            className="level-slider"
            type="range"
            min="1"
            max="20"
            step="1"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            aria-label="AI level"
          />

          <div className="level-scale">
            <span>1</span>
            <span>20</span>
          </div>
        </section>

        <button type="button" className="start-button" onClick={handleStart}>
          Start Game
        </button>

        {onBack && (
          <button type="button" className="secondary-button" onClick={onBack}>
            Back
          </button>
        )}
      </div>
    </div>
  );
}
