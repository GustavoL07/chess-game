import {
  getSquareColor,
  toSquareNotation,
  squareToPosition,
} from "../../utils/pieces";
import Square from "../Board/Square";
import { useDemoGame } from "../../hooks/useDemoGame";
import { DEMO_GAME } from "../../data/demoGame";
import "../Board/Board.css";

// Tabuleiro sem interação que joga sozinho. Reaproveita o Square, então usa o
// conjunto de peças, as cores das casas e o destaque do último lance de Settings.
export default function DemoBoard({ pieceSet }) {
  const { board, lastMove } = useDemoGame(DEMO_GAME);

  return (
    <div className="board demo-board" aria-hidden="true">
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          const square = toSquareNotation(rowIndex, colIndex);

          let moveStyle;
          if (piece && lastMove?.to === square) {
            const from = squareToPosition(lastMove.from);
            moveStyle = {
              "--dx": from.col - colIndex,
              "--dy": from.row - rowIndex,
            };
          }

          return (
            <Square
              key={square}
              piece={piece}
              colorClass={getSquareColor(rowIndex, colIndex)}
              isLastFrom={lastMove?.from === square}
              isLastTo={lastMove?.to === square}
              moveStyle={moveStyle}
              moveKey={lastMove?.id}
              pieceSet={pieceSet}
            />
          );
        }),
      )}
    </div>
  );
}