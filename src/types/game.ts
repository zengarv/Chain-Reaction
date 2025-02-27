export interface GameSettings {
  boardSize: {
    rows: number;
    cols: number;
  };
}

export interface Player {
  id: string;
  name: string;
  color: string;
  isAdmin: boolean;
  isActive: boolean;
}

export interface Cell {
  orbs: number;
  playerId: string | null;
}

export interface Message {
  id: string;
  playerId: string;
  text: string;
  timestamp: Date;
}