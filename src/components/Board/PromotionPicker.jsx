import { getPieceImage } from "../../utils/pieces";
import "./PromotionPicker.css";

const CHOICES = [
  { type: "q", label: "Queen" },
  { type: "r", label: "Rook" },
  { type: "b", label: "Bishop" },
  { type: "n", label: "Knight" },
];

export default function PromotionPicker({
  color,
  col,
  atTop,
  pieceSet,
  onSelect,
  onCancel,
}) {
  return (
    <>
      <div className="promotion-backdrop" onClick={onCancel} />
      <div
        className={`promotion-picker ${atTop ? "from-top" : "from-bottom"}`}
        style={{ "--col": col }}
        role="dialog"
        aria-label="Choose promotion piece"
      >
        {CHOICES.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            className="promotion-option"
            aria-label={label}
            title={label}
            onClick={() => onSelect(type)}
          >
            <img src={getPieceImage({ color, type }, pieceSet)} alt="" />
          </button>
        ))}
      </div>
    </>
  );
}
