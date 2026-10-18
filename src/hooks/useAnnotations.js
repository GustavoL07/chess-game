import { useState, useEffect } from "react";
import { squareFromPointer } from "../utils/boardGeometry";

export function useAnnotations({ enabled, fen, flipped, boardRef }) {
  const [annotations, setAnnotations] = useState([]);
  const [drawing, setDrawing] = useState(null);

  useEffect(() => {
    setAnnotations([]);
    setDrawing(null);
  }, [fen]);

  useEffect(() => {
    if (!enabled) {
      setAnnotations([]);
      setDrawing(null);
    }
  }, [enabled]);

  function onPointerDown(e) {
    if (e.button === 0) {
      if (enabled) setAnnotations((prev) => (prev.length ? [] : prev));
      return;
    }

    if (!enabled || e.button !== 2) return;
    const square = squareFromPointer(e, boardRef.current, flipped);
    setDrawing({ from: square, to: square });
  }

  function onPointerMove(e) {
    if (!drawing) return;
    const square = squareFromPointer(e, boardRef.current, flipped);
    if (square !== drawing.to) setDrawing({ ...drawing, to: square });
  }

  function onPointerUp(e) {
    if (!drawing || e.button !== 2) return;
    const { from, to } = drawing;
    setDrawing(null);

    setAnnotations((prev) => {
      const same = (a) => a.from === from && a.to === to;
      return prev.some(same)
        ? prev.filter((a) => !same(a))
        : [...prev, { from, to }];
    });
  }

  return {
    enabled,
    annotations,
    drawing,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: () => setDrawing(null),
    onContextMenu: (e) => enabled && e.preventDefault(),
  };
}
