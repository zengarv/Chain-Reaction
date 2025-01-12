import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Orb from './Orb';
import { Cell } from '../types/game';

interface GameBoardProps {
  board: Cell[][];
  currentPlayer: string;
  onCellClick: (row: number, col: number) => void;
  playerColors: Record<string, string>;
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  currentPlayer,
  onCellClick,
  playerColors,
}) => {
  const getCriticalMass = (row: number, col: number) => {
    const isCorner =
      (row === 0 && col === 0) ||
      (row === 0 && col === board[0].length - 1) ||
      (row === board.length - 1 && col === 0) ||
      (row === board.length - 1 && col === board[0].length - 1);
    const isEdge =
      row === 0 || col === 0 || row === board.length - 1 || col === board[0].length - 1;

    return isCorner ? 2 : isEdge ? 3 : 4;
  };

  const cellVariants = {
    initial: {
      scale: 1,
      rotate: 0,
    },
    explode: {
      scale: [1, 1.2, 0.8, 1],
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut",
        times: [0, 0.2, 0.5, 1],
      }
    }
  };

  return (
    <div className="grid gap-1.5" style={{
      gridTemplateColumns: `repeat(${board[0].length}, minmax(0, 1fr))`,
    }}>
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const criticalMass = getCriticalMass(rowIndex, colIndex);
          const isUnstable = cell.orbs === criticalMass - 1;

          return (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              className="aspect-square border-2 border-gray-700 rounded-lg bg-gray-800/50 
                       backdrop-blur-sm hover:bg-gray-700/50 cursor-pointer overflow-hidden
                       transition-colors duration-200"
              initial="initial"
              variants={cellVariants}
              animate={cell.orbs >= criticalMass ? "explode" : "initial"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCellClick(rowIndex, colIndex)}
              layout
            >
              <AnimatePresence mode="wait">
                {cell.orbs > 0 && (
                  <motion.div
                    key={`orb-${cell.orbs}-${cell.playerId}`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ 
                      scale: 1.5, 
                      opacity: 0,
                      transition: { 
                        duration: 0.3,
                        ease: "easeOut"
                      }
                    }}
                    className="w-full h-full"
                  >
                    <Orb
                      color={playerColors[cell.playerId!]}
                      count={cell.orbs}
                      isUnstable={isUnstable}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })
      )}
    </div>
  );
};

export default GameBoard;