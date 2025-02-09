import React, { useState } from 'react';
import { Home, Copy, Check, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Player } from '../types/game';
import { useNavigate } from 'react-router-dom';

interface RoomHeaderProps {
  roomId: string;
  playerCount: number;
  currentPlayer: Player;
  showStartButton: boolean;
  onStartGame: () => void;
  gameStarted: boolean;
  isAdmin: boolean;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({ 
  roomId, 
  playerCount, 
  showStartButton,
  onStartGame,
  gameStarted,
  isAdmin
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 mb-3"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Home className="w-6 h-6 text-purple-400 cursor-pointer" 
                onClick={() => navigate('/')}
            />
          </motion.div>
          <div>
            <h2 className="text-lg text-gray-400 font-medium">Room ID</h2>
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ x: 5 }}
            >
              <span className="text-xl font-bold text-white">{roomId}</span>
              <motion.button
                onClick={copyRoomId}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </motion.button>
            </motion.div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 ml-auto">
          {!gameStarted && (
            <motion.div 
              className="flex items-center gap-2 text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-sm">
                {isAdmin ? "Waiting for players" : "Waiting for admin"}
              </span>
            </motion.div>
          )}
          
          {showStartButton && (
            <motion.button
              className="lg:hidden bg-purple-600 text-white py-2 px-4 rounded-lg font-medium 
                       hover:bg-purple-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartGame}
            >
              Start Game
            </motion.button>
          )}
          
          <motion.div 
            className="hidden md:flex items-center space-x-2 bg-gray-700/50 px-3 py-1 rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-sm text-gray-300">
              {playerCount} Players Connected
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};