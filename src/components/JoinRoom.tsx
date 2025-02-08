// JoinRoom.tsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';

const JoinRoom: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [username, setUsername] = useState('');

  const joinRoom = () => {
    if (!username.trim()) return;
    localStorage.setItem("playerName", username);
    localStorage.setItem("isAdmin", "false");
    navigate(`/room/${roomId}`, {
      state: {
        isAdmin: false,
        playerName: username,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <motion.div 
        className="max-w-md w-full p-8 bg-gray-800 rounded-xl shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.h1 
          className="text-3xl font-bold mb-4 text-center"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          Join Room
        </motion.h1>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-purple-500" />
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg"
              placeholder="Enter your username"
              required
            />
          </div>
          <motion.button
            onClick={joinRoom}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!username.trim()}
          >
            Join Room
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinRoom;
