import "./GameEnd.css";
import wk from "../assets/pieces/cburnett/wk.svg";
import bk from "../assets/pieces/cburnett/bk.svg";

const DRAW_REASONS = {
  stalemate: "Stalemate",
  insufficient: "Insufficient material",
  threefold: "Threefold repetition",
  fiftymove: "50-move rule",
};

export default function GameEnd({ result, playerColor, onNewGame }) {
  const isDraw = result.type === "draw";
  const playerWon = !isDraw && result.winner === playerColor;

  const title = isDraw ? "Draw" : playerWon ? "You won!" : "You lost";
  const subtitle = isDraw
    ? (DRAW_REASONS[result.reason] ?? "Draw")
    : `Checkmate — ${result.winner === "w" ? "White" : "Black"} wins`;

  return (
    <div className="modal-overlay">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ge-title"
      >
        <h2 id="ge-title" className="modal-title">
          {title}
        </h2>

        <div className="end-kings">
          {isDraw ? (
            <>
              <img className="end-king" src={wk} alt="White king" />
              <img className="end-king" src={bk} alt="Black king" />
            </>
          ) : (
            <img
              className="end-king winner"
              src={result.winner === "w" ? wk : bk}
              alt={`${result.winner === "w" ? "White" : "Black"} king`}
            />
          )}
        </div>

        <p className="end-subtitle">{subtitle}</p>

        <button type="button" className="start-button" onClick={onNewGame}>
          New Game
        </button>
      </div>
    </div>
  );
}
