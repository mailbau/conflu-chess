import type { Run } from "./types";

// a run is "wrong" if it has a duplicate filled digit, or is fully filled
// with the wrong sum. Returns the set of "r,c" keys to flag red.
export function wrongCellsFor(runs: Run[], board: string[][]): Set<string> {
  const wrong = new Set<string>();
  for (const run of runs) {
    const seen = new Map<number, number>(); // digit -> count
    let filledCount = 0;
    let sum = 0;
    for (const [r, c] of run.cells) {
      const v = board[r][c];
      if (v === "") continue;
      const d = Number(v);
      filledCount++;
      sum += d;
      seen.set(d, (seen.get(d) ?? 0) + 1);
    }
    const hasDuplicate = [...seen.values()].some((count) => count > 1);
    const sumWrongIfComplete = filledCount === run.cells.length && sum !== run.sum;
    if (hasDuplicate || sumWrongIfComplete) {
      for (const [r, c] of run.cells) wrong.add(`${r},${c}`);
    }
  }
  return wrong;
}

// solved: every run is fully filled with distinct digits summing exactly right
export function isSolved(runs: Run[], board: string[][]): boolean {
  for (const run of runs) {
    const seen = new Set<number>();
    let sum = 0;
    for (const [r, c] of run.cells) {
      const v = board[r][c];
      if (v === "") return false;
      const d = Number(v);
      if (seen.has(d)) return false;
      seen.add(d);
      sum += d;
    }
    if (sum !== run.sum) return false;
  }
  return true;
}
