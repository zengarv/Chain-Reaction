import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { motion } from 'framer-motion';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [boardSize, setBoardSize] = useState({ rows: 9, cols: 6 });
  const [maxPlayers, setMaxPlayers] = useState(2);

  const createRoom = () => {
    if (!playerName.trim()) return;
    const roomId = nanoid(10);
    navigate(`/room/${roomId}`, {
      state: { isAdmin: true, settings: { boardSize, maxPlayers } }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <motion.div 
        className="max-w-md w-full p-8 bg-gray-800 rounded-xl shadow-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="flex items-center justify-center mb-8"
          variants={itemVariants}
        >
          <motion.div
            whileHover={{ 
              scale: 1.2,
              rotate: 360,
              transition: {
                rotate: {
                  duration: 1,
                  ease: "linear"
                },
                scale: {
                  duration: 0.2
                }
              }
            }}
          >
            <Gamepad2 className="w-12 h-12 text-purple-500" />
          </motion.div>
          <motion.h1 
            className="text-3xl font-bold ml-3"
            whileHover={{ scale: 1.05 }}
          >
            Chain Reaction
          </motion.h1>
        </motion.div>

        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium mb-2">Player Name</label>
            <motion.input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your name"
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium mb-2">Board Size</label>
            <div className="grid grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.02 }}>
                <input
                  type="number"
                  value={boardSize.rows}
                  onChange={(e) => setBoardSize(prev => ({ ...prev, rows: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  min="4"
                  max="12"
                />
                <span className="text-xs text-gray-400 mt-1">Rows</span>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }}>
                <input
                  type="number"
                  value={boardSize.cols}
                  onChange={(e) => setBoardSize(prev => ({ ...prev, cols: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  min="4"
                  max="12"
                />
                <span className="text-xs text-gray-400 mt-1">Columns</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium mb-2">Max Players</label>
            <motion.input
              type="number"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg"
              min="2"
              max="8"
              whileHover={{ scale: 1.02 }}
            />
          </motion.div>

          <motion.button
            onClick={createRoom}
            disabled={!playerName.trim()}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Room
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;