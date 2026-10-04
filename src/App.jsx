import { useState } from "react";
import { Chess } from "chess.js";
import Board from "./components/Board";
import History from "./components/History";
import "./App.css";

export default function App() {
  const [game] = useState(() => new Chess());
  const [history, setHistory] = useState([]);
  const [fenHistory, setFenHistory] = useState([game.fen()]);
  const [viewPlay, setViewPlay] = useState(null);

  function handleMove() {
    setHistory(game.history());
    setFenHistory((prev) => [...prev, game.fen()]);
    setViewPlay(null);
  }

  function goToPlay(play) {
    const clamped = Math.max(0, Math.min(play, history.length));
    setViewPlay(clamped === history.length ? null : clamped);
  }

  const currentPlay = viewPlay ?? history.length;
  const viewOnly = viewPlay !== null;
  const fen = fenHistory[currentPlay];

  return (
    <div className="App">
      <Board game={game} fen={fen} onMove={handleMove} viewOnly={viewOnly} />
      <History moves={history} currentPlay={currentPlay} onSelect={goToPlay} />
    </div>
  );
}
