import { useState, useEffect } from "react";

export function useMoveInput({ game, fen, viewOnly, locked, onMove }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [pendingPromotion, setPendingPromotion] = useState(null);

  useEffect(() => {
    if (viewOnly) setSelectedSquare(null);
  }, [viewOnly]);

  useEffect(() => {
    setPendingPromotion(null);
  }, [fen, viewOnly]);

  useEffect(() => {
    if (!pendingPromotion) return;
    function onKey(e) {
      if (e.key === "Escape") setPendingPromotion(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pendingPromotion]);

  const targets = selectedSquare
    ? game.moves({ square: selectedSquare, verbose: true })
    : [];

  const movableSquares = new Set(
    targets.filter((m) => !m.flags.includes("c")).map((m) => m.to),
  );
  const capturableSquares = new Set(
    targets.filter((m) => m.flags.includes("c")).map((m) => m.to),
  );

  function selectIfOwn(square, piece) {
    const isOwn = piece && piece.color === game.turn();
    setSelectedSquare(isOwn ? square : null);
  }

  function tryMove(from, to, { animate = true } = {}) {
    const candidates = game
      .moves({ square: from, verbose: true })
      .filter((m) => m.to === to);

    if (candidates.length === 0) return false;

    if (candidates[0].promotion) {
      setPendingPromotion({ from, to, color: game.turn() });
      return true;
    }

    const move = game.move({ from, to });
    setSelectedSquare(null);
    onMove(move, { animate });
    return true;
  }

  function handleSquareClick(square) {
    if (viewOnly || locked || pendingPromotion) return;

    const piece = game.get(square);

    if (!selectedSquare) {
      selectIfOwn(square, piece);
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    if (!tryMove(selectedSquare, square)) {
      selectIfOwn(square, piece);
    }
  }

  function pickPromotion(pieceType) {
    if (!pendingPromotion) return;
    const { from, to } = pendingPromotion;
    setPendingPromotion(null);

    try {
      const move = game.move({ from, to, promotion: pieceType });
      setSelectedSquare(null);
      onMove(move);
    } catch {}
  }

  function cancelPromotion() {
    setPendingPromotion(null);
  }

  return {
    selectedSquare,
    setSelectedSquare,
    pendingPromotion,
    movableSquares,
    capturableSquares,
    tryMove,
    handleSquareClick,
    pickPromotion,
    cancelPromotion,
  };
}
