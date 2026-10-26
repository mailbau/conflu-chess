import type { Cell, Run } from "./kakuro/types";

export type KakuroSave = {
  puzzleId: string;
  size: number;
  difficulty: string;
  rows: number;
  cols: number;
  cells: Cell[][];
  runs: Run[];
  board: string[][]; // player's entries, "" for empty/black
  seconds: number;
  solved: boolean;
};

const KEY = "kakuro-save";
const PLAYED_KEY = "kakuro-played-ids";

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

// tracks which puzzle IDs have already been played, so "new puzzle" doesn't
// repeat one until the whole pool for that size+difficulty is exhausted
export function loadPlayedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(PLAYED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function markPlayed(id: string) {
  try {
    const ids = loadPlayedIds();
    ids.add(id);
    localStorage.setItem(PLAYED_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}
