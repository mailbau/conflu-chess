import assert from "node:assert";
import { generatePuzzle } from "../src/lib/kakuro/generator";
import { computeRunGroups } from "../src/lib/kakuro/runGroups";
import { isSolved, wrongCellsFor } from "../src/lib/kakuro/check";
import type { Difficulty } from "../src/lib/kakuro/types";

function checkPuzzle(difficulty: Difficulty) {
  const t0 = Date.now();
  const puzzle = generatePuzzle(difficulty);
  const ms = Date.now() - t0;

  // every white cell's solution digit is 1-9, every black cell is -1
  for (let r = 0; r < puzzle.rows; r++) {
    for (let c = 0; c < puzzle.cols; c++) {
      const cell = puzzle.cells[r][c];
      const v = puzzle.solution[r][c];
      if (cell.type === "white") assert.ok(v >= 1 && v <= 9, `bad solution digit at ${r},${c}: ${v}`);
      else assert.strictEqual(v, -1, `black cell ${r},${c} should have solution -1`);
    }
  }

  // every run: distinct digits, correct sum, valid length
  for (const run of puzzle.runs) {
    const digits = run.cells.map(([r, c]) => puzzle.solution[r][c]);
    assert.strictEqual(new Set(digits).size, digits.length, "run has duplicate digit");
    assert.strictEqual(digits.reduce((a, b) => a + b, 0), run.sum, "run sum mismatch");
    assert.ok(run.cells.length >= 2 && run.cells.length <= 9, "run length out of range");
  }

  // every black cell's clues match an actual run in that direction
  const isWhite = puzzle.cells.map((row) => row.map((c) => c.type === "white"));
  const groups = computeRunGroups(isWhite);
  for (let i = 0; i < groups.runCells.length; i++) {
    const cells = groups.runCells[i];
    const [r0, c0] = cells[0];
    const horizontal = cells[0][0] === cells[1][0];
    const owner = horizontal ? puzzle.cells[r0][c0 - 1] : puzzle.cells[r0 - 1][c0];
    assert.strictEqual(owner.type, "black");
    const expected = puzzle.runs.find(
      (r) => r.cells.length === cells.length && r.cells[0][0] === cells[0][0] && r.cells[0][1] === cells[0][1]
    );
    assert.ok(expected, "generated run not found in puzzle.runs");
  }

  // the board's own constraint check: solution plugged in as strings is
  // reported solved, with no wrong cells
  const boardFromSolution = puzzle.solution.map((row) => row.map((v) => (v === -1 ? "" : String(v))));
  assert.strictEqual(isSolved(puzzle.runs, boardFromSolution), true, "generator's own solution must satisfy isSolved");
  assert.strictEqual(wrongCellsFor(puzzle.runs, boardFromSolution).size, 0, "generator's own solution must have 0 wrong cells");

  // a deliberately broken board (first white run's first two cells swapped
  // to equal digits) must be flagged wrong, not solved
  const firstRun = puzzle.runs[0];
  const broken = boardFromSolution.map((row) => [...row]);
  const [r0, c0] = firstRun.cells[0];
  const [r1, c1] = firstRun.cells[1];
  broken[r1][c1] = broken[r0][c0]; // duplicate digit within the run
  assert.strictEqual(isSolved(puzzle.runs, broken), false, "a duplicate-digit board must not be solved");
  assert.ok(wrongCellsFor(puzzle.runs, broken).size > 0, "a duplicate-digit board must flag wrong cells");

  console.log(`${difficulty}: ${puzzle.rows}x${puzzle.cols}, ${puzzle.runs.length} runs, generated in ${ms}ms, checks ok`);
}

for (const d of ["easy", "medium", "hard"] as Difficulty[]) {
  for (let i = 0; i < 10; i++) checkPuzzle(d);
}

console.log("all kakuro checks passed");
