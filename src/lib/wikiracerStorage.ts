export type WikiRaceSave = {
  mode: "daily" | "free";
  dateKey: string; // daily: today's date; free: id of the current race
  target: string;
  path: string[];
  startedAt: number;
  status: "playing" | "won";
  finishedMs?: number;
};

const DAILY_KEY = "wikiracer-daily";
const FREE_KEY = "wikiracer-free";

function key(mode: "daily" | "free") {
  return mode === "daily" ? DAILY_KEY : FREE_KEY;
}

export function loadSave(mode: "daily" | "free"): WikiRaceSave | null {
  try {
    const raw = localStorage.getItem(key(mode));
    return raw ? (JSON.parse(raw) as WikiRaceSave) : null;
  } catch {
    return null;
  }
}

export function writeSave(save: WikiRaceSave) {
  try {
    localStorage.setItem(key(save.mode), JSON.stringify(save));
  } catch {
    // ignore (private mode, storage full, etc.)
  }
}
