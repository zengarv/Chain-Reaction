import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface GameOverProps {
  winner: {
    name: string;
    color: string;
  };
  onPlayAgain: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ winner, onPlayAgain }) => {
  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800/90 rounded-xl p-6 max-w-md w-full text-center"
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
        </p>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-purple-600 text-white py-3 px-6 rounded-lg font-medium 
                   hover:bg-purple-700 transition-colors w-full"
          onClick={onPlayAgain}
        >
          Play Again
        </motion.button>
      </motion.div>
    </div>
  );
};

export default GameOver;