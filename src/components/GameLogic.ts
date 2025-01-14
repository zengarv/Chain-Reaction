import { Cell, Player} from '../types/game';
  
export class GameLogic {
  private board: Cell[][];
  private rows: number;
  private cols: number;
  private players: Player[];
  private currentPlayerIndex: number;
  private maxExplosionIterations: number;

  constructor(rows: number, cols: number, players: Player[], initialBoard?: Cell[][]) {
    this.rows = rows;
    this.cols = cols;
    this.players = [...players];
    this.currentPlayerIndex = 0;
    this.board = initialBoard ? 
      initialBoard.map(row => row.map(cell => ({...cell}))) : 
      this.createEmptyBoard();
    // Set maximum number of iterations based on board size
    this.maxExplosionIterations = rows * cols * 2;
  }
  
  public addOrb(row: number, col: number): boolean {
    const currentPlayer = this.getCurrentPlayer();
    if (!this.isValidMove(row, col, currentPlayer.id)) return false;

    const newBoard = this.board.map(r => r.map(c => ({...c})));
    const cell = newBoard[row][col];
    const criticalMass = this.getCriticalMass(row, col);
    
    newBoard[row][col] = {
      orbs: cell.orbs + 1,
      playerId: currentPlayer.id
    };

    this.board = newBoard;
    return this.board[row][col].orbs >= criticalMass;
  }

  public handleExplosions(
    onExplode: (board: Cell[][]) => void,
    delay: number
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      let hasExploded = false;
      let explosionOccurred = true;
      let iterationCount = 0;
      let previousBoardStates = new Set<string>();
      
      while (explosionOccurred && iterationCount < this.maxExplosionIterations) {
        explosionOccurred = false;
        const newBoard = this.board.map(row => row.map(cell => ({...cell})));
        
        // Create a string representation of the current board state
        const currentBoardState = this.getBoardStateString(newBoard);
        
        // Check if we've seen this board state before
        if (previousBoardStates.has(currentBoardState)) {
          // Force end game if we detect a loop
          this.handlePerpetualExplosion();
          resolve(true);
          return;
        }
        
        previousBoardStates.add(currentBoardState);

        for (let row = 0; row < this.rows; row++) {
          for (let col = 0; col < this.cols; col++) {
            const cell = newBoard[row][col];
            if (cell.orbs >= this.getCriticalMass(row, col)) {
              this.explodeCell(newBoard, row, col);
              explosionOccurred = true;
              hasExploded = true;
            }
          }
        }

        if (explosionOccurred) {
          this.board = newBoard;
          onExplode(this.board);
          await new Promise(resolve => setTimeout(resolve, delay));
          iterationCount++;
        }
      }
      
      // If we've hit the maximum iterations, handle it as a special case
      if (iterationCount >= this.maxExplosionIterations) {
        this.handlePerpetualExplosion();
      }

      resolve(hasExploded);
    });
  }
  private getBoardStateString(board: Cell[][]): string {
    return board.map(row => 
      row.map(cell => 
        `${cell.orbs}-${cell.playerId || 'empty'}`
      ).join('|')
    ).join('_');
  }
  
  private handlePerpetualExplosion(): void {
    // Find the player with the most orbs
    const orbCounts = new Map<string, number>();
    
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.board[row][col];
        if (cell.playerId) {
          orbCounts.set(
            cell.playerId, 
            (orbCounts.get(cell.playerId) || 0) + cell.orbs
          );
        }
      }
    }
    
    // Determine winner based on orb count
    let maxOrbs = 0;
    let winningPlayerId: string | null = null;
    
    orbCounts.forEach((count, playerId) => {
      if (count > maxOrbs) {
        maxOrbs = count;
        winningPlayerId = playerId;
      }
    });
    
    // Set all cells to the winning player
    if (winningPlayerId) {
      this.board = this.board.map(row =>
        row.map(cell => ({
          orbs: 1,
          playerId: winningPlayerId
        }))
      );
    }
    
    // Deactivate all other players
    this.players = this.players.map(player => ({
      ...player,
      isActive: player.id === winningPlayerId
    }));
  }

    private createEmptyBoard(): Cell[][] {
      return Array(this.rows).fill(null).map(() =>
        Array(this.cols).fill(null).map(() => ({ orbs: 0, playerId: null }))
      );
    }
  
    private getCriticalMass(row: number, col: number): number {
      const isCorner = (row === 0 || row === this.rows - 1) && 
                      (col === 0 || col === this.cols - 1);
      const isEdge = row === 0 || col === 0 || 
                     row === this.rows - 1 || col === this.cols - 1;
      return isCorner ? 2 : isEdge ? 3 : 4;
    }
  
    private getAdjacentCells(row: number, col: number): [number, number][] {
      const adjacent: [number, number][] = [];
      if (row > 0) adjacent.push([row - 1, col]);
      if (row < this.rows - 1) adjacent.push([row + 1, col]);
      if (col > 0) adjacent.push([row, col - 1]);
      if (col < this.cols - 1) adjacent.push([row, col + 1]);
      return adjacent;
    }
    
      public isValidMove(row: number, col: number, playerId: string): boolean {
        const cell = this.board[row][col];
        // A move is valid if:
        // 1. The cell is empty (no player owns it)
        // 2. The current player owns the cell
        return !cell.playerId || cell.playerId === playerId;
      }
    
  
    private explodeCell(board: Cell[][], row: number, col: number): void {
      const criticalMass = this.getCriticalMass(row, col);
      const currentPlayerId = board[row][col].playerId;
      
      board[row][col] = {
        orbs: board[row][col].orbs - criticalMass,
        playerId: board[row][col].orbs - criticalMass > 0 ? currentPlayerId : null
      };
  
      const adjacent = this.getAdjacentCells(row, col);
      for (const [adjRow, adjCol] of adjacent) {
        board[adjRow][adjCol] = {
          orbs: board[adjRow][adjCol].orbs + 1,
          playerId: currentPlayerId
        };
      }
    }
  
    public getCurrentPlayer(): Player {
      return this.players[this.currentPlayerIndex];
    }
  
    public getNextPlayer(): void {
      do {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      } while (!this.players[this.currentPlayerIndex].isActive);
    }
  
    public getBoard(): Cell[][] {
      return this.board;
    }
  
    public updatePlayerStatus(): void {
      this.players = this.players.map(player => ({
        ...player,
        isActive: player.isActive && !this.isPlayerEliminated(player.id)
      }));
    }
  
    private isPlayerEliminated(playerId: string): boolean {
      return !this.board.some(row => 
        row.some(cell => cell.playerId === playerId)
      );
    }
  
    public getActivePlayers(): Player[] {
      return this.players.filter(player => player.isActive);
    }
  
    public getPlayerById(id: string): Player | undefined {
      return this.players.find(player => player.id === id);
    }
  }
  