import { useEffect, useRef, useState } from "react";
import { loadGames } from "../../utils/gameStorage";
import {
  getStats,
  getOutcome,
  getResultTitle,
  formatDate,
} from "../../utils/gameRecords";
import { getPieceUrl } from "../../utils/pieceSets";
import "./Stats.css";

const TABS = [
  { id: "games", label: "Previous games" },
  { id: "stats", label: "Statistics" },
];

const OUTCOME_LABELS = { win: "Win", loss: "Loss", draw: "Draw" };

// Janela com as partidas já jogadas e o resumo delas.
// onOpenGame(game): abre a partida escolhida no tabuleiro, em modo de revisão.
export default function Stats({ pieceSet, onOpenGame, onClose }) {
  const [tab, setTab] = useState("games");
  const [games] = useState(loadGames);
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

  const stats = getStats(games);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal stats-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-title"
      >
        <header className="stats-head">
          <h2 id="stats-title" className="modal-title">
            Statistics
          </h2>

          <div className="stats-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                id={`stats-tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                aria-controls="stats-panel"
                className={`stats-tab ${tab === t.id ? "active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>

        <div
          className="stats-body"
          ref={bodyRef}
          id="stats-panel"
          role="tabpanel"
          aria-labelledby={`stats-tab-${tab}`}
        >
          <div className="stats-panel">
            {tab === "games" &&
              (games.length === 0 ? (
                <p className="stats-empty">
                  No finished games yet.
                  <br />
                  Games show up here when they end.
                </p>
              ) : (
                <ul className="game-list">
                  {games.map((game) => {
                    const outcome = getOutcome(game);
                    return (
                      <li key={game.id}>
                        <button
                          type="button"
                          className="game-item"
                          onClick={() => onOpenGame(game)}
                        >
                          <img
                            className="game-king"
                            src={getPieceUrl(pieceSet, game.playerColor, "k")}
                            alt={
                              game.playerColor === "w"
                                ? "Played as white"
                                : "Played as black"
                            }
                          />
                          <span className="game-info">
                            <span className="game-title">
                              {getResultTitle(game.result)}
                            </span>
                            <span className="game-meta">
                              {game.level != null &&
                                `AI Level ${game.level} | `}
                              {formatDate(game.date)}
                            </span>
                          </span>
                          <span className={`game-badge ${outcome}`}>
                            {OUTCOME_LABELS[outcome]}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ))}

            {tab === "stats" && (
              <div className="stat-grid">
                <StatCard label="Games played" value={stats.total} wide />
                <StatCard label="As white" value={stats.asWhite} />
                <StatCard label="As black" value={stats.asBlack} />
                <StatCard label="Wins" value={stats.wins} tone="win" />
                <StatCard label="Losses" value={stats.losses} tone="loss" />
                <StatCard label="Draws" value={stats.draws} />
                <StatCard label="Win rate" value={`${stats.winRate}%`} />
              </div>
            )}
          </div>
        </div>

        <footer className="stats-footer">
          <button type="button" className="start-button" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone, wide }) {
  return (
    <div className={`stat-card ${tone ?? ""} ${wide ? "wide" : ""}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
