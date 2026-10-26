# Kakuro v2: Implementation Plan

Status: plan only. Nothing below has been built yet.

## 1. What kakuro.com actually does (reverse-engineered)

Sources: the site's JS bundles, plus 140 sample puzzles pulled from its public
`/api/puzzle` endpoint (22 size×difficulty combinations, 6 samples each, plus
a first pass of single samples).

### 1.1 Architecture
- The browser never generates puzzles. It calls
  `GET /api/puzzle?size=16x16&difficulty=master` and gets back one ready-made
  puzzle.
- Puzzle IDs look like `9x9-3574` and `16x16-2453`, and the metadata includes
  `generatedAt` timestamps grouped into a few batch dates. So the site
  generates puzzles **offline in batches into a pool** (thousands per size)
  and just serves a random one from the pool.
- Every puzzle carries `verifiedUnique: true`. Uniqueness is checked when the
  pool is generated, never at play time.
- The response includes the **full solution**: white cells hold their answer
  digit. Hints, "check", and printing all compare against that solution on
  the client.

### 1.2 Wire format
```jsonc
{
  "id": "4x4-435", "size": "4x4", "difficulty": "easy",
  "grid": [
    [0, 0, [23, 0], [4, 0]],   // 0 = black blank, [down, right] = clue cell (0 = no clue that direction)
    [0, [6, 7], 6, 1],          // plain number = white cell, value = solution digit
    [[0, 15], 4, 8, 3],
    [[0, 11], 2, 9, 0]
  ],
  "metadata": { "whiteCells": 7, "avgRunLength": 2.33, "runCount": 6,
                "difficultyScore": 14, "solverNodes": 1, "verifiedUnique": true,
                "patternName": "...", "has3x3Block": true, "daily": true }
}
```
The client parses this into cells plus a list of runs. A run is only counted
if it's at least 2 cells long.

### 1.3 Sizes and difficulties (hard-coded in their bundle)
| Size | Difficulties offered |
|---|---|
| 4x4 | easy |
| 5x5, 7x7 | easy, normal, hard |
| 9x9, 11x11 | normal, hard, expert |
| 13x13, 15x15, 16x16 | hard, expert, master |

This is the same size list you asked for.

### 1.4 Puzzle statistics (measured across the 140 samples)
| Property | Value | Current generator (v1) |
|---|---|---|
| White cells | **44–57%** of the grid | similar |
| Average run length | **2.6–3.0** | ~4 |
| Runs that are exactly 2 cells | **~60–70%** | much lower |
| Longest run | 3 (4x4), 4 (5x5), 6 (7x7), 8–9 (9x9 and up), rare | up to 6, common |
| Row 0 and column 0 | always black (clue margin) | same |
| Symmetry | **none**: free-form shapes | n/a |
| White cells connected | **always one region** | not enforced |
| Runs whose sum has exactly ONE digit set (e.g. 3 = {1,2}, 17 = {8,9}) | **~30–40%** | ~11% (what random filling gives) |
| Difficulty score | grows roughly with white-cell count; within a size, harder means a bit more white and more search nodes | n/a |

### 1.5 Why our v1 generator failed
- **Runs too long.** Long runs allow many digit sets per clue, so a puzzle
  almost never has exactly one solution. Short runs, mostly 2 cells, are what
  make uniqueness achievable.
- **Digits filled at random.** Clues derived from random digits are
  ambiguous. kakuro.com puzzles have about 3× more "single-digit-set" clues
  than random filling produces, so their generator deliberately steers digits
  toward tightly constrained sums.
- **Layout: row-by-row then reroll.** Horizontal runs were built correctly,
  but vertical runs were left to chance, and the hit rate collapses once the
  grid gets past ~10x10. The current uncommitted diagonal-stripe attempt is
  also broken at 4x4 and is discarded in this plan.
- **Generated in the browser.** A unique 16x16 can take seconds or more to
  produce. That's fine offline and unacceptable at click time.

