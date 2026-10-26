export type Cell =
  | { type: "black"; right: number | null; down: number | null }
  | { type: "white" };

// grid sizes offered to the player (square grids, N x N)
export const SIZES = [4, 5, 7, 9, 11, 13, 15, 16] as const;
export type Size = (typeof SIZES)[number];

// which difficulties each size offers, matching kakuro.com's own mapping
// (not every size has every difficulty -- a 4x4 easy puzzle is already
// nearly trivial, so there's no "master" tier for it)
export const DIFFICULTIES_FOR_SIZE: Record<Size, string[]> = {
  4: ["easy"],
  5: ["easy", "normal", "hard"],
  7: ["easy", "normal", "hard"],
  9: ["normal", "hard", "expert"],
  11: ["normal", "hard", "expert"],
  13: ["hard", "expert", "master"],
  15: ["hard", "expert", "master"],
  16: ["hard", "expert", "master"],
};

export type Run = {
  cells: [number, number][]; // [row, col] in order
  sum: number;
};

// Puzzles come from a one-time pool fetched from kakuro.com's public puzzle
// API (scripts/kakuro-fetch.ts -> public/kakuro/<size>-<difficulty>.json),
// converted by src/lib/kakuro/parsePuzzle.ts. kakuro.com already verifies
// each puzzle has exactly one solution before serving it, so we trust that
// rather than re-solving. The board checks the player's entries against the
// actual Kakuro constraint (no repeated digit per run, correct sum per run)
// rather than comparing to `solution` cell-by-cell.
export type Puzzle = {
  rows: number;
  cols: number;
  cells: Cell[][];
  solution: number[][]; // -1 on black cells
  runs: Run[]; // every run (horizontal and vertical), for the board's constraint checks
};
