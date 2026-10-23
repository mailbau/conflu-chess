export type Difficulty = "beginner" | "intermediate" | "expert";

export const DIFFICULTY_CONFIG: Record<Difficulty, { rows: number; cols: number; mines: number }> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
};

export type Cell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number; // mines in the 8 surrounding cells
};

export function emptyBoard(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ mine: false, revealed: false, flagged: false, adjacent: 0 }))
  );
}

function neighbors(r: number, c: number, rows: number, cols: number) {
  const out: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push([nr, nc]);
    }
  }
  return out;
}

// places mines after the first click so that click (and its neighbors) is
// always safe, matching how every real Minesweeper implementation behaves
export function placeMines(board: Cell[][], mines: number, safeR: number, safeC: number): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;
  const safe = new Set([`${safeR},${safeC}`, ...neighbors(safeR, safeC, rows, cols).map(([r, c]) => `${r},${c}`)]);
  const next = board.map((row) => row.map((cell) => ({ ...cell })));

  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (safe.has(`${r},${c}`) || next[r][c].mine) continue;
    next[r][c].mine = true;
    placed++;
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (next[r][c].mine) continue;
      next[r][c].adjacent = neighbors(r, c, rows, cols).filter(([nr, nc]) => next[nr][nc].mine).length;
    }
  }
  return next;
}

// flood-fills outward from (r, c) through zero-adjacent cells, revealing
// their non-mine border as it goes; mutates and returns a fresh board
export function revealFrom(board: Cell[][], r: number, c: number): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;
  const next = board.map((row) => row.map((cell) => ({ ...cell })));
  const stack: [number, number][] = [[r, c]];

  while (stack.length) {
    const [cr, cc] = stack.pop()!;
    const cell = next[cr][cc];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.adjacent === 0 && !cell.mine) {
      for (const [nr, nc] of neighbors(cr, cc, rows, cols)) {
        if (!next[nr][nc].revealed && !next[nr][nc].flagged) stack.push([nr, nc]);
      }
    }
  }
  return next;
}

export function countFlags(board: Cell[][]): number {
  return board.flat().filter((c) => c.flagged).length;
}

export function isWin(board: Cell[][]): boolean {
  return board.flat().every((c) => c.mine || c.revealed);
}

export function revealAllMines(board: Cell[][]): Cell[][] {
  return board.map((row) => row.map((cell) => (cell.mine ? { ...cell, revealed: true } : cell)));
}
