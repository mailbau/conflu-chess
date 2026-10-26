import { computeRunGroups, skeletonIsValid, type RunGroups } from "./runGroups";
import { SIZE_FOR_DIFFICULTY, type Cell, type Difficulty, type Puzzle, type Run } from "./types";

function shuffledDigits(): number[] {
  const d = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

// one row's interior (cols 1..cols-1): a composition of white runs (length
// 2-6) separated by mandatory 1-cell black gaps. Building rows this way
// guarantees every HORIZONTAL run is already valid (length >= 2) by
// construction -- independent per-cell coin flips almost never satisfy
// that on their own, so there's nothing left to "repair" after the fact
function buildRow(cols: number): boolean[] {
  const row = new Array(cols).fill(false);
  let c = 1;
  while (c < cols) {
    const remaining = cols - c;
    if (remaining >= 2 && Math.random() < 0.75) {
      const maxLen = Math.min(6, remaining);
      const len = 2 + Math.floor(Math.random() * (maxLen - 1));
      for (let i = 0; i < len; i++) row[c + i] = true;
      c += len;
      if (c < cols) c++; // mandatory black gap after a run
    } else {
      c++; // leave this cell black
    }
  }
  return row;
}

// rows are each individually guaranteed valid; only the resulting VERTICAL
// structure can still land on a length-1 run, so just reroll whole layouts
// until that happens to not occur
function randomSkeleton(rows: number, cols: number): { isWhite: boolean[][]; groups: RunGroups } {
  for (let attempt = 0; attempt < 3000; attempt++) {
    const isWhite: boolean[][] = Array.from({ length: rows }, (_, r) => (r === 0 ? new Array(cols).fill(false) : buildRow(cols)));
    const groups = computeRunGroups(isWhite);
    if (skeletonIsValid(isWhite, groups) && groups.runCells.length >= rows) {
      return { isWhite, groups };
    }
  }
  throw new Error("could not generate a valid Kakuro skeleton");
}

// fills every white cell with 1-9, no repeats within a run -- randomized
// backtracking. This is "a" solved grid, not necessarily the only one the
// resulting clues admit (see types.ts note); the board checks constraints
// directly rather than comparing against this specific grid
function fillSolution(rows: number, cols: number, groups: RunGroups): number[][] | null {
  const solution: number[][] = Array.from({ length: rows }, () => Array(cols).fill(-1));
  const cells: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (groups.cellRuns[r][c].h >= 0 || groups.cellRuns[r][c].v >= 0) cells.push([r, c]);
    }
  }

  const runUsed = new Array(groups.runCells.length).fill(0);

  function place(idx: number): boolean {
    if (idx === cells.length) return true;
    const [r, c] = cells[idx];
    const { h, v } = groups.cellRuns[r][c];
    for (const d of shuffledDigits()) {
      const bit = 1 << d;
      if (h >= 0 && runUsed[h] & bit) continue;
      if (v >= 0 && runUsed[v] & bit) continue;
      solution[r][c] = d;
      if (h >= 0) runUsed[h] |= bit;
      if (v >= 0) runUsed[v] |= bit;
      if (place(idx + 1)) return true;
      solution[r][c] = -1;
      if (h >= 0) runUsed[h] &= ~bit;
      if (v >= 0) runUsed[v] &= ~bit;
    }
    return false;
  }

  return place(0) ? solution : null;
}

export function generatePuzzle(difficulty: Difficulty): Puzzle {
  const { rows, cols } = SIZE_FOR_DIFFICULTY[difficulty];

  for (let attempt = 0; attempt < 20; attempt++) {
    const { isWhite, groups } = randomSkeleton(rows, cols);
    const solution = fillSolution(rows, cols, groups);
    if (!solution) continue;

    const runSums = groups.runCells.map((cells) => cells.reduce((s, [r, c]) => s + solution[r][c], 0));

    const cells: Cell[][] = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => (isWhite[r][c] ? { type: "white" as const } : { type: "black" as const, right: null, down: null }))
    );
    const runs: Run[] = groups.runCells.map((runCellList, i) => ({
      cells: runCellList,
      sum: runSums[i],
    }));
    for (const run of runs) {
      const [r0, c0] = run.cells[0];
      const isHorizontal = run.cells[0][0] === run.cells[1][0];
      if (isHorizontal) {
        (cells[r0][c0 - 1] as { type: "black"; right: number | null; down: number | null }).right = run.sum;
      } else {
        (cells[r0 - 1][c0] as { type: "black"; right: number | null; down: number | null }).down = run.sum;
      }
    }

    return { rows, cols, cells, solution, runs };
  }

  throw new Error("failed to generate a Kakuro puzzle after 20 attempts");
}
