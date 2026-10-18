import { useEffect, useRef } from "react";
import MoveLabel from "./MoveLabel";
import "./History.css";

export default function History({
  moves = [],
  currentPlay,
  onSelect,
  onUndo,
  onHint,
  onFlip,
  onRestart,
  confirmingRestart = false,
  canUndo = false,
  canHint = false,
  status = "",
  pieceSet,
  moveIcons = false,
  collapsed = false,
  onToggleCollapse,
  reviewing = false,
  onExit,
}) {
  const listRef = useRef(null);
  const movesGrouped = [];

  for (let i = 0; i < moves.length; i += 2) {
    movesGrouped.push({
      turn: i / 2 + 1,
      white: moves[i],
      whitePlay: i + 1,
      black: moves[i + 1] || "",
      blackPlay: i + 2,
    });
  }

  // mantém o lance ativo à vista: ao jogar, ao navegar e ao reabrir o painel
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const active = list.querySelector(".move-cell.active");
    if (!active) {
      list.scrollTo({ top: 0, behavior: "smooth" }); // posição inicial
      return;
    }

    const listBox = list.getBoundingClientRect();
    const activeBox = active.getBoundingClientRect();
    if (activeBox.top < listBox.top) {
      list.scrollTo({
        top: list.scrollTop - (listBox.top - activeBox.top) - 8,
        behavior: "smooth",
      });
    } else if (activeBox.bottom > listBox.bottom) {
      list.scrollTo({
        top: list.scrollTop + (activeBox.bottom - listBox.bottom) + 8,
        behavior: "smooth",
      });
    }
  }, [moves, currentPlay, collapsed]);

  const atStart = currentPlay === 0;
  const atEnd = currentPlay === moves.length;
  const toggleLabel = collapsed ? "Expand history (C)" : "Collapse history (C)";

  return (
    <div className={`history-container ${collapsed ? "collapsed" : ""}`}>
      <button
        type="button"
        className="history-collapse"
        onClick={onToggleCollapse}
        aria-expanded={!collapsed}
        aria-keyshortcuts="C"
        aria-label={toggleLabel}
        title={toggleLabel}
      >
        {collapsed ? "›" : "‹"}
      </button>

      <div className="history-inner">
        <div className="history-header">
          <span className="history-title">Moves</span>
          {status && <span className="history-status">{status}</span>}
        </div>

        <div className="history-list" ref={listRef}>
          {movesGrouped.length === 0 && (
            <p className="history-empty">No moves yet</p>
          )}

          {movesGrouped.map((row) => (
            <div key={row.turn} className="history-row">
              <span className="move-number">{row.turn}.</span>
              <button
                type="button"
                className={`move-cell ${currentPlay === row.whitePlay ? "active" : ""}`}
                aria-label={row.white}
                onClick={() => onSelect(row.whitePlay)}
              >
                <MoveLabel
                  san={row.white}
                  color="w"
                  pieceSet={pieceSet}
                  icons={moveIcons}
                />
              </button>
              {row.black ? (
                <button
                  type="button"
                  className={`move-cell ${currentPlay === row.blackPlay ? "active" : ""}`}
                  aria-label={row.black}
                  onClick={() => onSelect(row.blackPlay)}
                >
                  <MoveLabel
                    san={row.black}
                    color="b"
                    pieceSet={pieceSet}
                    icons={moveIcons}
                  />
                </button>
              ) : (
                <span className="move-cell empty" />
              )}
            </div>
          ))}
        </div>

        <div className="history-footer">
          <div className="history-nav">
            <button
              type="button"
              aria-label="First position"
              title="First position (↑)"
              onClick={() => onSelect(0)}
              disabled={atStart}
            >
              ⏮
            </button>
            <button
              type="button"
              aria-label="Previous move"
              title="Previous move (←)"
              onClick={() => onSelect(currentPlay - 1)}
              disabled={atStart}
            >
              ◀
            </button>
            <button
              type="button"
              aria-label="Next move"
              title="Next move (→)"
              onClick={() => onSelect(currentPlay + 1)}
              disabled={atEnd}
            >
              ▶
            </button>
            <button
              type="button"
              aria-label="Last position"
              title="Current position (↓)"
              onClick={() => onSelect(moves.length)}
              disabled={atEnd}
            >
              ⏭
            </button>
          </div>

          <div className="history-actions">
            <button
              type="button"
              className="action-btn"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (U)"
              aria-keyshortcuts="U"
            >
              <span className="action-icon">↶</span>
              <span>Undo</span>
            </button>
            <button
              type="button"
              className="action-btn"
              onClick={onHint}
              disabled={!canHint}
              title="Hint (H)"
              aria-keyshortcuts="H"
            >
              <span className="action-icon">💡</span>
              <span>Hint</span>
            </button>
            <button
              type="button"
              className="action-btn"
              onClick={onFlip}
              title="Flip board (F)"
              aria-keyshortcuts="F"
            >
              <span className="action-icon">⇅</span>
              <span>Flip</span>
            </button>
            {reviewing ? (
              <button
                type="button"
                className="action-btn"
                onClick={onExit}
                title="Exit review"
              >
                <span className="action-icon">✕</span>
                <span>Exit</span>
              </button>
            ) : (
              <button
                type="button"
                className={`action-btn ${confirmingRestart ? "danger" : ""}`}
                onClick={onRestart}
                title="Restart (R)"
                aria-keyshortcuts="R"
              >
                <span className="action-icon">↻</span>
                <span>{confirmingRestart ? "Sure?" : "Restart"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
