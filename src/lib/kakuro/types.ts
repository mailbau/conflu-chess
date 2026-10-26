export type Cell =
  | { type: "black"; right: number | null; down: number | null }
  | { type: "white" };

export type Difficulty = "easy" | "medium" | "hard";

export const SIZE_FOR_DIFFICULTY: Record<Difficulty, { rows: number; cols: number }> = {
  easy: { rows: 6, cols: 6 },
  medium: { rows: 8, cols: 8 },
  hard: { rows: 10, cols: 10 },
};

export type Run = {
  cells: [number, number][]; // [row, col] in order
  sum: number;
};

// Note: the generator does not guarantee the clues admit only one solution
// (that needs real constructive generation -- random fill-then-derive-sum
// lands on a uniquely-solvable board well under 1% of the time, checked
// empirically). The game therefore doesn't check the player's board against
// `solution` specifically; it checks the actual Kakuro constraint (no
// repeated digit per run, correct sum per run) directly, so any valid
// filling counts as solved, not just the one grid that happened to be
// generated first.
export type Puzzle = {
  rows: number;
  cols: number;
  cells: Cell[][];
  solution: number[][]; // -1 on black cells; one valid filling, not necessarily the only one
  runs: Run[]; // every run (horizontal and vertical), for the board's constraint checks
};
