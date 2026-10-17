import { useRef, useState } from "react";
import DemoBoard from "./DemoBoard";
import Shortcuts from "./Shortcuts";
import { getPieceUrl } from "../../utils/pieceSets";
import "./Home.css";

// Tela de entrada: partida de fundo (borrada) e o menu principal.
// onStats ainda não existe: sem ele o botão aparece desativado, com "Soon".
export default function Home({ pieceSet, onNewGame, onSettings, onStats }) {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const shortcutsButtonRef = useRef(null);

  function closeShortcuts() {
    setShowShortcuts(false);
    // devolve o foco ao botão que abriu o popup
    shortcutsButtonRef.current?.focus();
  }

  return (
    <main className="home">
      <div className="home-bg" aria-hidden="true">
        <DemoBoard pieceSet={pieceSet} />
      </div>
      <div className="home-vignette" aria-hidden="true" />

      <div className="modal home-card">
        <div className="home-logo" aria-hidden="true">
          <img src={getPieceUrl(pieceSet, "w", "k")} alt="" />
          <img src={getPieceUrl(pieceSet, "b", "k")} alt="" />
        </div>

        <h1 className="home-title">Chess</h1>
        <p className="home-subtitle">Play against Stockfish</p>

        <button
          type="button"
          className="start-button"
          onClick={onNewGame}
          autoFocus
        >
          New Game
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={onStats}
          disabled={!onStats}
        >
          Statistics
          {!onStats && <span className="home-badge">Soon</span>}
        </button>

        <button
          type="button"
          className="secondary-button"
          ref={shortcutsButtonRef}
          onClick={() => setShowShortcuts(true)}
        >
          Shortcuts
        </button>

        <button type="button" className="secondary-button" onClick={onSettings}>
          Settings
        </button>
      </div>

      {showShortcuts && <Shortcuts onClose={closeShortcuts} />}
    </main>
  );
}
