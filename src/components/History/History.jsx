import { useEffect, useRef, useState } from "react";
import "./History.css";

export default function History({
  moves = [],
  currentPlay,
  onSelect,
  onUndo,
  onHint,
  onFlip,
  onRestart,
  canUndo = false,
  canHint = false,
  status = "",
  onSettings,
}) {
  const listRef = useRef(null);
  const [confirming, setConfirming] = useState(false);
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

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [moves]);

  // a confirmação do restart expira sozinha
  useEffect(() => {
    if (!confirming) return;
    const id = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(id);
  }, [confirming]);

  function handleRestart() {
    if (!confirming && moves.length > 0) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    onRestart();
  }

  const atStart = currentPlay === 0;
  const atEnd = currentPlay === moves.length;

  return (
    <div className="history-container">
      <div className="history-header">
        <span className="history-title">Moves</span>
        {status && <span className="history-status">{status}</span>}
        <button
          type="button"
          className="history-settings"
          onClick={onSettings}
          aria-label="Settings"
        >
          ⚙
        </button>
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
              onClick={() => onSelect(row.whitePlay)}
            >
              {row.white}
            </button>
            {row.black ? (
              <button
                type="button"
                className={`move-cell ${currentPlay === row.blackPlay ? "active" : ""}`}
                onClick={() => onSelect(row.blackPlay)}
              >
                {row.black}
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
            onClick={() => onSelect(0)}
            disabled={atStart}
          >
            ⏮
          </button>
          <button
            type="button"
            aria-label="Previous move"
            onClick={() => onSelect(currentPlay - 1)}
            disabled={atStart}
          >
            ◀
          </button>
          <button
            type="button"
            aria-label="Next move"
            onClick={() => onSelect(currentPlay + 1)}
            disabled={atEnd}
          >
            ▶
          </button>
          <button
            type="button"
            aria-label="Last position"
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
          >
            <span className="action-icon">↶</span>
            <span>Undo</span>
          </button>
          <button
            type="button"
            className="action-btn"
            onClick={onHint}
            disabled={!canHint}
          >
            <span className="action-icon">💡</span>
            <span>Hint</span>
          </button>
          <button type="button" className="action-btn" onClick={onFlip}>
            <span className="action-icon">⇅</span>
            <span>Flip</span>
          </button>
          <button
            type="button"
            className={`action-btn ${confirming ? "danger" : ""}`}
            onClick={handleRestart}
          >
            <span className="action-icon">↻</span>
            <span>{confirming ? "Sure?" : "Restart"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
