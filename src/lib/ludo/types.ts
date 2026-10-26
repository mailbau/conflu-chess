export type Color = "red" | "green" | "yellow" | "blue";

export const COLORS: Color[] = ["red", "green", "yellow", "blue"];

export type Player = {
  id: string;
  name: string;
  color: Color;
  // progress per token: -1 = in base, 0..50 = main track (relative to this
  // color's start), 51..55 = this color's home column, 56 = finished
  tokens: [number, number, number, number];
};

export type Phase =
  | { kind: "lobby" }
  | { kind: "roll" }
  | { kind: "move"; roll: number; legal: number[] }
  | { kind: "finished"; winner: string };

export type LudoState = {
  players: Player[]; // seat order = turn order
  current: number;
  phase: Phase;
  lastRoll: number | null;
  turnStartedAt: string;
  log: string[];
};

export const BASE = -1;
export const MAIN_TRACK_LEN = 51; // progress 0..50
export const HOME_START = 51;
export const FINISHED = 56;
export const TURN_TIMEOUT_MS = 30_000;
export const MAX_PLAYERS = 4;
export const LOG_LIMIT = 30;
