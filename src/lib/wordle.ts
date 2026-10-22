import { answers, all } from "./wordleWords";
import type { LetterStatus } from "./wordleStorage";

const VALID_GUESSES = new Set(all.map((w) => w.toLowerCase()));

export function isValidGuess(word: string): boolean {
  return VALID_GUESSES.has(word.toLowerCase());
}

export function pickRandomWord(): string {
  return answers[Math.floor(Math.random() * answers.length)];
}

// Real Wordle started 2021-06-19 (puzzle #0); reuse that epoch so "daily"
// feels like the real thing and stays stable across redeploys.
const EPOCH = new Date("2021-06-19T00:00:00Z").getTime();
const DAY_MS = 86_400_000;

export function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dailyWord(dateKey: string): string {
  const days = Math.floor((new Date(`${dateKey}T00:00:00Z`).getTime() - EPOCH) / DAY_MS);
  const index = ((days % answers.length) + answers.length) % answers.length;
  return answers[index];
}

// standard Wordle coloring: exact matches first, then letters present
// elsewhere, accounting for duplicate letters correctly
export function scoreGuess(guess: string, word: string): LetterStatus[] {
  const g = guess.toLowerCase().split("");
  const w = word.toLowerCase().split("");
  const result: LetterStatus[] = new Array(5).fill("absent");
  const remaining: Record<string, number> = {};

  for (let i = 0; i < 5; i++) {
    if (g[i] === w[i]) {
      result[i] = "correct";
    } else {
      remaining[w[i]] = (remaining[w[i]] ?? 0) + 1;
    }
  }
  for (let i = 0; i < 5; i++) {
    if (result[i] === "correct") continue;
    if (remaining[g[i]] > 0) {
      result[i] = "present";
      remaining[g[i]]--;
    }
  }
  return result;
}
