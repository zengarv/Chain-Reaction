import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Message } from '../types/game';

interface ChatWindowProps {
  messages: Message[];
  playerColors: Record<string, string>;
  onSendMessage: (message: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  playerColors,
  onSendMessage,
}) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 h-[300px] flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <MessageCircle className="w-5 h-5 text-white" />
        <h2 className="text-lg font-semibold text-white">Chat</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm">
            <span className="font-medium" style={{ color: playerColors[msg.playerId] }}>
              Player {msg.playerId}:
            </span>{' '}
            <span className="text-white">{msg.text}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-gray-700 p-2 rounded hover:bg-gray-600 transition-colors"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;