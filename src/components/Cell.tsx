// Cell.tsx
import React, { useRef, useEffect, useState } from 'react';
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
  ownerColor: string;
  onCellClick: (row: number, col: number) => void;
  currentPlayerColor: string;
  isLastMove: boolean;
}

const Cell: React.FC<CellProps> = ({
  rowIndex,
  colIndex,
  cell,
  criticalMass,
  ownerColor,
  onCellClick,
  currentPlayerColor,
  isLastMove,
}) => {
  const cellRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState({ width: 0, height: 0 });
  const isUnstable = cell.orbs === criticalMass - 1;

  useEffect(() => {
    const updateCellSize = () => {
      if (cellRef.current) {
        const { width, height } = cellRef.current.getBoundingClientRect();
        setCellSize({ width, height });
      }
    };

    updateCellSize();
    const resizeObserver = new ResizeObserver(updateCellSize);
    
    if (cellRef.current) {
      resizeObserver.observe(cellRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const cellVariants = {
    initial: {
      scale: 1,
      rotate: 0,
    },
    explode: {
      scale: [1, 1.1, 0.9, 1],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 0.4,
        ease: "easeInOut",
        times: [0, 0.2, 0.5, 1],
      }
    }
  };

  return (
    <motion.div
      ref={cellRef}
      key={`${rowIndex}-${colIndex}`}
      className="aspect-square border-2 border-transparent rounded-lg bg-gray-800/50 
                 backdrop-blur-sm hover:bg-gray-700/50 cursor-pointer overflow-hidden
                 transition-colors duration-200"
      style={{
        borderColor: isLastMove ? ownerColor : 'transparent',
      }}
      initial="initial"
      variants={cellVariants}
      animate={cell.orbs >= criticalMass ? "explode" : "initial"}
      whileHover={{ 
        scale: 1.02,
        borderColor: currentPlayerColor,
      }}
      whileTap={{ scale: 0.98 }}
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
              scale: 1.2,
              opacity: 0,
              transition: { 
                duration: 0.2,
                ease: "easeOut"
              }
            }}
            className="w-full h-full flex items-center justify-center"
          >
            <Orb
              color={ownerColor}
              count={cell.orbs}
              isUnstable={isUnstable}
              cellSize={Math.min(cellSize.width, cellSize.height)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Cell;
