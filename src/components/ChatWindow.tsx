import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Message, Player } from '../types/game';
import { motion } from 'framer-motion';

interface ChatWindowProps {
  messages: Message[];
  playerColors: Record<string, string>;
  onSendMessage: (message: string) => void;
  players: Player[]; // Add players prop
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  playerColors,
  onSendMessage,
  players,
}) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  // Function to get player name from ID
  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : playerId;
  };

  return (
    <motion.div 
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 h-[300px] flex flex-col"
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
          <MessageCircle className="w-5 h-5 text-purple-400" />
        </motion.div>
        <h2 className="text-lg font-semibold text-white">Chat</h2>
      </motion.div>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg) => (
          <motion.div 
            key={msg.id} 
            className="text-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02, x: 5 }}
          >
            <span className="font-medium" style={{ color: playerColors[msg.playerId] }}>
              {getPlayerName(msg.playerId)}:
            </span>{' '}
            <span className="text-white">{msg.text}</span>
          </motion.div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <motion.input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm"
          placeholder="Type a message..."
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        <motion.button
          type="submit"
          className="bg-gray-700 p-2 rounded hover:bg-gray-600 transition-colors"
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            whileTap={{ translateX: 2, translateY: -2, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Send className="w-4 h-4 text-white" />
          </motion.div>
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ChatWindow;