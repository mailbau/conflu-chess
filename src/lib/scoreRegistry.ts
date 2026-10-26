// every (game, metric) pair that's allowed to be submitted or shown on a
// leaderboard. The client never gets to say how a value should be combined
// with the existing one -- that's decided here, server-side, so nobody can
// submit a worse time and have it overwrite a better one, or inflate a win
// counter by claiming "increment by 1000".
export type Mode = "increment" | "best-low" | "best-high";

export type MetricDef = {
  label: string;
  mode: Mode;
  format: (value: number) => string;
};

const wins: MetricDef = { label: "Wins", mode: "increment", format: (v) => String(v) };

function bestTime(label: string): MetricDef {
  return {
    label,
    mode: "best-low",
    format: (ms) => {
      const totalSec = Math.round(ms / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return `${m}:${s.toString().padStart(2, "0")}`;
    },
  };
}

function bestWpm(label: string): MetricDef {
  return { label, mode: "best-high", format: (v) => `${Math.round(v)} wpm` };
}

export const SCORE_REGISTRY: Record<string, Record<string, MetricDef>> = {
  chess: { wins },
  ludo: { wins },
  wordle: { wins },
  word500: { wins },
  polygonle: { wins },
  sudoku: {
    best_time_easy: bestTime("Best time (easy)"),
    best_time_medium: bestTime("Best time (medium)"),
    best_time_hard: bestTime("Best time (hard)"),
    best_time_expert: bestTime("Best time (expert)"),
  },
  kakuro: {
    best_time_easy: bestTime("Best time (easy)"),
    best_time_medium: bestTime("Best time (medium)"),
    best_time_hard: bestTime("Best time (hard)"),
  },
  minesweeper: {
    best_time_beginner: bestTime("Best time (beginner)"),
    best_time_intermediate: bestTime("Best time (intermediate)"),
    best_time_expert: bestTime("Best time (expert)"),
  },
  typingtest: {
    best_wpm_15: bestWpm("Best WPM (15s)"),
    best_wpm_30: bestWpm("Best WPM (30s)"),
    best_wpm_60: bestWpm("Best WPM (60s)"),
  },
};

export function metricDef(game: string, metric: string): MetricDef | null {
  return SCORE_REGISTRY[game]?.[metric] ?? null;
}

// how a newly-submitted value combines with whatever's already stored
export function combine(mode: Mode, existing: number | null, incoming: number): number {
  if (existing === null) return mode === "increment" ? incoming : incoming;
  if (mode === "increment") return existing + incoming;
  if (mode === "best-low") return Math.min(existing, incoming);
  return Math.max(existing, incoming);
}
