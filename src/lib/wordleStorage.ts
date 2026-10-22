export type LetterStatus = "correct" | "present" | "absent";
export type WordleSave = {
  mode: "daily" | "free";
  dateKey: string; // daily: today's date; free: id of the current game
  word: string;
  guesses: string[];
  status: "playing" | "won" | "lost";
};

const DAILY_KEY = "wordle-daily";
const FREE_KEY = "wordle-free";

function key(mode: "daily" | "free") {
  return mode === "daily" ? DAILY_KEY : FREE_KEY;
}

export function loadSave(mode: "daily" | "free"): WordleSave | null {
  try {
    const raw = localStorage.getItem(key(mode));
    return raw ? (JSON.parse(raw) as WordleSave) : null;
  } catch {
    return null;
  }
}

export function writeSave(save: WordleSave) {
  try {
    localStorage.setItem(key(save.mode), JSON.stringify(save));
  } catch {
    // ignore (private mode, storage full, etc.)
  }
}
