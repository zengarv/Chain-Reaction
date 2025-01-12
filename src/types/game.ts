export interface GameSettings {
  boardSize: {
    rows: number;
    cols: number;
  };
  maxPlayers: number;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  isAdmin: boolean;
}

export interface Cell {
  orbs: number;
  playerId: string | null;
}