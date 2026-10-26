// One-time job: pull a pool of puzzles from kakuro.com's public puzzle API
// and convert them to our format. Run with: npx tsx scripts/kakuro-fetch.ts
// Not run automatically, not called at request time -- the app only ever
// reads the resulting static JSON files under public/kakuro/.
import fs from "node:fs";
import path from "node:path";
import { parseRemotePuzzle, type RemotePuzzle } from "../src/lib/kakuro/parsePuzzle";
import { computeRunGroups, skeletonIsValid } from "../src/lib/kakuro/runGroups";
import { DIFFICULTIES_FOR_SIZE, SIZES } from "../src/lib/kakuro/types";

const SIZE_DIFFICULTIES: Record<string, string[]> = Object.fromEntries(
  SIZES.map((s) => [`${s}x${s}`, DIFFICULTIES_FOR_SIZE[s]])
);

const TARGET_PER_COMBO = Number(process.argv.find((a) => a.startsWith("--count="))?.split("=")[1] ?? 40);
const OUT_DIR = path.join(__dirname, "..", "public", "kakuro");
const DELAY_MS = 300;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validate(remote: RemotePuzzle): string | null {
  try {
    const parsed = parseRemotePuzzle(remote);
    const isWhite = parsed.cells.map((row) => row.map((c) => c.type === "white"));
    const groups = computeRunGroups(isWhite);
    if (!skeletonIsValid(isWhite, groups)) return "invalid skeleton";
    for (const run of parsed.runs) {
      const digits = run.cells.map(([r, c]) => parsed.solution[r][c]);
      if (new Set(digits).size !== digits.length) return "duplicate digit in a run";
      if (digits.reduce((a, b) => a + b, 0) !== run.sum) return "sum mismatch";
      if (digits.some((d) => d < 1 || d > 9)) return "digit out of range";
    }
    return null;
  } catch (e) {
    return String(e);
  }
}

async function fetchCombo(size: string, difficulty: string, target: number) {
  const seen = new Map<string, RemotePuzzle>();
  let attempts = 0;
  const maxAttempts = target * 4 + 20;

  while (seen.size < target && attempts < maxAttempts) {
    attempts++;
    try {
      const res = await fetch(`https://kakuro.com/api/puzzle?size=${size}&difficulty=${difficulty}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (!res.ok) {
        await sleep(DELAY_MS);
        continue;
      }
      const remote = (await res.json()) as RemotePuzzle;
      if (!seen.has(remote.id)) {
        const problem = validate(remote);
        if (problem) {
          console.warn(`  skipping ${remote.id}: ${problem}`);
        } else {
          seen.set(remote.id, remote);
        }
      }
    } catch (e) {
      console.warn(`  fetch error: ${e}`);
    }
    await sleep(DELAY_MS);
  }

  return [...seen.values()];
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const summary: string[] = [];

  for (const [size, difficulties] of Object.entries(SIZE_DIFFICULTIES)) {
    for (const difficulty of difficulties) {
      process.stdout.write(`${size} ${difficulty}: fetching up to ${TARGET_PER_COMBO}... `);
      const remotes = await fetchCombo(size, difficulty, TARGET_PER_COMBO);
      const parsed = remotes.map((r) => parseRemotePuzzle(r));
      const outPath = path.join(OUT_DIR, `${size}-${difficulty}.json`);
      fs.writeFileSync(outPath, JSON.stringify(parsed));
      const line = `${size} ${difficulty}: got ${parsed.length}/${TARGET_PER_COMBO}`;
      console.log(line.replace(`${size} ${difficulty}: `, ""));
      summary.push(line);
    }
  }

  console.log("\n--- summary ---");
  summary.forEach((l) => console.log(l));
}

main();
