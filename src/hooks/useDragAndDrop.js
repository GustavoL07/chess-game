import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { squareFromPointer } from "../utils/boardGeometry";

const DRAG_THRESHOLD = 4;
export function useDragAndDrop({
  enabled,
  blocked,
  game,
  fen,
  flipped,
  boardRef,
  tryMove,
  onSelect,
}) {
  const dragRef = useRef(null);
  const ghostRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  function cancel() {
    dragRef.current = null;
    setDragging(null);
    setDragOver(null);
  }

  useEffect(() => {
    cancel();
  }, [fen]);

  useEffect(() => {
    if (!dragging) return;
    function onKey(e) {
      if (e.key !== "Escape") return;
      if (dragRef.current) dragRef.current.cancelled = true;
      setDragging(null);
      setDragOver(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dragging]);

  function positionGhost() {
    const drag = dragRef.current;
    if (!drag || !ghostRef.current) return;
    ghostRef.current.style.transform = `translate(${drag.x}px, ${drag.y}px) translate(-50%, -50%)`;
  }

  useLayoutEffect(() => {
    if (dragging) positionGhost();
  }, [dragging]);

  function onPointerDown(e) {
    if (e.button !== 0 || !enabled || blocked || !e.isPrimary) return;

    const from = squareFromPointer(e, boardRef.current, flipped);
    const piece = game.get(from);
    if (!piece || piece.color !== game.turn()) return;

    dragRef.current = {
      pointerId: e.pointerId,
      from,
      piece,
      startX: e.clientX,
      startY: e.clientY,
      x: e.clientX,
      y: e.clientY,
      active: false,
      cancelled: false,
    };
  }

  function onPointerMove(e) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    if (!(e.buttons & 1)) {
      cancel();
      return;
    }
    if (drag.cancelled) return;

    drag.x = e.clientX;
    drag.y = e.clientY;

    if (!drag.active) {
      const moved = Math.hypot(
        e.clientX - drag.startX,
        e.clientY - drag.startY,
      );
      if (moved < DRAG_THRESHOLD) return;

      drag.active = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      onSelect(drag.from);
      setDragging({
        from: drag.from,
        piece: drag.piece,
        size: boardRef.current.getBoundingClientRect().width / 8,
      });
    }

    positionGhost();
    const over = squareFromPointer(e, boardRef.current, flipped, {
      strict: true,
    });
    setDragOver((prev) => (prev === over ? prev : over));
  }

  function onPointerUp(e) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;

    if (!drag.active) return;

    suppressClickRef.current = true;
    setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);

    const target = squareFromPointer(e, boardRef.current, flipped, {
      strict: true,
    });
    setDragging(null);
    setDragOver(null);

    if (!drag.cancelled && target && target !== drag.from) {
      tryMove(drag.from, target, { animate: false });
    }
  }

  return {
    dragging,
    dragOver,
    ghostRef,
    ignoreClick: () => suppressClickRef.current,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: cancel,
  };
}
