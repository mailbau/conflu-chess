import { answers, all } from "./wordleWords";

const VALID_GUESSES = new Set(all.map((w) => w.toLowerCase()));

export function isValidGuess(word: string): boolean {
  return VALID_GUESSES.has(word.toLowerCase());
}

export function pickRandomWord(): string {
  return answers[Math.floor(Math.random() * answers.length)];
}

export function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// same epoch as Wordle but offset so the daily word differs from Wordle's
const EPOCH = new Date("2021-06-19T00:00:00Z").getTime();
const DAY_MS = 86_400_000;
const OFFSET = 777;

export function dailyWord(dateKey: string): string {
  const days = Math.floor((new Date(`${dateKey}T00:00:00Z`).getTime() - EPOCH) / DAY_MS);
  const index = (((days + OFFSET) % answers.length) + answers.length) % answers.length;
  return answers[index];
}
