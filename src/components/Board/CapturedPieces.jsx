import { getPieceImage } from "../../utils/pieces";
import "./CapturedPieces.css";

// Faixa com as peças capturadas por um lado e, se estiver à frente, a vantagem.
// color: cor das peças que aparecem (as do adversário de quem capturou)
// position: "top" | "bottom" (onde a faixa fica em relação ao tabuleiro)
export default function CapturedPieces({
  pieces,
  color,
  advantage = 0,
  position,
  pieceSet,
}) {
  // agrupa peças do mesmo tipo (a lista já vem ordenada por valor)
  const groups = [];
  for (const type of pieces) {
    const last = groups[groups.length - 1];
    if (last && last.type === type) last.count += 1;
    else groups.push({ type, count: 1 });
  }

  return (
    <div
      className={`captured ${position}`}
      role="group"
      aria-label="Captured pieces"
    >
      {groups.map(({ type, count }) => (
        <span key={type} className="captured-group">
          {Array.from({ length: count }, (_, i) => (
            <img
              key={i}
              src={getPieceImage({ color, type }, pieceSet)}
              alt=""
            />
          ))}
        </span>
      ))}

      {advantage > 0 && (
        <span className="captured-advantage">+{advantage}</span>
      )}
    </div>
  );
}
