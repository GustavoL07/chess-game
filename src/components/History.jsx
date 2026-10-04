import { useEffect, useRef } from "react";
import "./History.css";

export default function History({ moves = [], currentPlay, onSelect }) {
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

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [moves]);

  return (
    <div className="history-container">
      <div className="history-header">History</div>

      <div className="history-list" ref={listRef}>
        {movesGrouped.map((row) => (
          <div key={row.turn} className="history-row">
            <span className="move-number">{row.turn}.</span>
            <span
              className={`white-move ${currentPlay === row.whitePlay ? "active" : ""}`}
              onClick={() => onSelect(row.whitePlay)}
            >
              {row.white}
            </span>
            <span
              className={`black-move ${currentPlay === row.blackPlay ? "active" : ""}`}
              onClick={() => row.black && onSelect(row.blackPlay)}
            >
              {row.black}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
