import React from 'react';
import { Cell as CellType, Player} from '../types/game';
import Cell from './Cell';

interface GameBoardProps {
  board: CellType[][];
  onCellClick: (row: number, col: number) => void;
  currentPlayer: Player;
  playerColors: Record<string, string>;
  lastMove: { row: number; col: number } | null;
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  currentPlayer,
  onCellClick,
  playerColors,
  lastMove,
}) => {
  const getCriticalMass = (row: number, col: number): number => {
    const isCorner = (row === 0 || row === board.length - 1) && 
                    (col === 0 || col === board[0].length - 1);
    const isEdge = row === 0 || col === 0 || 
                   row === board.length - 1 || col === board[0].length - 1;
    return isCorner ? 2 : isEdge ? 3 : 4;
  };

  return (
    <div 
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${board[0].length}, minmax(0, 1fr))`,
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            rowIndex={rowIndex}
            colIndex={colIndex}
            cell={cell}
            criticalMass={getCriticalMass(rowIndex, colIndex)}
            playerColors={playerColors}
            onCellClick={onCellClick}
            currentPlayer={currentPlayer.id}
            isLastMove={lastMove?.row === rowIndex && lastMove?.col === colIndex}
          />
        ))
      )}
    </div>
  );
};

export default GameBoard;