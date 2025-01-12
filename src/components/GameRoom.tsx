import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GameLogic } from './GameLogic';
import { RoomHeader } from './RoomHeader';
import GameBoard from './GameBoard';
import PlayersList from './PlayersList';
import ChatWindow from './ChatWindow';
import { GameSettings, Message } from '../types/game';
import { Cell } from '../types/game';

const DEFAULT_SETTINGS: GameSettings = {
  boardSize: { rows: 9, cols: 6 },
  maxPlayers: 2
};

const GameRoom: React.FC = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const [gameLogic, setGameLogic] = useState<GameLogic | null>(null);
  const [board, setBoard] = useState<Cell[][]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<string>('player1');
  const [isExploding, setIsExploding] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const playerColors: Record<string, string> = {
    'player1': '#FF5555',
    'player2': '#50FA7B',
    'player3': '#BD93F9',
    'player4': '#FFB86C',
  };

  const players = [
    { id: 'player1', isAdmin: true },
    { id: 'player2', isAdmin: false },
  ];

  useEffect(() => {
    const settings = location.state?.settings || DEFAULT_SETTINGS;
    const { rows, cols } = settings.boardSize;
    const newGameLogic = new GameLogic(rows, cols);
    setGameLogic(newGameLogic);
    setBoard(newGameLogic.getBoard());
  }, [location.state]);

  const updateBoard = useCallback((newBoard: Cell[][]) => {
    setBoard([...newBoard]);
  }, []);

  const handleCellClick = async (row: number, col: number) => {
    if (!gameLogic || isExploding) return;

    const willExplode = gameLogic.addOrb(row, col, currentPlayer);
    updateBoard(gameLogic.getBoard());

    if (willExplode) {
      setIsExploding(true);
      const exploded = await gameLogic.handleExplosions(updateBoard, 200);
      setIsExploding(false);
      
      if (exploded) {
        setCurrentPlayer(currentPlayer === 'player1' ? 'player2' : 'player1');
      }
    }
  };

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      playerId: currentPlayer,
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  if (!gameLogic || board.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
        <div className="text-white text-xl">Loading game board...</div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-900 p-3 lg:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-4">
        <motion.div className="lg:col-span-3">
          <RoomHeader roomId={roomId || ''} playerCount={players.length} />
          
          <motion.div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 lg:p-4">
            <GameBoard
              board={board}
              currentPlayer={currentPlayer}
              onCellClick={handleCellClick}
              playerColors={playerColors}
            />
          </motion.div>
        </motion.div>
        
        <motion.div className="space-y-3 lg:space-y-4">
          <PlayersList
            players={players}
            currentPlayer={currentPlayer}
            playerColors={playerColors}
          />
          
          <ChatWindow
            messages={messages}
            playerColors={playerColors}
            onSendMessage={handleSendMessage}
          />
          
          {!gameStarted && players.find(p => p.id === currentPlayer)?.isAdmin && (
            <motion.button
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium 
                       hover:bg-purple-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setGameStarted(true)}
            >
              Start Game
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default GameRoom;