## 2. Approach: copy their architecture

**Generate an offline pool, ship it as static JSON, and serve puzzles from
the pool.** No live dependency on kakuro.com: we don't proxy or scrape their
API, since the puzzles are their content and their uptime isn't ours. We
build our own pool with the same structure.

```
scripts/kakuro-generate.ts   (run locally with npx tsx, one time, can take minutes)
        │  layout → digits → clues → uniqueness check (solver) → difficulty rating
        ▼
public/kakuro/4x4.json … 16x16.json   (puzzles in kakuro.com's wire format, grouped by difficulty)
        │  fetched lazily when the player picks a size
        ▼
KakuroBoard (client): pick a random puzzle of the chosen difficulty and play it
```

Pool size: **50 puzzles per size×difficulty** (22 combinations, 1,100
puzzles). A 16x16 puzzle is ~1.1 KB, so the biggest file is ~165 KB, and only
the chosen size is ever downloaded. The generator can be re-run to grow the
pool.

## 3. Generator design (`src/lib/kakuro/` + `scripts/kakuro-generate.ts`)

### 3.1 Layout (`layout.ts`)
- Decide each cell black or white **with backtracking, checking both
  directions as it goes**:
  - A run can only close (black cell or grid edge) if its length is 0 or
    between 2 and the size's max (3 for 4x4, 4 for 5x5, 6 for 7x7, 9 for
    larger).
  - When adding a white cell, the coin flip is weighted toward closing runs
    at length 2–3, to match the ~65%-are-2-cells distribution.
  - Target white share: 50–56%.
- Afterwards, check the white cells form one connected region and the white
  share is in range. If not, retry. Retries should be rare, because the run
  rules are enforced while building instead of hoped for afterwards.
- Row 0 and column 0 are always black. Any black cell can hold a clue. A
  black cell with neither a right nor a down run is a plain blank (`0`).
- Optional pattern variety (they have `patternName` / `has3x3Block`): allow
  some 3×3 white blocks at harder difficulties. This is a refinement for
  later, not required for v2.

### 3.2 Solver (`solver.ts`): the core piece, reused everywhere
- **Lookup table:** for every (run length, sum) pair, the list of digit sets
  that fit. This builds on `combinations.ts`, which already exists.
- **Candidates as bitmasks:** each cell holds a 9-bit set of possible digits.
  - **Propagation:**
    - for each run, keep only the digit sets that are still possible given
      the digits already placed and the cells' candidates; each cell's
      candidates become the union of what those sets allow;
    - intersect the horizontal and vertical results;
    - remove placed digits from the rest of the run;
    - repeat until nothing changes.
  - **Search:** branch on the cell with the fewest candidates.
  - **Counting:** stop at 2 solutions. Count search nodes and track whether
    propagation alone solved it.
- Uses: uniqueness check, difficulty rating, a self-test, and (optionally)
  the hint feature.

### 3.3 Digits and uniqueness (`generator.ts`)
1. Fill digits run by run, preferring sums with very few digit sets. Weight
   each candidate digit by how much it narrows the run's possible sets, so
   ~30–40% of runs end up single-digit-set like kakuro.com's, instead of
   ~11%.
2. Derive the clues and run the solver with a limit of 2 solutions.
3. If there are 2 solutions, repair:
   - take a cell where the two solutions differ;
   - change the digits of a run through that cell to make its sum tighter;
   - re-derive clues and solve again.
   - Up to ~30 repairs, then fall back to a new layout.
   - If repairs keep failing, an alternative fix is to turn a cell in the
     ambiguous area black, which splits a long run.
4. Keep the puzzle only if it has exactly one solution (`verifiedUnique`).

### 3.4 Difficulty rating
- `score = f(white cells, solver search nodes, needs-search vs
  propagation-only, share of single-digit-set clues)`.
