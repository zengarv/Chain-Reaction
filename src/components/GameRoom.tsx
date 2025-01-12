import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import GameBoard from './GameBoard';
import PlayersList from './PlayersList';
import ChatWindow from './ChatWindow';
import { Cell, GameSettings, Message, Player } from '../types/game';
import { GameLogic } from './GameLogic';
import { RoomHeader } from './RoomHeader';

const PLAYER_COLORS = {
  player1: '#FF5555', // Red
  player2: '#50FA7B', // Green
  player3: '#BD93F9', // Purple
  player4: '#FFB86C', // Orange
  player5: '#8BE9FD', // Cyan
  player6: '#F1FA8C', // Yellow
  player7: '#FF79C6', // Pink
  player8: '#50FA7B', // Lime
};

const DEFAULT_SETTINGS: GameSettings = {
  boardSize: { rows: 9, cols: 6 },
  maxPlayers: 2
};

const GameRoom: React.FC = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const [gameLogic, setGameLogic] = useState<GameLogic | null>(null);
  const [board, setBoard] = useState<Cell[][]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isExploding, setIsExploding] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  // Initialize players and game logic based on settings
  useEffect(() => {
    const settings = location.state?.settings || DEFAULT_SETTINGS;
    const { maxPlayers } = settings;
    
    // Create initial players array based on maxPlayers
    const initialPlayers = Array.from({ length: maxPlayers }, (_, index) => ({
      id: `player${index + 1}`,
      name: index === 0 && location.state?.playerName ? 
        location.state.playerName : 
        `Player ${index + 1}`,
      color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
      isAdmin: index === 0,
      isActive: true
    }));

    // Initialize game logic with the settings
    const newGameLogic = new GameLogic(
      settings.boardSize.rows,
      settings.boardSize.cols,
      initialPlayers
    );

    setGameLogic(newGameLogic);
    setBoard(newGameLogic.getBoard());
    setPlayers(initialPlayers);
    setCurrentPlayer(newGameLogic.getCurrentPlayer());
  }, [location.state]);

  const updateBoard = useCallback((newBoard: Cell[][]) => {
    setBoard([...newBoard]);
  }, []);

  const handleCellClick = async (row: number, col: number) => {
    if (!gameLogic || !currentPlayer || isExploding || !gameStarted) return;

    if (!gameLogic.isValidMove(row, col, currentPlayer.id)) return;

    const willExplode = gameLogic.addOrb(row, col);
    updateBoard(gameLogic.getBoard());

    if (willExplode) {
      setIsExploding(true);
      await gameLogic.handleExplosions(updateBoard, 200);
      gameLogic.updatePlayerStatus();
      const activePlayers = gameLogic.getActivePlayers();
      
      if (activePlayers.length <= 1) {
        setGameStarted(false);
      } else {
        gameLogic.getNextPlayer();
        const nextPlayer = gameLogic.getCurrentPlayer();
        setCurrentPlayer(nextPlayer);
      }
      
      setPlayers(activePlayers);
      setIsExploding(false);
    } else {
      gameLogic.getNextPlayer();
      const nextPlayer = gameLogic.getCurrentPlayer();
      setCurrentPlayer(nextPlayer);
      setPlayers(gameLogic.getActivePlayers());
    }
  };

  const handleStartGame = () => {
    if (players.length >= 2) {
      setGameStarted(true);
    }
  };

  const handleSendMessage = (text: string) => {
    if (!gameLogic || !currentPlayer) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      playerId: currentPlayer.id,
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  if (!gameLogic || !currentPlayer) {
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
          <RoomHeader 
            roomId={roomId || ''} 
            playerCount={players.length}
            currentPlayer={currentPlayer}
          />
          
          <motion.div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 lg:p-4">
            <GameBoard
              board={board}
              currentPlayer={currentPlayer}
              onCellClick={handleCellClick}
              playerColors={PLAYER_COLORS}
            />
          </motion.div>
        </motion.div>
        
        <motion.div className="space-y-3 lg:space-y-4">
          <PlayersList
            players={players}
            currentPlayer={currentPlayer.id}
            gameStarted={gameStarted}
          />
          
          <ChatWindow
            messages={messages}
            playerColors={PLAYER_COLORS}
            onSendMessage={handleSendMessage}
          />
          
          {!gameStarted && currentPlayer.isAdmin && (
            <motion.button
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium 
                       hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartGame}
              disabled={players.length < 2}
            >
              Start Game ({players.length}/{players.length} Players)
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default GameRoom;