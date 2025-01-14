import React, { useState } from 'react';
import { Users, Crown, Pencil, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../types/game';

interface PlayersListProps {
  players: Player[];
  currentPlayer: string;
  gameStarted: boolean;
  onRenamePlayer: (playerId: string, newName: string) => void;
  onShufflePlayers?: () => void;
}

const PlayersList: React.FC<PlayersListProps> = ({ 
  players, 
  currentPlayer, 
  gameStarted,
  onRenamePlayer,
  onShufflePlayers 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleEditStart = (player: Player) => {
    setEditingId(player.id);
    setEditName(player.name);
  };

  const handleEditSubmit = (playerId: string) => {
    if (editName.trim()) {
      onRenamePlayer(playerId, editName.trim());
    }
    setEditingId(null);
  };

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
        
        {onShufflePlayers && !gameStarted && (
          <motion.button
            onClick={onShufflePlayers}
            className="p-2 text-purple-400 hover:text-purple-300 transition-colors"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <Shuffle className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="wait">
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
              layout
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: player.color }}
              />
              
              {editingId === player.id ? (
                <motion.input
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleEditSubmit(player.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit(player.id)}
                  className="bg-gray-700 text-white px-2 py-1 rounded outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300">{player.name}</span>
                  {!gameStarted && (
                    <motion.button
                      onClick={() => handleEditStart(player)}
                      whileHover={{ scale: 1.1, rotate: 15 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-gray-400 hover:text-purple-400 transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                    </motion.button>
                  )}
                </div>
              )}

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
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlayersList;