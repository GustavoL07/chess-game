import { useState } from "react";
import "./GameStart.css";
import wk from "../assets/pieces/cburnett/wk.svg";
import bk from "../assets/pieces/cburnett/bk.svg";
import dice from "../assets/images/dice.png";

const COLORS = [
  { id: "w", label: "White", icon: wk },
  { id: "random", label: "Random", icon: dice },
  { id: "b", label: "Black", icon: bk },
];

const LEVELS = [
  { id: "iniciante", label: "Iniciante", desc: "Comete muitos erros" },
  { id: "intermediario", label: "Intermediário", desc: "Um bom desafio" },
  { id: "avancado", label: "Avançado", desc: "Joga com precisão" },
  { id: "mestre", label: "Mestre", desc: "Quase imbatível" },
];

export default function GameStart({ onStart }) {
  const [color, setColor] = useState("w");
  const [level, setLevel] = useState("intermediario");

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
          <h3 className="modal-subtitle">IA Level</h3>
          <div className="option-list">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                type="button"
                className={`option-item ${level === l.id ? "active" : ""}`}
                onClick={() => setLevel(l.id)}
              >
                <span className="option-label">{l.label}</span>
                <span className="option-desc">{l.desc}</span>
              </button>
            ))}
          </div>
        </section>

        <button type="button" className="start-button" onClick={handleStart}>
          Start Game
        </button>
      </div>
    </div>
  );
}
