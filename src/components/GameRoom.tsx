import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GameBoard from './GameBoard';
import PlayersList from './PlayersList';
import ChatWindow from './ChatWindow';
import Timer from './Timer';
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
  timer: { duration: 20 },
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
  const timerSettings =
    (location.state?.settings?.timer as GameSettings['timer']) ||
    DEFAULT_SETTINGS.timer;
  const initialBoard: Cell[][] = isAdmin
    ? createEmptyBoard(boardSize.rows, boardSize.cols)
    : [];

  const [board, setBoard] = useState<Cell[][]>(initialBoard);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(defaultPlayer);
  const [winner, setWinner] = useState<Player | null>(null);  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(
    null
  );
  const [myId, setMyId] = useState<string>('');  const [timer, setTimer] = useState<{ timeLeft: number; isActive: boolean }>({ 
    timeLeft: 0, 
    isActive: false 
  });
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'auto'>('auto');

  // Ref to store current player colors to avoid stale closure issues
  const playerColorsRef = useRef<Map<string, string>>(new Map());

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
      timerSettings: isAdmin ? timerSettings : undefined,
    });
  }, [roomId, initialPlayerName, isAdmin, boardSize, timerSettings]);

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
        currentTurn: string | null;
        players: Player[];
        winner: Player | null;
        lastMove?: { row: number; col: number };
      }) => {
        const convertedBoard = data.board.map((row) =>
          row.map((cell) => ({
            orbs: cell.count,
            playerId: cell.owner,
          }))
        );        setBoard(convertedBoard);
  
        // Create a map of existing player colors using the ref
        const existingColors = new Map(playerColorsRef.current);

        // Assign colors to players, preserving existing ones
        const coloredPlayers = data.players.map((player, index) => ({
          ...player,
          color: existingColors.get(player.id) || 
                 Object.values(PLAYER_COLORS)[index % Object.values(PLAYER_COLORS).length],
        }));
        
        setPlayers(coloredPlayers);

        // Update the ref with the new color mappings
        playerColorsRef.current.clear();
        coloredPlayers.forEach(player => {
          playerColorsRef.current.set(player.id, player.color);
        });// Only update current player if the game is ongoing (currentTurn is not null)
        if (data.currentTurn) {
          const cp = coloredPlayers.find((p: Player) => p.id === data.currentTurn);
          if (cp) {
            setCurrentPlayer(cp);
          }
        }        if (data.winner) {
          // Find the winner in the colored players array to get the correct color
          const winnerWithColor = coloredPlayers.find((p: Player) => p.id === data.winner!.id);
          if (winnerWithColor) {
            setWinner(winnerWithColor);
          } else {
            // Fallback: assign default color if not found
            setWinner({
              ...data.winner,
              color: PLAYER_COLORS.player1 // fallback color
            });
          }
          setGameStarted(false);
        } else {
          setWinner(null); // Clear the winner when game restarts
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
      // Create a map of existing player colors using the ref
      const existingColors = new Map(playerColorsRef.current);

      // Assign colors to players, preserving existing ones
      const coloredPlayers = updatedPlayers.map((player, index) => ({
        ...player,
        color: existingColors.get(player.id) || 
               Object.values(PLAYER_COLORS)[index % Object.values(PLAYER_COLORS).length],
      }));
      
      setPlayers(coloredPlayers);

      // Update the ref with the new color mappings
      playerColorsRef.current.clear();
      coloredPlayers.forEach(player => {
        playerColorsRef.current.set(player.id, player.color);
      });
    };
    socket.on('playerListUpdate', handlePlayerListUpdate);
    return () => {
      socket.off('playerListUpdate', handlePlayerListUpdate);
    };
  }, []);

  // Keep the playerColorsRef in sync with the players state
  useEffect(() => {
    playerColorsRef.current.clear();
    players.forEach(player => {
      playerColorsRef.current.set(player.id, player.color);
    });
  }, [players]);// Listen for chat messages
  useEffect(() => {
    const handleChatMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on('chatMessage', handleChatMessage);
    return () => {
      socket.off('chatMessage', handleChatMessage);
    };
  }, []);

  // Listen for error messages from server
  useEffect(() => {
    const handleErrorMessage = (error: string) => {
      console.error('Server error:', error);
      // You could also show this error in the UI if needed
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        playerId: 'Server',
        text: `Error: ${error}`,
        timestamp: new Date()
      }]);
    };
    socket.on('errorMessage', handleErrorMessage);
    return () => {
      socket.off('errorMessage', handleErrorMessage);
    };
  }, []);

  // Listen for timer updates
  useEffect(() => {
    const handleTimerUpdate = (timerData: { timeLeft: number; isActive: boolean }) => {
      setTimer(timerData);
    };
    socket.on('timerUpdate', handleTimerUpdate);
    return () => {
      socket.off('timerUpdate', handleTimerUpdate);
    };
  }, []);
  const handleCellClick = (row: number, col: number) => {
    if (!gameStarted || winner) return; // Also check if there's a winner
    setLastMove({ row, col });
    socket.emit('makeMove', { roomId, row, col });
  };

  const handleStartGame = () => {
    if (players.length >= 2) {
      socket.emit('gameStart', { roomId });
    }
  };  const handlePlayAgain = () => {
    socket.emit('playAgain', { roomId });
    setWinner(null);
    setLastMove(null);  // Reset lastMove on client side too
  };
  const handleShufflePlayers = () => {
    socket.emit('shufflePlayers', { roomId });
  };

  const handleOrientationToggle = () => {
    setOrientation(prev => {
      if (prev === 'auto') return 'portrait';
      if (prev === 'portrait') return 'landscape';
      return 'auto';
    });
  };  return (
    <div className="min-h-screen bg-gray-900 relative overflow-x-hidden">
      <motion.div
        className="min-h-screen flex flex-col p-2 lg:p-3 overflow-x-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header always at top */}
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
          orientation={orientation}
          onOrientationToggle={handleOrientationToggle}
        />        {/* Responsive layout: side-by-side on large screens, single scroll on mobile/portrait */}
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-4 xl:grid-cols-5 gap-2 lg:gap-3 min-h-0 overflow-x-hidden overflow-y-auto lg:overflow-y-hidden">          {/* GameBoard section - fixed height on mobile for single scroll */}
          <div className="lg:col-span-3 xl:col-span-4 flex flex-col min-h-0 flex-shrink-0 lg:h-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-0 lg:p-3 relative h-[90vh] lg:flex-1 lg:min-h-0 flex items-center justify-center overflow-hidden">
              <GameBoard
                board={board}
                currentPlayer={currentPlayer}
                onCellClick={handleCellClick}
                players={players}
                lastMove={lastMove}
                isMyTurn={myId === currentPlayer.id && !players.find(p => p.id === myId)?.isSpectator && !winner}
                forceOrientation={orientation}
              />
              {winner && (
                <GameOver
                  winner={{ name: winner.name, color: winner.color }}
                  onPlayAgain={handlePlayAgain}
                  isAdmin={isAdmin}
                  onShufflePlayers={handleShufflePlayers}
                />
              )}
            </div>
          </div>          {/* Players and Chat section - no inner scroll on mobile, flows with page scroll */}
          <div className="flex flex-col space-y-2 lg:space-y-3 min-w-0 lg:min-w-[280px] flex-shrink-0 lg:h-auto lg:overflow-y-auto lg:overflow-x-hidden">
            <PlayersList
              players={players}
              currentPlayer={currentPlayer.id}
              gameStarted={gameStarted}
              isAdmin={isAdmin}
              onShufflePlayers={handleShufflePlayers}
            />
            {gameStarted && timer.isActive && (
              <Timer
                timeLeft={timer.timeLeft}
                isActive={timer.isActive}
                currentPlayerName={currentPlayer.name}
                totalDuration={timerSettings.duration}
              />
            )}            <div className="lg:flex-1 lg:min-h-[200px] lg:overflow-hidden">
              <ChatWindow
                messages={messages}
                players={players}
                roomId={roomId || ''}
                currentPlayerName={initialPlayerName}
              />
            </div>
            {!gameStarted && currentPlayer.isAdmin && (
              <motion.button
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium 
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
