// groups a black/white skeleton into horizontal and vertical runs (maximal
// contiguous white strips, length >= 2), without caring about sums yet --
// shared by the digit-filler, the clue-sum derivation, and the solver
export type RunGroups = {
  runCells: [number, number][][]; // one entry per run
  cellRuns: { h: number; v: number }[][]; // per-cell: which run index owns it horizontally/vertically (-1 = none)
};

export function computeRunGroups(isWhite: boolean[][]): RunGroups {
  const rows = isWhite.length;
  const cols = isWhite[0].length;
  const runCells: [number, number][][] = [];
  const cellRuns: { h: number; v: number }[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ h: -1, v: -1 }))
  );

  // horizontal runs
  for (let r = 0; r < rows; r++) {
    let c = 0;
    while (c < cols) {
      if (!isWhite[r][c]) {
        c++;
        continue;
      }
      const start = c;
      while (c < cols && isWhite[r][c]) c++;
      const len = c - start;
      if (len >= 2) {
        const runIdx = runCells.length;
        const cells: [number, number][] = [];
        for (let cc = start; cc < c; cc++) {
          cells.push([r, cc]);
          cellRuns[r][cc].h = runIdx;
        }
        runCells.push(cells);
      } else if (len === 1) {
        // length-1 run: invalid skeleton for Kakuro, caller must reject
        cellRuns[r][start].h = -2;
      }
    }
  }

  // vertical runs
  for (let c = 0; c < cols; c++) {
    let r = 0;
    while (r < rows) {
      if (!isWhite[r][c]) {
        r++;
        continue;
      }
      const start = r;
      while (r < rows && isWhite[r][c]) r++;
      const len = r - start;
      if (len >= 2) {
        const runIdx = runCells.length;
        const cells: [number, number][] = [];
        for (let rr = start; rr < r; rr++) {
          cells.push([rr, c]);
          cellRuns[rr][c].v = runIdx;
        }
        runCells.push(cells);
      } else if (len === 1) {
        cellRuns[start][c].v = -2;
      }
    }
  }

  return { runCells, cellRuns };
}

// true if every white cell belongs to a valid (length >= 2) run in both directions
export function skeletonIsValid(isWhite: boolean[][], groups: RunGroups): boolean {
  const rows = isWhite.length;
  const cols = isWhite[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!isWhite[r][c]) continue;
      const { h, v } = groups.cellRuns[r][c];
      if (h === -2 || v === -2) return false;
      // a run longer than 9 cells can never satisfy the distinct-digit rule
      if (h >= 0 && groups.runCells[h].length > 9) return false;
      if (v >= 0 && groups.runCells[v].length > 9) return false;
    }
  }
  return true;
}
