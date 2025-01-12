import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Orb from './Orb';

interface CellProps {
  rowIndex: number;
  colIndex: number;
  cell: {
    orbs: number;
    playerId: string | null;
  };
  criticalMass: number;
  playerColors: Record<string, string>;
  onCellClick: (row: number, col: number) => void;
}

const Cell: React.FC<CellProps> = ({
  rowIndex,
  colIndex,
  cell,
  criticalMass,
  playerColors,
  onCellClick,
}) => {
  const isUnstable = cell.orbs === criticalMass - 1;

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
    <motion.div
      key={`${rowIndex}-${colIndex}`}
      className="aspect-square border border-gray-700 rounded-sm bg-gray-800/50 
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
            className="w-full h-full flex items-center justify-center"
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
};

export default Cell;