import React from 'react';
import { Users, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../types/game';

interface PlayersListProps {
  players: Player[];
  currentPlayer: string;
  gameStarted: boolean;
}

const PlayersList: React.FC<PlayersListProps> = ({ 
  players, 
  currentPlayer, 
  gameStarted
}) => {
  const currentPlayerData = players.find(p => p.id === currentPlayer);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <motion.div 
          className="flex items-center space-x-2"
          whileHover={{ x: 5 }}
        >
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Users className="w-5 h-5 text-purple-400" />
          </motion.div>
          <h2 className="text-lg font-semibold text-white">Players</h2>
        </motion.div>
        
        <div className="flex items-center gap-2">
          {gameStarted && currentPlayerData && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-700/50"
              style={{ minWidth: '140px' }}
            >
              <div 
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: currentPlayerData.color }}
              />
              <span 
                className="text-sm font-medium truncate"
                style={{ color: currentPlayerData.color }}
              >
                {currentPlayerData.name}'s Turn
              </span>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {players.map((player) => (
            <motion.div
              key={player.id}
              className={`flex items-center space-x-3 p-2 rounded-lg ${
                player.id === currentPlayer ? 'bg-gray-700/50' : ''
              }`}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: player.isActive ? 1 : 0.5,
                scale: player.id === currentPlayer ? 1.02 : 1,
                y: 0
              }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: player.isSpectator ? '#6B7280' : player.color }}
              />
              
              <span className={`${player.isSpectator ? 'text-gray-400' : 'text-gray-300'}`}>
                {player.name}
              </span>
              
              {player.isSpectator && (
                <Eye className="w-4 h-4 text-gray-400 ml-auto" />
              )}
              {!player.isSpectator && !player.isActive && gameStarted && (
                <span className="text-xs text-red-400 ml-auto">Eliminated</span>
              )}
              {!player.isSpectator && player.id === currentPlayer && gameStarted && (
                <span className="text-xs text-green-400 ml-auto">Current Turn</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PlayersList;