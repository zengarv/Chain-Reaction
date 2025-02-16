import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GameBoard from './GameBoard';
import PlayersList from './PlayersList';
import ChatWindow from './ChatWindow';
import { Cell, GameSettings, Message, Player } from '../types/game';
import { RoomHeader } from './RoomHeader';
import GameOver from './GameOver';
import socket from '../socket';

const PLAYER_COLORS: Record<string, string> = {
  player1: '#FF4C3C',
  player2: '#2EFF31',
  player3: '#3498FF',
  player4: '#F1C40F',
  player5: '#9B59B6',
  player6: '#E67E22',
  player7: '#01F9C6',
  player8: '#F0FEFB',
};

const DEFAULT_SETTINGS: GameSettings = {
  boardSize: { rows: 9, cols: 6 },
};

const createEmptyBoard = (rows: number, cols: number): Cell[][] => {
  const board: Cell[][] = [];
  for (let i = 0; i < rows; i++) {
    const row: Cell[] = [];
    for (let j = 0; j < cols; j++) {
      row.push({ orbs: 0, playerId: null });
    }
    board.push(row);
  }
  return board;
};

const GameRoom: React.FC = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const storedPlayerName = sessionStorage.getItem('playerName');
  const storedIsAdmin = sessionStorage.getItem('isAdmin') === 'true';
  const initialPlayerName = location.state?.playerName || storedPlayerName;
  const isAdmin =
    location.state?.isAdmin !== undefined
      ? location.state.isAdmin
      : storedIsAdmin;

  useEffect(() => {
    if (!initialPlayerName) {
      navigate(`/join/${roomId}`);
    }
  }, [initialPlayerName, navigate, roomId]);

  if (!initialPlayerName) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Redirecting...
      </div>
    );
  }

  const defaultPlayer: Player = {
    id: '',
    name: initialPlayerName,
    color: PLAYER_COLORS.player1,
    isAdmin: isAdmin,
    isActive: true,
  };

  const boardSize =
    (location.state?.settings?.boardSize as GameSettings['boardSize']) ||
    DEFAULT_SETTINGS.boardSize;
  const initialBoard: Cell[][] = isAdmin
    ? createEmptyBoard(boardSize.rows, boardSize.cols)
    : [];

  const [board, setBoard] = useState<Cell[][]>(initialBoard);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(defaultPlayer);
  const [winner, setWinner] = useState<Player | null>(null);
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(
    null
  );
  const [isExploding, setIsExploding] = useState(false);
  const [myId, setMyId] = useState<string>('');

  // Ensure myId is always a string
  useEffect(() => {
    setMyId(socket.id || '');
  }, []);

  useEffect(() => {
    socket.emit('joinRoom', {
      roomId,
      playerName: initialPlayerName,
      isAdmin,
      gridSize: isAdmin ? boardSize : undefined,
    });
  }, [roomId, initialPlayerName, isAdmin, boardSize]);

  // Listen for gridSizeUpdate to set the board for non-admins
  useEffect(() => {
    socket.on('gridSizeUpdate', (gridSize: { rows: number; cols: number }) => {
      const emptyBoard = createEmptyBoard(gridSize.rows, gridSize.cols);
      setBoard(emptyBoard);
    });
    return () => {
      socket.off('gridSizeUpdate');
    };
  }, []);

  // Listen for updateGameState to update board, players, and current turn
  useEffect(() => {
    socket.on(
      'updateGameState',
      (data: {
        board: any[][];
        currentTurn: string;
        players: Player[];
        winner: Player | null;
        lastMove?: { row: number; col: number };
      }) => {
        const convertedBoard = data.board.map((row) =>
          row.map((cell) => ({
            orbs: cell.count,
            playerId: cell.owner,
          }))
        );
        setBoard(convertedBoard);
  
        const coloredPlayers = data.players.map((player, index) => ({
          ...player,
          color: Object.values(PLAYER_COLORS)[
            index % Object.values(PLAYER_COLORS).length
          ],
        }));
        setPlayers(coloredPlayers);
  
        const cp = coloredPlayers.find((p) => p.id === data.currentTurn);
        if (cp) {
          setCurrentPlayer(cp);
        }
        if (data.winner) {
          setWinner(data.winner);
          setGameStarted(false);
        } else {
          setGameStarted(true);
        }
  
        // Update lastMove regardless of which player made the move
        setLastMove(data.lastMove || null);
      }
    );
    return () => {
      socket.off('updateGameState');
    };
  }, []);
  

  // Listen for player list updates so the player count reflects new joins
  useEffect(() => {
    const handlePlayerListUpdate = (updatedPlayers: Player[]) => {
      const coloredPlayers = updatedPlayers.map((player, index) => ({
        ...player,
        color: Object.values(PLAYER_COLORS)[
          index % Object.values(PLAYER_COLORS).length
        ],
      }));
      setPlayers(coloredPlayers);
    };
    socket.on('playerListUpdate', handlePlayerListUpdate);
    return () => {
      socket.off('playerListUpdate', handlePlayerListUpdate);
    };
  }, []);

  // Listen for chat messages
  useEffect(() => {
    const handleChatMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on('chatMessage', handleChatMessage);
    return () => {
      socket.off('chatMessage', handleChatMessage);
    };
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (!gameStarted || isExploding) return;
    setLastMove({ row, col });
    socket.emit('makeMove', { roomId, row, col });
  };

  const handleStartGame = () => {
    if (players.length >= 2) {
      socket.emit('gameStart', { roomId });
    }
  };

  const handlePlayAgain = () => {
    socket.emit('playAgain', { roomId });
    setWinner(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <motion.div
        className="p-3 lg:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="lg:col-span-3 relative">
            <RoomHeader
              roomId={roomId || ''}
              playerCount={players.length}
              currentPlayer={currentPlayer}
              showStartButton={
                !gameStarted && currentPlayer.isAdmin && players.length >= 2
              }
              onStartGame={handleStartGame}
              gameStarted={gameStarted}
              isAdmin={isAdmin}
            />
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 lg:p-4 relative">
              <GameBoard
                board={board}
                currentPlayer={currentPlayer}
                onCellClick={handleCellClick}
                players={players}
                lastMove={lastMove}
                isMyTurn={myId === currentPlayer.id}
              />
              {winner && (
                <GameOver
                  winner={{ name: winner.name, color: winner.color }}
                  onPlayAgain={handlePlayAgain}
                  onShufflePlayers={() => {}}
                />
              )}
            </div>
          </div>
          <div className="space-y-3 lg:space-y-4 lg:min-w-[320px]">
            <PlayersList
              players={players}
              currentPlayer={currentPlayer.id}
              gameStarted={gameStarted}
            />
            <ChatWindow
              messages={messages}
              players={players}
              roomId={roomId || ''}
              currentPlayerName={initialPlayerName}
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
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GameRoom;
