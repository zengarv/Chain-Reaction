import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import GameBoard from './GameBoard';
import PlayersList from './PlayersList';
import ChatWindow from './ChatWindow';
import { Cell, GameSettings, Message, Player } from '../types/game';
import { GameLogic } from './GameLogic';
import { RoomHeader } from './RoomHeader';
import GameOver from './GameOver';

const PLAYER_COLORS = {
  player1: '#FF4C3C', // Bright Red
  player2: '#2EFF31', // Vivid Green
  player3: '#3498FF', // Bright Blue
  player4: '#F1C40F', // Golden Yellow
  player5: '#9B59B6', // Deep Purple
  player6: '#E67E22', // Bright Orange
  player7: '#01F9C6', // Teal
  player8: '#F0FEFB', // White
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
  const [winner, setWinner] = useState<Player | null>(null);
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null);

  const updateBoard = useCallback((newBoard: Cell[][]) => {
    setBoard([...newBoard]);
  }, []);

  useEffect(() => {
    const settings = location.state?.settings || DEFAULT_SETTINGS;
    const { maxPlayers } = settings;
    
    const initialPlayers = Array.from({ length: maxPlayers }, (_, index) => ({
      id: `player${index + 1}`,
      name: index === 0 && location.state?.playerName ? 
        location.state.playerName : 
        `Player ${index + 1}`,
      color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
      isAdmin: index === 0,
      isActive: true
    }));

    setPlayers(initialPlayers);
    initializeGame(initialPlayers, settings);
  }, [location.state]);

  const initializeGame = (gamePlayers: Player[], settings: GameSettings) => {
    const newGameLogic = new GameLogic(
      settings.boardSize.rows,
      settings.boardSize.cols,
      gamePlayers
    );

    setGameLogic(newGameLogic);
    setBoard(newGameLogic.getBoard());
    setCurrentPlayer(newGameLogic.getCurrentPlayer());
  };

  const handleCellClick = async (row: number, col: number) => {
    if (!gameLogic || !currentPlayer || isExploding || !gameStarted) return;
  
    if (!gameLogic.isValidMove(row, col, currentPlayer.id)) return;
  
    setLastMove({ row, col });
    const willExplode = gameLogic.addOrb(row, col);
    updateBoard(gameLogic.getBoard());
  
    if (willExplode) {
      setIsExploding(true);
      await gameLogic.handleExplosions(updateBoard, 200);
      gameLogic.updatePlayerStatus();
      
      // Update only the active status of players
      setPlayers(prevPlayers => 
        prevPlayers.map(player => ({
          ...player,
          isActive: gameLogic.getActivePlayers().some(p => p.id === player.id)
        }))
      );
      
      const activePlayers = gameLogic.getActivePlayers();
      if (activePlayers.length <= 1) {
        setGameStarted(false);
        // Find the winning player from the current players array to preserve the name
        const winningPlayer = players.find(p => p.id === (activePlayers[0]?.id || currentPlayer.id));
        setWinner(winningPlayer || currentPlayer);
      } else {
        gameLogic.getNextPlayer();
        setCurrentPlayer(gameLogic.getCurrentPlayer());
      }
      
      setIsExploding(false);
    } else {
      gameLogic.getNextPlayer();
      setCurrentPlayer(gameLogic.getCurrentPlayer());
    }
  };  

  const handleStartGame = () => {
    if (players.length >= 2) {
      setGameStarted(true);
      // Reset the game state to ensure a clean start
      const settings = location.state?.settings || DEFAULT_SETTINGS;
      initializeGame(players, settings);
    }
  };


  const handlePlayAgain = () => {
    const settings = location.state?.settings || DEFAULT_SETTINGS;
    const { maxPlayers } = settings;
    
    // Create fresh players array with preserved names
    const initialPlayers = players.map(player => ({
      ...player,
      isActive: true // Reset active status
    }));
  
    // Create new game logic instance
    const newGameLogic = new GameLogic(
      settings.boardSize.rows,
      settings.boardSize.cols,
      initialPlayers
    );
  
    // Explicitly reset all game state
    setGameLogic(newGameLogic);
    setBoard(newGameLogic.getBoard());
    setPlayers(initialPlayers);
    setCurrentPlayer(newGameLogic.getCurrentPlayer());
    setWinner(null);
    setGameStarted(false);
    setMessages([]);
    setLastMove(null);
    setIsExploding(false); // Add this line to ensure explosion state is reset
  };

  const handleRenamePlayer = (playerId: string, newName: string) => {
    setPlayers(prevPlayers =>
      prevPlayers.map(player =>
        player.id === playerId
          ? { ...player, name: newName }
          : player
      )
    );
  };

  const handleShufflePlayers = () => {
    setPlayers(prevPlayers => {
      const shuffled = [...prevPlayers];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = shuffled[i].name;
        shuffled[i] = { ...shuffled[i], name: shuffled[j].name };
        shuffled[j] = { ...shuffled[j], name: temp };
      }
      return shuffled;
    });
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
      className="min-h-screen bg-gray-900 p-3 lg:p-4 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-4">
        <motion.div className="lg:col-span-3 relative">
          <RoomHeader 
            roomId={roomId || ''} 
            playerCount={players.length}
            currentPlayer={currentPlayer}
            showStartButton={!gameStarted && currentPlayer.isAdmin && players.length >= 2}
            onStartGame={handleStartGame}
          />
          
          <motion.div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 lg:p-4 relative">
            <GameBoard
              board={board}
              currentPlayer={currentPlayer}
              onCellClick={handleCellClick}
              playerColors={PLAYER_COLORS}
              lastMove={lastMove}
            />
            {winner && (
              <GameOver
                winner={{
                  name: winner.name,
                  color: winner.color
                }}
                onPlayAgain={handlePlayAgain}
                onShufflePlayers={handleShufflePlayers}
              />
            )}
          </motion.div>
        </motion.div>
        
        <motion.div className="space-y-3 lg:space-y-4">
          <PlayersList
            players={players}
            currentPlayer={currentPlayer.id}
            gameStarted={gameStarted}
            onRenamePlayer={handleRenamePlayer}
            onShufflePlayers={handleShufflePlayers}
          />
          
          <ChatWindow
            messages={messages}
            playerColors={PLAYER_COLORS}
            onSendMessage={handleSendMessage}
            players={players}
          />
          
          {!gameStarted && currentPlayer.isAdmin && (
            <motion.button
              className="hidden lg:block w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium 
                       hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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