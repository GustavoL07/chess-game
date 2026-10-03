import { useEffect, useRef } from "react";
import "./History.css";

export default function History({ moves = [] }) {
  const listRef = useRef(null);
  const movesGrouped = [];

  for (let i = 0; i < moves.length; i += 2) {
    movesGrouped.push({
      turn: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1] || "",
    });
  }

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [moves]);

  return (
    <div className="history-container">
      <div className="history-header">History</div>
      <div className="history-list" ref={listRef}>
        {movesGrouped.map((move) => (
          <div key={move.turn} className="history-row">
            <span className="move-number">{move.turn}.</span>
            <span className="white-move">{move.white}</span>
            <span className="black-move">{move.black}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
