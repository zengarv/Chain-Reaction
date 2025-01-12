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
    <motion.div 
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div 
        className="flex items-center space-x-2 mb-4"
        whileHover={{ x: 5 }}
      >
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Users className="w-5 h-5 text-white" />
        </motion.div>
        <h2 className="text-lg font-semibold text-white">Players</h2>
      </motion.div>
      
      <div className="space-y-2">
        {players.map((player) => (
          <motion.div
            key={player.id}
            className={`flex items-center justify-between p-3 rounded-lg
              ${currentPlayer === player.id ? 'bg-gray-700/50' : 'bg-gray-800/30'}
              hover:bg-gray-700/30 transition-colors`}
            whileHover={{ scale: 1.03, x: 5 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: playerColors[player.id] }}
                whileHover={{ scale: 1.2 }}
                transition={{ type: "spring", stiffness: 400 }}
              />
              <span className="font-medium text-white">Player {player.id}</span>
            </div>
            {player.isAdmin && (
              <motion.div
                whileHover={{ 
                  scale: 1.2,
                  rotate: 360,
                  transition: {
                    rotate: {
                      duration: 1,
                      ease: "linear"
                    }
                  }
                }}
              >
                <Crown className="w-4 h-4 text-yellow-400" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PlayersList;