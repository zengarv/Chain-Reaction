import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GameBoard from './GameBoard';
import PlayersList from './PlayersList';
import ChatWindow from './ChatWindow';
import { Cell, GameSettings, Message } from '../types/game';

const DEFAULT_SETTINGS: GameSettings = {
  boardSize: { rows: 9, cols: 6 },
  maxPlayers: 2
};

const GameRoom: React.FC = () => {

  const { roomId } = useParams();
  const location = useLocation();
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
    const emptyBoard: Cell[][] = Array(rows).fill(null).map(() =>
      Array(cols).fill(null).map(() => ({ orbs: 0, playerId: null }))
    );
    setBoard(emptyBoard);
  }, [location.state]);

  const getCriticalMass = (row: number, col: number): number => {
    const isCorner = (row === 0 || row === board.length - 1) && 
                    (col === 0 || col === board[0].length - 1);
    const isEdge = row === 0 || col === 0 || 
                   row === board.length - 1 || col === board[0].length - 1;
    return isCorner ? 2 : isEdge ? 3 : 4;
  };

  const getAdjacentCells = (row: number, col: number) => {
    const adjacent: [number, number][] = [];
    if (row > 0) adjacent.push([row - 1, col]);
    if (row < board.length - 1) adjacent.push([row + 1, col]);
    if (col > 0) adjacent.push([row, col - 1]);
    if (col < board[0].length - 1) adjacent.push([row, col + 1]);
    return adjacent;
  };

  const explodeCell = async (newBoard: Cell[][], row: number, col: number): Promise<boolean> => {
    const criticalMass = getCriticalMass(row, col);
    if (newBoard[row][col].orbs < criticalMass) return false;

    const currentPlayerId = newBoard[row][col].playerId;
    newBoard[row][col].orbs -= criticalMass;
    if (newBoard[row][col].orbs === 0) newBoard[row][col].playerId = null;

    const adjacent = getAdjacentCells(row, col);
    let hasExploded = false;

    for (const [adjRow, adjCol] of adjacent) {
      newBoard[adjRow][adjCol].playerId = currentPlayerId;
      newBoard[adjRow][adjCol].orbs++;
      if (newBoard[adjRow][adjCol].orbs >= getCriticalMass(adjRow, adjCol)) {
        hasExploded = true;
      }
    }

    return hasExploded;
  };

  const handleCellClick = async (row: number, col: number) => {
    if (isExploding || !board[row]?.[col]) return;
    
    // Check if the cell can be played
    if (board[row][col].playerId && board[row][col].playerId !== currentPlayer) return;

    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard[row][col] = {
      ...newBoard[row][col],
      orbs: (newBoard[row][col].orbs || 0) + 1,
      playerId: currentPlayer
    };

    setBoard(newBoard);

    // Check for chain reactions
    if (newBoard[row][col].orbs >= getCriticalMass(row, col)) {
      setIsExploding(true);
      let hasExploded = true;
      while (hasExploded) {
        hasExploded = false;
        for (let r = 0; r < newBoard.length; r++) {
          for (let c = 0; c < newBoard[0].length; c++) {
            if (newBoard[r][c].orbs >= getCriticalMass(r, c)) {
              hasExploded = await explodeCell(newBoard, r, c) || hasExploded;
              setBoard([...newBoard]); // Update board state to show explosion
              await new Promise(resolve => setTimeout(resolve, 200)); // Add delay for animation
            }
          }
        }
      }
      setIsExploding(false);
      // Switch players after explosion chain is complete
      setCurrentPlayer(currentPlayer === 'player1' ? 'player2' : 'player1');
    }
  };

  if (board.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
        <div className="text-white text-xl">Loading game board...</div>
      </div>
    );
  }
  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      playerId: currentPlayer,
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  if (board.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
        <div className="text-white text-xl">Loading game board...</div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gray-900 p-3 lg:p-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-4"
        variants={containerVariants}
      >
        <motion.div 
          className="lg:col-span-3"
          variants={itemVariants}
        >
          <motion.h2 
            className="text-2xl font-bold text-white mb-3"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Room: {roomId}
          </motion.h2>
          
          <motion.div 
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 lg:p-4 flex items-center justify-center"
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="w-full max-w-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <GameBoard
                board={board}
                currentPlayer={currentPlayer}
                onCellClick={handleCellClick}
                playerColors={playerColors}
              />
            </motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="space-y-3 lg:space-y-4"
          variants={itemVariants}
        >
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <PlayersList
              players={players}
              currentPlayer={currentPlayer}
              playerColors={playerColors}
            />
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <ChatWindow
              messages={messages}
              playerColors={playerColors}
              onSendMessage={handleSendMessage}
            />
          </motion.div>
          
          <AnimatePresence>
            {!gameStarted && players.find(p => p.id === currentPlayer)?.isAdmin && (
              <motion.button
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium 
                         hover:bg-purple-700 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 0 10px rgba(147, 51, 234, 0.5)"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setGameStarted(true)}
                transition={{ type: "spring", stiffness: 400 }}
              >
                Start Game
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default GameRoom;