import { useState } from "react";
import "./GameStart.css";
import wk from "../../assets/pieces/cburnett/wk.svg";
import bk from "../../assets/pieces/cburnett/bk.svg";
import dice from "../../assets/images/dice.png";

const COLORS = [
  { id: "w", label: "White", icon: wk },
  { id: "random", label: "Random", icon: dice },
  { id: "b", label: "Black", icon: bk },
];

function levelLabel(level) {
  if (level <= 5) return "Beginner";
  if (level <= 10) return "Intermediate";
  if (level <= 15) return "Advanced";
  return "Master";
}

export default function GameStart({ onStart }) {
  const [color, setColor] = useState("w");
  const [level, setLevel] = useState(10);

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
            {COLORS.map((c) => (
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
      </div>
    </div>
  );
}
