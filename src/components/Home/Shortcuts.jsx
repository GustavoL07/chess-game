import { useEffect } from "react";
import { SHORTCUTS } from "../../data/shortcuts";
import "./Shortcuts.css";

// Popup com a lista de atalhos de teclado.
// .modal-overlay, .modal, .modal-title e .start-button vêm de styles/modal.css
export default function Shortcuts({ onClose }) {
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
        className="modal shortcuts-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sc-title"
      >
        <h2 id="sc-title" className="modal-title">
          Keyboard shortcuts
        </h2>

        <ul className="shortcut-list">
          {SHORTCUTS.map(({ keys, action }) => (
            <li key={action} className="shortcut-row">
              <span className="shortcut-keys">
                {keys.map((key) => (
                  <kbd key={key}>{key}</kbd>
                ))}
              </span>
              <span className="shortcut-action">{action}</span>
            </li>
          ))}
        </ul>

        <p className="shortcut-note">
          Shortcuts work during a game, while no window is open.
        </p>

        <button type="button" className="start-button" onClick={onClose} autoFocus>
          Got it
        </button>
      </div>
    </div>
  );
}