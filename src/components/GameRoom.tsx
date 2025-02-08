import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GameBoard from './GameBoard';
import PlayersList from './PlayersList';
import ChatWindow from './ChatWindow';
import { Cell, GameSettings, Message, Player } from '../types/game';
import { GameLogic } from './GameLogic';
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
  boardSize: { rows: 9, cols: 6 }
};

const GameRoom: React.FC = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Use sessionStorage so that each browser tab gets its own player name and admin status.
  const storedPlayerName = sessionStorage.getItem("playerName");
  const storedIsAdmin = sessionStorage.getItem("isAdmin") === "true";

  // Use location.state if available; otherwise, fall back to sessionStorage.
  const initialPlayerName = location.state?.playerName || storedPlayerName;
  const isAdmin = (location.state?.isAdmin !== undefined)
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

  // Create a default player object based on the provided name and admin flag.
  const defaultPlayer: Player = {
    id: initialPlayerName,
    name: initialPlayerName,
    color: PLAYER_COLORS.player1,
    isAdmin: isAdmin,
    isActive: true,
  };

  // Initialize state synchronously so that gameLogic and currentPlayer are never null.
  const [gameLogic, setGameLogic] = useState<GameLogic>(
    new GameLogic(DEFAULT_SETTINGS.boardSize.rows, DEFAULT_SETTINGS.boardSize.cols, [defaultPlayer])
  );
  const [board, setBoard] = useState<Cell[][]>(gameLogic.getBoard());
  const [players, setPlayers] = useState<Player[]>([defaultPlayer]);
  const [isExploding, setIsExploding] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(defaultPlayer);
  const [winner, setWinner] = useState<Player | null>(null);
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null);

  // Connect via Socket.IO.
  useEffect(() => {
    socket.emit("joinRoom", { roomId, playerName: initialPlayerName, isAdmin });
  
    const handlePlayerListUpdate = (updatedPlayers: Player[]) => setPlayers(updatedPlayers);
    const handleChatMessage = (msg: Message) => setMessages(prev => [...prev, msg]);
  
    socket.on("playerListUpdate", handlePlayerListUpdate);
    socket.on("chatMessage", handleChatMessage);
  
    return () => {
      socket.off("playerListUpdate", handlePlayerListUpdate);
      socket.off("chatMessage", handleChatMessage);
    };
  }, [roomId, initialPlayerName, isAdmin]);

  // For the admin: reinitialize the game logic (using settings from location.state if available).
  useEffect(() => {
    if (isAdmin) {
      const settings = location.state?.settings || DEFAULT_SETTINGS;
      const adminPlayer: Player = {
        id: initialPlayerName,
        name: initialPlayerName,
        color: PLAYER_COLORS.player1,
        isAdmin: true,
        isActive: true,
      };
      const newGameLogic = new GameLogic(settings.boardSize.rows, settings.boardSize.cols, [adminPlayer]);
      setGameLogic(newGameLogic);
      setBoard(newGameLogic.getBoard());
      setCurrentPlayer(adminPlayer);
      setPlayers([adminPlayer]);
    }
  }, [isAdmin, initialPlayerName, location.state]);

  // For non-admins: initialize a default game state (so the board is visible) and listen for gameStart.
  useEffect(() => {
    if (!isAdmin) {
      socket.on("gameStart", (data: { players: Player[]; board: Cell[][]; settings: GameSettings }) => {
        const newGameLogic = new GameLogic(
          data.settings.boardSize.rows,
          data.settings.boardSize.cols,
          data.players,
          data.board
        );
        setGameLogic(newGameLogic);
        setBoard(newGameLogic.getBoard());
        setPlayers(data.players);
        setCurrentPlayer(newGameLogic.getCurrentPlayer());
        setGameStarted(true);
      });
    }
    return () => {
      socket.off("gameStart");
    };
  }, [isAdmin]);

  const updateBoard = useCallback((newBoard: Cell[][]) => {
    setBoard([...newBoard]);
  }, []);

  const handleCellClick = async (row: number, col: number) => {
    if (!gameLogic || !currentPlayer || isExploding) return;
    if (!gameLogic.isValidMove(row, col, currentPlayer.id)) return;
  
    setLastMove({ row, col });
    const willExplode = gameLogic.addOrb(row, col);
    updateBoard(gameLogic.getBoard());
  
    if (willExplode) {
      setIsExploding(true);
      await gameLogic.handleExplosions(updateBoard, 200);
      gameLogic.updatePlayerStatus();
      
      setPlayers(prevPlayers =>
        prevPlayers.map(player => ({
          ...player,
          isActive: gameLogic.getActivePlayers().some(p => p.id === player.id)
        }))
      );
      
      const activePlayers = gameLogic.getActivePlayers();
      if (activePlayers.length <= 1) {
        setGameStarted(false);
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
      const settings = location.state?.settings || DEFAULT_SETTINGS;
      // Emit gameStart so non-admins update their game state.
      socket.emit("gameStart", {
        roomId,
        players,
        settings,
        board: new GameLogic(settings.boardSize.rows, settings.boardSize.cols, players).getBoard(),
      });
      // Reinitialize game logic for the admin.
      const newGameLogic = new GameLogic(settings.boardSize.rows, settings.boardSize.cols, players);
      setGameLogic(newGameLogic);
      setBoard(newGameLogic.getBoard());
      setCurrentPlayer(newGameLogic.getCurrentPlayer());
      setGameStarted(true);
    }
  };

  const handlePlayAgain = () => {
    const settings = location.state?.settings || DEFAULT_SETTINGS;
    const initialPlayers = players.map(player => ({
      ...player,
      isActive: true
    }));
    const newGameLogic = new GameLogic(settings.boardSize.rows, settings.boardSize.cols, initialPlayers);
    setGameLogic(newGameLogic);
    setBoard(newGameLogic.getBoard());
    setPlayers(initialPlayers);
    setCurrentPlayer(newGameLogic.getCurrentPlayer());
    setWinner(null);
    setGameStarted(false);
    setMessages([]);
    setLastMove(null);
    setIsExploding(false);
  };

  const handleSendMessage = (text: string) => {
    if (!gameLogic || !currentPlayer) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      playerId: currentPlayer.id,
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Main UI is always rendered */}
      <motion.div className="p-3 lg:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="lg:col-span-3 relative">
            <RoomHeader 
              roomId={roomId || ''} 
              playerCount={players.length}
              currentPlayer={currentPlayer}
              showStartButton={!gameStarted && currentPlayer.isAdmin && players.length >= 2}
              onStartGame={handleStartGame}
            />
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 lg:p-4 relative">
              <GameBoard
                board={board}
                currentPlayer={currentPlayer}
                onCellClick={handleCellClick}
                playerColors={PLAYER_COLORS}
                lastMove={lastMove}
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
          <div className="space-y-3 lg:space-y-4">
            <PlayersList
              players={players}
              currentPlayer={currentPlayer.id}
              gameStarted={gameStarted}
            />
            <ChatWindow
              messages={messages}
              playerColors={PLAYER_COLORS}
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
      {/* Overlay message until the game is started */}
      {!gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-white text-2xl bg-black/50 p-4 rounded">
            {currentPlayer.isAdmin
              ? "Waiting to start the game..."
              : "Waiting for the admin to start the game..."}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRoom;
