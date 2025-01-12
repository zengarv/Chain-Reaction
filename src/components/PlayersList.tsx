import React from 'react';
import { Users, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Player } from '../types/game';

interface PlayersListProps {
  players: Player[];
  currentPlayer: string;
  gameStarted: boolean;
}

const PlayersList: React.FC<PlayersListProps> = ({ players, currentPlayer, gameStarted }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
      <motion.div 
        className="flex items-center space-x-2 mb-4"
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
      <div className="space-y-2">
        {players.map((player) => (
          <motion.div
            key={player.id}
            className={`flex items-center space-x-3 p-2 rounded-lg ${
              player.id === currentPlayer ? 'bg-gray-700/50' : ''
            }`}
            animate={{
              opacity: player.isActive ? 1 : 0.5,
              scale: player.id === currentPlayer ? 1.02 : 1,
            }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: player.color }}
            />
            <span className="text-gray-300">{player.name}</span>
            {player.isAdmin && (
              <motion.div
                whileHover={{ translateY: -5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Crown className="w-4 h-4 text-yellow-400" />
              </motion.div>
            )}
            {!player.isActive && gameStarted && (
              <span className="text-xs text-red-400 ml-auto">Eliminated</span>
            )}
            {player.id === currentPlayer && gameStarted && (
              <span className="text-xs text-green-400 ml-auto">Current Turn</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PlayersList;