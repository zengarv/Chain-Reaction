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
      <h3 className="text-lg font-medium text-gray-300 mb-3">Players</h3>
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
              <span className="text-xs text-purple-400 ml-auto">Admin</span>
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