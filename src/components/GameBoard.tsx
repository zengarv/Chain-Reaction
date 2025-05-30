import React from 'react';
import { Cell as CellType, Player } from '../types/game';
import Cell from './Cell';

interface GameBoardProps {
  board: CellType[][];
  onCellClick: (row: number, col: number) => void;
  currentPlayer: Player;
  players: Player[];
  lastMove: { row: number; col: number } | null;
  isMyTurn: boolean; // Indicates if the logged-in user is the current turn player
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  currentPlayer,
  onCellClick,
  players,
  lastMove,
  isMyTurn,
}) => {
  if (!board || board.length === 0 || !board[0]) {
    return <div className="text-white">Loading board...</div>;
  }

  const getCriticalMass = (row: number, col: number): number => {
    const isCorner =
      (row === 0 || row === board.length - 1) &&
      (col === 0 || col === board[0].length - 1);
    const isEdge =
      row === 0 ||
      col === 0 ||
      row === board.length - 1 ||
      col === board[0].length - 1;
    return isCorner ? 2 : isEdge ? 3 : 4;
  };

  const currentPlayerColor = currentPlayer.color;

  return (
    <div
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${board[0].length}, minmax(0, 1fr))`,
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const ownerColor = cell.playerId
            ? players.find((p: Player) => p.id === cell.playerId)?.color ||
              '#FFFFFF'
            : 'transparent';

          return (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              rowIndex={rowIndex}
              colIndex={colIndex}
              cell={cell}
              criticalMass={getCriticalMass(rowIndex, colIndex)}
              ownerColor={ownerColor}
              onCellClick={onCellClick}
              currentPlayerColor={currentPlayerColor}
              isLastMove={
                lastMove?.row === rowIndex && lastMove?.col === colIndex
              }
              isCurrentPlayerTurn={isMyTurn}
            />
          );
        })
      )}
    </div>
  );
};

export default GameBoard;
