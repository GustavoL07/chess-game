import { useState } from "react";
import { Chess } from "chess.js";
import Board from "./components/Board";
import History from "./components/History";
import "./App.css";

export default function App() {
  const [game] = useState(new Chess());
  const [history, setHistory] = useState([]);

  function handleMove() {
    setHistory([...game.history()]);
  }

  return (
    <div className="App">
      <Board game={game} onMove={handleMove} />
      <History moves={history} />
    </div>
  );
}