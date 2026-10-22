import type { Difficulty } from "sudoku-gen/dist/types/difficulty.type";

export type SudokuSave = {
  difficulty: Difficulty;
  puzzle: string; // 81 chars, '-' = blank, givens fixed
  solution: string; // 81 chars
  board: string[]; // 81 entries, '' = blank, else '1'-'9'
  notes: string[][]; // 81 entries, each a list of noted digits
  mistakes: number;
  seconds: number;
  solved: boolean;
};

const KEY = "sudoku-save";

export function loadSave(): SudokuSave | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SudokuSave) : null;
  } catch {
    return null;
  }
}

export function writeSave(save: SudokuSave) {
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
