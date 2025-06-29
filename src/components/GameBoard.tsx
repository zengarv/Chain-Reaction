import React, { useEffect, useState, useRef } from 'react';
import { Cell as CellType, Player } from '../types/game';
import Cell from './Cell';

interface GameBoardProps {
  board: CellType[][];
  onCellClick: (row: number, col: number) => void;
  currentPlayer: Player;
  players: Player[];
  lastMove: { row: number; col: number } | null;
  isMyTurn: boolean; // Indicates if the logged-in user is the current turn player
  forceOrientation?: 'portrait' | 'landscape' | 'auto'; // Override orientation
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  currentPlayer,
  onCellClick,
  players,
  lastMove,
  isMyTurn,
  forceOrientation = 'auto',
}) => {
  // Guard clause: if board is not yet defined or empty, render a loading message.
  // This must be first, before any hooks are called
  if (!board || board.length === 0 || !board[0]) {
    return <div className="text-white">Loading board...</div>;
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const rows = board.length;
  const cols = board[0].length;

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        
        // Use the actual container dimensions with a safety margin
        const containerWidth = rect.width;
        const containerHeight = rect.height;        // Use most of the container space but leave margin for safety
        const availableWidth = containerWidth * 0.98; // 98% to prevent overflow (increased from 95%)
        const availableHeight = containerHeight * 0.98; // 98% to prevent overflow (increased from 95%)
        
        setDimensions({ 
          width: Math.max(150, availableWidth), // Minimum 150px width
          height: Math.max(150, availableHeight) // Minimum 150px height
        });
      }
    };

    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    const handleResize = () => {
      setTimeout(updateDimensions, 100); // Small delay for stability
    };
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);    };  }, [rows, cols, forceOrientation]); // Add forceOrientation to dependencies
  // Determine if we should transpose the board based on orientation
  const shouldTranspose = () => {
    if (forceOrientation === 'auto') {
      // Auto mode: analyze available space to determine optimal orientation
      if (dimensions.width === 0 || dimensions.height === 0) return false;
      
      // Check if we're likely in a mobile/portrait layout by looking at container aspect ratio
      const containerAspectRatio = dimensions.width / dimensions.height;
      const isLikelyMobilePortrait = containerAspectRatio < 1.2; // More tall than wide
      
      // For mobile portrait layouts, prefer transposed board (more rows than columns)
      if (isLikelyMobilePortrait && cols > rows) {
        return true; // Transpose to make it taller
      }
      
      // For wide layouts, prefer original orientation if it's already wide
      if (!isLikelyMobilePortrait && cols > rows) {
        return false; // Keep original wide orientation
      }
      
      // Calculate how well the board fits in both orientations
      // Original orientation (no transpose)
      const originalFitWidth = dimensions.width / cols;
      const originalFitHeight = dimensions.height / rows;
      const originalCellSize = Math.min(originalFitWidth, originalFitHeight);
      
      // Transposed orientation
      const transposedFitWidth = dimensions.width / rows;
      const transposedFitHeight = dimensions.height / cols;
      const transposedCellSize = Math.min(transposedFitWidth, transposedFitHeight);
      
      // Use the orientation that allows for larger cells (better space utilization)
      // More aggressive threshold for mobile portrait to prefer tall boards
      const improvementThreshold = isLikelyMobilePortrait ? 0.95 : 1.02;
      return transposedCellSize > (originalCellSize * improvementThreshold);
    }
    
    if (forceOrientation === 'landscape') {
      // In landscape mode, we want more columns than rows (wide board)
      return rows > cols;
    } else if (forceOrientation === 'portrait') {
      // In portrait mode, we want more rows than columns (tall board)  
      return cols > rows;
    }
    return false;
  };

  const isTransposed = shouldTranspose();

  // Get the effective board dimensions (after potential transposition)
  const effectiveRows = isTransposed ? cols : rows;
  const effectiveCols = isTransposed ? rows : cols;

  // Create transposed board if needed
  const displayBoard = isTransposed 
    ? Array.from({ length: effectiveRows }, (_, rowIndex) =>
        Array.from({ length: effectiveCols }, (_, colIndex) => board[colIndex][rowIndex])
      )
    : board;
  const getCriticalMass = (row: number, col: number): number => {
    // Use effective board dimensions for critical mass calculation
    const boardHeight = effectiveRows;
    const boardWidth = effectiveCols;
    
    const isCorner =
      (row === 0 || row === boardHeight - 1) &&
      (col === 0 || col === boardWidth - 1);
    const isEdge =
      row === 0 ||
      col === 0 ||
      row === boardHeight - 1 ||
      col === boardWidth - 1;
    return isCorner ? 2 : isEdge ? 3 : 4;
  };

  const currentPlayerColor = currentPlayer.color;  // Calculate optimal cell size based on available space
  const calculateBoardDimensions = () => {
    if (dimensions.width === 0 || dimensions.height === 0) {
      return { cellSize: 50, boardWidth: effectiveCols * 50, boardHeight: effectiveRows * 50 };
    }

    // Apply orientation override - but now we're working with transposed dimensions
    let availableWidth = dimensions.width;
    let availableHeight = dimensions.height;
    
    if (forceOrientation === 'landscape') {
      // Force landscape: swap dimensions if height > width
      if (availableHeight > availableWidth) {
        [availableWidth, availableHeight] = [availableHeight, availableWidth];
      }
    } else if (forceOrientation === 'portrait') {
      // Force portrait: swap dimensions if width > height
      if (availableWidth > availableHeight) {
        [availableWidth, availableHeight] = [availableHeight, availableWidth];
      }
    }

    // Minimum and maximum cell sizes to prevent visual glitches
    const minCellSize = 20;
    const maxCellSize = 100;
      // Grid gap between cells - smaller on mobile
    const gap = window.innerWidth < 1024 ? 1 : 2; // Use 1px gap on mobile, 2px on desktop
    const totalGapWidth = (effectiveCols - 1) * gap;
    const totalGapHeight = (effectiveRows - 1) * gap;
      // Leave small padding to prevent overflow - reduced for mobile
    const padding = 4; // Reduced from 8 to 4
    const availableWidthForCells = Math.max(0, availableWidth - totalGapWidth - padding);
    const availableHeightForCells = Math.max(0, availableHeight - totalGapHeight - padding);
    
    // Calculate maximum possible cell size based on width and height constraints
    const cellSizeByWidth = effectiveCols > 0 ? availableWidthForCells / effectiveCols : minCellSize;
    const cellSizeByHeight = effectiveRows > 0 ? availableHeightForCells / effectiveRows : minCellSize;
    
    // Use the smaller of the two to ensure the board fits completely
    let cellSize = Math.min(cellSizeByWidth, cellSizeByHeight);
    
    // Apply min/max constraints
    cellSize = Math.max(minCellSize, Math.min(maxCellSize, cellSize));
      // Calculate final board dimensions
    const boardWidth = effectiveCols * cellSize + totalGapWidth;
    const boardHeight = effectiveRows * cellSize + totalGapHeight;
    
    return { cellSize, boardWidth, boardHeight, gap };
  };
  const { cellSize, boardWidth, boardHeight, gap } = calculateBoardDimensions();

  // Handle cell click with coordinate transformation
  const handleCellClick = (displayRow: number, displayCol: number) => {
    if (isTransposed) {
      // Transform coordinates back to original board space
      const originalRow = displayCol;
      const originalCol = displayRow;
      onCellClick(originalRow, originalCol);
    } else {
      // No transformation needed
      onCellClick(displayRow, displayCol);
    }
  };

  // Transform last move coordinates for display
  const getDisplayLastMove = () => {
    if (!lastMove) return null;
    
    if (isTransposed) {
      return {
        row: lastMove.col,
        col: lastMove.row
      };
    }
    return lastMove;
  };

  const displayLastMove = getDisplayLastMove();
  return (    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center p-0 lg:p-2 game-board-container relative"
      style={{ 
        minHeight: '150px', 
        minWidth: '150px',
        maxWidth: '100%', 
        maxHeight: '100%', 
        overflow: 'hidden',        boxSizing: 'border-box'
      }}
    >
      <div
        className="grid transition-all duration-300 ease-in-out game-board-grid"
        style={{
          gridTemplateColumns: `repeat(${effectiveCols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${effectiveRows}, ${cellSize}px)`,
          width: `${boardWidth}px`,
          height: `${boardHeight}px`,
          maxWidth: '100%',
          maxHeight: '100%',
          gap: `${gap}px`,
          boxSizing: 'border-box'
        }}
      >
        {displayBoard.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const ownerColor = cell.playerId
              ? players.find((p: Player) => p.id === cell.playerId)?.color ||
                '#FFFFFF'
              : 'transparent';

            return (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                rowIndex={rowIndex}
                colIndex={colIndex}
                cell={cell}
                criticalMass={getCriticalMass(rowIndex, colIndex)}
                ownerColor={ownerColor}
                onCellClick={handleCellClick}
                currentPlayerColor={currentPlayerColor}
                isLastMove={
                  displayLastMove?.row === rowIndex && displayLastMove?.col === colIndex
                }
                isCurrentPlayerTurn={isMyTurn}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default GameBoard;
