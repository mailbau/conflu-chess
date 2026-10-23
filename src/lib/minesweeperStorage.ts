import type { Cell, Difficulty } from "./minesweeper";

export type MinesweeperSave = {
  difficulty: Difficulty;
  board: Cell[][];
  minesPlaced: boolean; // false until the first click (mines are placed then)
  status: "playing" | "won" | "lost";
  seconds: number;
};

const KEY = "minesweeper-save";

export function loadSave(): MinesweeperSave | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MinesweeperSave) : null;
  } catch {
    return null;
  }
}

export function writeSave(save: MinesweeperSave) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    // ignore (private mode, storage full, etc.)
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
