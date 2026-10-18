import { createPortal } from "react-dom";
import { getPieceImage } from "../../utils/pieces";

export default function DragGhost({ imgRef, piece, size, pieceSet }) {
  return createPortal(
    <img
      ref={imgRef}
      className="drag-ghost"
      src={getPieceImage(piece, pieceSet)}
      style={{ width: size, height: size }}
      alt=""
      draggable={false}
    />,
    document.body,
  );
}
