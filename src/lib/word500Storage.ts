// player's own markers per guess tile, UI aid only (not game truth):
// "absent"/"present"/"correct" track a guess; "wrong" flags a fixed mistake
export type Mark = "absent" | "present" | "correct" | "wrong";

export type Word500Save = {
  mode: "daily" | "free";
  dateKey: string; // daily: today's date; free: id of the current game
  word: string;
  guesses: string[];
  annotations: Mark[][];
  status: "playing" | "won" | "lost";
};

const DAILY_KEY = "word500-daily";
const FREE_KEY = "word500-free";

function key(mode: "daily" | "free") {
  return mode === "daily" ? DAILY_KEY : FREE_KEY;
}

export function loadSave(mode: "daily" | "free"): Word500Save | null {
  try {
    const raw = localStorage.getItem(key(mode));
    return raw ? (JSON.parse(raw) as Word500Save) : null;
  } catch {
    return null;
  }
}

export function writeSave(save: Word500Save) {
  try {
    localStorage.setItem(key(save.mode), JSON.stringify(save));
  } catch {
    // ignore (private mode, storage full, etc.)
  }
}
