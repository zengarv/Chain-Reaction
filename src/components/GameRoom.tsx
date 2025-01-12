import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import GameBoard from './GameBoard';
import { Cell, GameSettings } from '../types/game';

const DEFAULT_SETTINGS: GameSettings = {
  boardSize: { rows: 9, cols: 6 },
  maxPlayers: 2
};

const GameRoom: React.FC = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const [board, setBoard] = useState<Cell[][]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<string>('player1');
  const [isExploding, setIsExploding] = useState(false);
  const playerColors: Record<string, string> = {
    'player1': '#FF5555',
    'player2': '#50FA7B',
    'player3': '#BD93F9',
    'player4': '#FFB86C',
  };

  useEffect(() => {
    const settings = location.state?.settings || DEFAULT_SETTINGS;
    const { rows, cols } = settings.boardSize;
    const emptyBoard: Cell[][] = Array(rows).fill(null).map(() =>
      Array(cols).fill(null).map(() => ({ orbs: 0, playerId: null }))
    );
    setBoard(emptyBoard);
  }, [location.state]);

  const getCriticalMass = (row: number, col: number): number => {
    const isCorner = (row === 0 || row === board.length - 1) && 
                    (col === 0 || col === board[0].length - 1);
    const isEdge = row === 0 || col === 0 || 
                   row === board.length - 1 || col === board[0].length - 1;
    return isCorner ? 2 : isEdge ? 3 : 4;
  };

  const getAdjacentCells = (row: number, col: number) => {
    const adjacent: [number, number][] = [];
    if (row > 0) adjacent.push([row - 1, col]);
    if (row < board.length - 1) adjacent.push([row + 1, col]);
    if (col > 0) adjacent.push([row, col - 1]);
    if (col < board[0].length - 1) adjacent.push([row, col + 1]);
    return adjacent;
  };

  const explodeCell = async (newBoard: Cell[][], row: number, col: number): Promise<boolean> => {
    const criticalMass = getCriticalMass(row, col);
    if (newBoard[row][col].orbs < criticalMass) return false;

    const currentPlayerId = newBoard[row][col].playerId;
    newBoard[row][col].orbs -= criticalMass;
    if (newBoard[row][col].orbs === 0) newBoard[row][col].playerId = null;

    const adjacent = getAdjacentCells(row, col);
    let hasExploded = false;

    for (const [adjRow, adjCol] of adjacent) {
      newBoard[adjRow][adjCol].playerId = currentPlayerId;
      newBoard[adjRow][adjCol].orbs++;
      if (newBoard[adjRow][adjCol].orbs >= getCriticalMass(adjRow, adjCol)) {
        hasExploded = true;
      }
    }

    return hasExploded;
  };

  const handleCellClick = async (row: number, col: number) => {
    if (isExploding || !board[row]?.[col]) return;
    
    // Check if the cell can be played
    if (board[row][col].playerId && board[row][col].playerId !== currentPlayer) return;

    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard[row][col] = {
      ...newBoard[row][col],
      orbs: (newBoard[row][col].orbs || 0) + 1,
      playerId: currentPlayer
    };

    setBoard(newBoard);

    // Check for chain reactions
    if (newBoard[row][col].orbs >= getCriticalMass(row, col)) {
      setIsExploding(true);
      let hasExploded = true;
      while (hasExploded) {
        hasExploded = false;
        for (let r = 0; r < newBoard.length; r++) {
          for (let c = 0; c < newBoard[0].length; c++) {
            if (newBoard[r][c].orbs >= getCriticalMass(r, c)) {
              hasExploded = await explodeCell(newBoard, r, c) || hasExploded;
              setBoard([...newBoard]); // Update board state to show explosion
              await new Promise(resolve => setTimeout(resolve, 200)); // Add delay for animation
            }
          }
        }
      }
      setIsExploding(false);
      // Switch players after explosion chain is complete
      setCurrentPlayer(currentPlayer === 'player1' ? 'player2' : 'player1');
    }
  };

  if (board.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
        <div className="text-white text-xl">Loading game board...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-white mb-8">Room: {roomId}</h2>
      <div className="w-full max-w-3xl">
        <GameBoard
          board={board}
          currentPlayer={currentPlayer}
          onCellClick={handleCellClick}
          playerColors={playerColors}
        />
      </div>
      <div className="mt-4 text-white">
        Current Player: {currentPlayer}
      </div>
    </div>
  );
};

export default GameRoom;