- Within each size, sort the generated puzzles by score and split them into
  that size's difficulty labels (§1.3) by percentile, so labels mean "harder
  than the others at this size", same as theirs.

### 3.5 Generation run and measurement gate
- `npx tsx scripts/kakuro-generate.ts --per-difficulty 50` prints success
  rate, time per puzzle per size, and the score distribution.
- **Gate:** if 16x16 averages more than ~10 s per puzzle, fix the repair loop
  before moving on. Offline, even a slow run is acceptable. Run it in the
  background if needed.

## 4. Client changes (`KakuroBoard.tsx`, mirroring the site's features)
| Feature | Status |
|---|---|
| Size picker 4x4…16x16 | done in uncommitted work, keep |
| Arrow-key navigation (skips black cells) | done in uncommitted work, keep |
| Difficulty picker filtered by size (§1.3) | new |
| Load `/kakuro/<size>.json` lazily and pick a random puzzle of that difficulty; skip puzzles already played (IDs kept in localStorage) | new |
| Win check | now possible to compare against the stored unique solution; keeping the constraint check also works, since both agree when there's only one solution |
| Check: wrong cells in red | exists |
| **Note mode** (pencil marks: candidate digits per cell) | new (on their site) |
| **Combination helper**: click a clue to see its possible digit sets | new (on their site; `combinations.ts` exists) |
| **Hint**: reveal one cell from the solution, counted | new (they track `hintsUsed`) |
| Daily puzzle: same puzzle for everyone, picked by date from the pool | optional, same pattern as our Wordle daily |
| Timer, new puzzle | exist |
| Saved-progress format | gains `puzzleId`, `difficulty`, `notes`, `hintsUsed`; old saves are thrown away |

## 5. Scores and leaderboard
- Proposed: best time per **size × difficulty**. That's 22 metrics, built
  programmatically in `scoreRegistry.ts`. The leaderboard page already loops
  over metrics, so tabs appear automatically.
- Simpler alternative: best time per size only (8 metrics).
- Times with hints used: either reject them from the leaderboard, or keep
  them and show a "hints used" flag.

## 6. Testing
- `scripts/kakuro-check.ts`, rewritten to:
  - load every pool file and parse it;
  - check every run: no repeated digit, sum matches the clue, length 2–9;
  - **re-verify uniqueness with the solver** for every puzzle;
  - for small sizes, cross-check the solver against plain brute force.
- Solver self-tests on hand-built tiny puzzles with known solution counts (0,
  1, and 2+).
- Manual: play one puzzle per size; try notes, hints, and arrow keys.

## 7. Build phases (each ends with build → commit → push → deploy)
| # | Phase | Delivers |
|---|---|---|
| 1 | Solver + lookup tables + self-tests | `solver.ts`, verified on known puzzles |
| 2 | Layout generator + digit filling + uniqueness repair + rating + measurement run | `layout.ts`, `generator.ts`, `kakuro-generate.ts`; **passes the §3.5 gate** |
| 3 | Generate the pool and commit `public/kakuro/*.json` | 1,100 verified-unique puzzles |
| 4 | Client: load from pool, difficulty picker, arrow keys, keep size picker | **First deploy of v2** |
| 5 | Note mode, combination helper, hint | the site's main features |
| 6 | Scoring update + optional daily mode | leaderboard tabs |

Phases 1–3 are the risky part (algorithm quality and speed). Phases 4–6 are
straightforward UI work.

## 8. Decisions needed before building
1. **Pool size:** 50 per size×difficulty (~1,100 total, largest file ~165 KB)? More or fewer?
2. **Leaderboard grouping:** per size×difficulty (22 tabs) or per size only (8)?
3. **Hints and the leaderboard:** reject times with hints, or keep them with a flag?
4. **Daily puzzle:** include it, or skip?
5. **Current uncommitted work** (arrow keys + size picker + broken diagonal generator): keep arrow keys and the size picker, and replace the generator as planned?
