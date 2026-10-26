import { computeRunGroups } from "./runGroups";
import type { Cell, Puzzle, Run } from "./types";

// kakuro.com's wire format: grid[r][c] is 0 (black, no clue), [down, right]
// (black, clue cell -- either can be 0 meaning "no clue that direction"),
// or a positive number (white cell, value = the solution digit)
export type RemotePuzzle = {
  id: string;
  size: string; // e.g. "9x9"
  difficulty: string;
  grid: (number | [number, number])[][];
};

export function parseRemotePuzzle(remote: RemotePuzzle): Puzzle & { id: string; difficulty: string } {
  const rows = remote.grid.length;
  const cols = remote.grid[0].length;

  const isWhite: boolean[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => typeof remote.grid[r][c] === "number" && (remote.grid[r][c] as number) > 0)
  );
  const solution: number[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const v = remote.grid[r][c];
      return typeof v === "number" && v > 0 ? v : -1;
    })
  );
  const cells: Cell[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const v = remote.grid[r][c];
      if (isWhite[r][c]) return { type: "white" as const };
      if (Array.isArray(v)) {
        const [down, right] = v;
        return { type: "black" as const, right: right > 0 ? right : null, down: down > 0 ? down : null };
      }
      return { type: "black" as const, right: null, down: null };
    })
  );

  const groups = computeRunGroups(isWhite);
  const runs: Run[] = groups.runCells.map((runCells) => ({
    cells: runCells,
    sum: runCells.reduce((s, [r, c]) => s + solution[r][c], 0),
  }));

  return { id: remote.id, difficulty: remote.difficulty, rows, cols, cells, solution, runs };
}
