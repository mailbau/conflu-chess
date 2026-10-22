export type GameRow = {
  id: string;
  white_player: string | null;
  black_player: string | null;
  fen: string;
  pgn: string;
  base_ms: number;
  increment_ms: number;
  white_ms: number;
  black_ms: number;
  last_move_at: string | null;
  status: "waiting" | "active" | "finished";
  result: "1-0" | "0-1" | "1/2-1/2" | null;
  reason: string | null;
  draw_offer: "w" | "b" | null;
  created_at: string;
};

export const TIME_CONTROLS = [
  { label: "1 min", baseMin: 1, incSec: 0 },
  { label: "3 | 2", baseMin: 3, incSec: 2 },
  { label: "5 min", baseMin: 5, incSec: 0 },
  { label: "10 min", baseMin: 10, incSec: 0 },
  { label: "15 | 10", baseMin: 15, incSec: 10 },
] as const;
