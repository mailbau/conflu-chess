export type PolygonleSave = {
  mode: "daily" | "free";
  dateKey: string; // daily: today's date; free: id of the current game
  word: string;
  guesses: string[];
  status: "playing" | "won" | "lost";
};

const DAILY_KEY = "polygonle-daily";
const FREE_KEY = "polygonle-free";

function key(mode: "daily" | "free") {
  return mode === "daily" ? DAILY_KEY : FREE_KEY;
}

export function loadSave(mode: "daily" | "free"): PolygonleSave | null {
  try {
    const raw = localStorage.getItem(key(mode));
    return raw ? (JSON.parse(raw) as PolygonleSave) : null;
  } catch {
    return null;
  }
}

export function writeSave(save: PolygonleSave) {
  try {
    localStorage.setItem(key(save.mode), JSON.stringify(save));
  } catch {
    // ignore (private mode, storage full, etc.)
  }
}
