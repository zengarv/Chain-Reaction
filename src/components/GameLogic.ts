export interface Cell {
    orbs: number;
    playerId: string | null;
  }
  
  export class GameLogic {
    private board: Cell[][];
    private rows: number;
    private cols: number;
  
    constructor(rows: number, cols: number, initialBoard?: Cell[][]) {
      this.rows = rows;
      this.cols = cols;
      this.board = initialBoard || this.createEmptyBoard();
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
  
    public addOrb(row: number, col: number, playerId: string): boolean {
      if (!this.isValidMove(row, col, playerId)) return false;
      
      // Create a new board state
      const newBoard = this.board.map(row => [...row]);
      if (!newBoard[row][col].playerId) {
        newBoard[row][col] = { orbs: 1, playerId };
      } else {
        newBoard[row][col] = {
          ...newBoard[row][col],
          orbs: newBoard[row][col].orbs + 1
        };
      }
      
      this.board = newBoard;
      return this.board[row][col].orbs >= this.getCriticalMass(row, col);
    }
  
    private isValidMove(row: number, col: number, playerId: string): boolean {
      return !this.board[row][col].playerId || this.board[row][col].playerId === playerId;
    }
  
    public async handleExplosions(
      onExplode: (board: Cell[][]) => void,
      delay: number
    ): Promise<boolean> {
      let hasExploded = false;
      let explosionOccurred = true;
  
      while (explosionOccurred) {
        explosionOccurred = false;
        const newBoard = this.board.map(row => [...row]);
  
        for (let row = 0; row < this.rows; row++) {
          for (let col = 0; col < this.cols; col++) {
            if (newBoard[row][col].orbs >= this.getCriticalMass(row, col)) {
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
        }
      }
  
      return hasExploded;
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
  
    public getBoard(): Cell[][] {
      return this.board;
    }
  }
  