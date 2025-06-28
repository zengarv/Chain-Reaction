import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Shuffle } from 'lucide-react';

interface GameOverProps {
  winner: {
    name: string;
    color: string;
  };
  onPlayAgain: () => void;
  isAdmin: boolean;
  onShufflePlayers: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ winner, onPlayAgain, isAdmin, onShufflePlayers }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800/90 rounded-xl p-6 max-w-md w-full text-center relative"
      >
        <motion.div
          initial={{ rotate: -10, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="inline-block mb-4"
        >
          <Trophy size={48} style={{ color: winner.color }} />
        </motion.div>
        
        <motion.h2 
          className="text-2xl font-bold mb-2"
          style={{ color: winner.color }}
        >
          {winner.name} Won!
        </motion.h2>
        
        <p className="text-gray-300 mb-6">
          {winner.name} has conquered the board!
        </p>          <div className="space-y-3">
          {isAdmin && (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-purple-600 text-white py-3 px-6 rounded-lg font-medium 
                         hover:bg-purple-700 transition-colors w-full"
                onClick={onPlayAgain}
              >
                Play Again
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium 
                         hover:bg-gray-700 transition-colors w-full"
                onClick={onShufflePlayers}
              >
                <Shuffle className="w-4 h-4" />
                Shuffle Players
              </motion.button>
            </>
          )}
          {!isAdmin && (
            <p className="text-gray-400 text-sm">
              Waiting for admin to restart the game...
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default GameOver;