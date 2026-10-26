import type { Cell, Difficulty, Run } from "./kakuro/types";

export type KakuroSave = {
  difficulty: Difficulty;
  rows: number;
  cols: number;
  cells: Cell[][];
  runs: Run[];
  board: string[][]; // player's entries, "" for empty/black
  seconds: number;
  solved: boolean;
};

const KEY = "kakuro-save";

export function loadSave(): KakuroSave | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as KakuroSave) : null;
  } catch {
    return null;
  }
}

export function writeSave(save: KakuroSave) {
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
