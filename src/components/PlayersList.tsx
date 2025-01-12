import React from 'react';
import { Users, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface Player {
  id: string;
  isAdmin?: boolean;
}

interface PlayersListProps {
  players: Player[];
  currentPlayer: string;
  playerColors: Record<string, string>;
}

const PlayersList: React.FC<PlayersListProps> = ({
  players,
  currentPlayer,
  playerColors,
}) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="w-5 h-5 text-white" />
        <h2 className="text-lg font-semibold text-white">Players</h2>
      </div>
      
      <div className="space-y-2">
        {players.map((player) => (
          <motion.div
            key={player.id}
            className={`flex items-center justify-between p-3 rounded-lg
              ${currentPlayer === player.id ? 'bg-gray-700/50' : 'bg-gray-800/30'}
              hover:bg-gray-700/30 transition-colors`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: playerColors[player.id] }}
              />
              <span className="font-medium text-white">Player {player.id}</span>
            </div>
            {player.isAdmin && (
              <Crown className="w-4 h-4 text-yellow-400" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};


export default PlayersList;