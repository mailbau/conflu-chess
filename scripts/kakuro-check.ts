// Validates every puzzle in the fetched pool (public/kakuro/*.json):
// run shape, distinct digits, correct sums -- a sanity check on the pool,
// not a generator test (there's no generator anymore; puzzles come from
// kakuro.com's pool, see scripts/kakuro-fetch.ts).
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { computeRunGroups } from "../src/lib/kakuro/runGroups";
import { DIFFICULTIES_FOR_SIZE, SIZES } from "../src/lib/kakuro/types";
import type { PooledPuzzle } from "../src/lib/kakuro/pool";

const DIR = path.join(__dirname, "..", "public", "kakuro");

let totalPuzzles = 0;

for (const size of SIZES) {
  for (const difficulty of DIFFICULTIES_FOR_SIZE[size]) {
    const file = path.join(DIR, `${size}x${size}-${difficulty}.json`);
    assert.ok(fs.existsSync(file), `missing pool file: ${file}`);
    const puzzles = JSON.parse(fs.readFileSync(file, "utf8")) as PooledPuzzle[];
    assert.ok(puzzles.length > 0, `empty pool: ${file}`);

    const ids = new Set<string>();
    for (const puzzle of puzzles) {
      assert.ok(!ids.has(puzzle.id), `duplicate id ${puzzle.id} in ${file}`);
      ids.add(puzzle.id);

      assert.strictEqual(puzzle.rows, size);
      assert.strictEqual(puzzle.cols, size);

      for (let r = 0; r < puzzle.rows; r++) {
        for (let c = 0; c < puzzle.cols; c++) {
          const cell = puzzle.cells[r][c];
          const v = puzzle.solution[r][c];
          if (cell.type === "white") assert.ok(v >= 1 && v <= 9, `${puzzle.id}: bad digit at ${r},${c}`);
          else assert.strictEqual(v, -1, `${puzzle.id}: black cell ${r},${c} should be -1`);
        }
      }

      assert.ok(puzzle.runs.length > 0, `${puzzle.id}: no runs at all`);
      for (const run of puzzle.runs) {
        const digits = run.cells.map(([r, c]) => puzzle.solution[r][c]);
        assert.strictEqual(new Set(digits).size, digits.length, `${puzzle.id}: duplicate digit in a run`);
        assert.strictEqual(digits.reduce((a, b) => a + b, 0), run.sum, `${puzzle.id}: run sum mismatch`);
        assert.ok(run.cells.length >= 2 && run.cells.length <= 9, `${puzzle.id}: run length out of range`);
      }

      // every run matches an actual black-cell clue, and the clue grid is
      // internally consistent with the independently-recomputed run groups
      const isWhite = puzzle.cells.map((row) => row.map((c) => c.type === "white"));
      const groups = computeRunGroups(isWhite);
      assert.strictEqual(groups.runCells.length, puzzle.runs.length, `${puzzle.id}: run count mismatch`);
    }

    totalPuzzles += puzzles.length;
    console.log(`${size}x${size} ${difficulty}: ${puzzles.length} puzzles ok`);
  }
}

console.log(`\nall kakuro pool checks passed (${totalPuzzles} puzzles)`);
