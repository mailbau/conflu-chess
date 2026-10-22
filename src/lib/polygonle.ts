import { WORDS_BY_LENGTH } from "./polygonleWords";

export type Shape = "circle" | "square" | "triangle" | "diamond" | "pentagon" | "hexagon" | "star" | "cross";
const SHAPES: Shape[] = ["circle", "square", "triangle", "diamond", "pentagon", "hexagon", "star", "cross"];
const COLORS = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#22d3ee", "#60a5fa", "#a78bfa", "#f472b6"];

export type Token = { shape: Shape; color: string };

const LENGTHS = [4, 5, 6, 7, 8];
const EPOCH = new Date("2021-06-19T00:00:00Z").getTime();
const DAY_MS = 86_400_000;

export function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// small deterministic PRNG so the daily puzzle is reproducible from a seed
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return h;
}

function pickWord(rand: () => number): string {
  const length = LENGTHS[Math.floor(rand() * LENGTHS.length)];
  const list = WORDS_BY_LENGTH[length];
  return list[Math.floor(rand() * list.length)];
}

export function dailyWord(dateKey: string): string {
  const days = Math.floor((new Date(`${dateKey}T00:00:00Z`).getTime() - EPOCH) / DAY_MS);
  return pickWord(mulberry32(days));
}

export function randomWord(): string {
  return pickWord(mulberry32((Math.random() * 2 ** 31) | 0));
}

// assign a unique shape+color token to each distinct letter in the word, so
// identical letters always show the same token and different letters never
// collide; deterministic per word so daily puzzles look the same for everyone
export function shapesForWord(word: string): Token[] {
  const pool: Token[] = [];
  for (const shape of SHAPES) for (const color of COLORS) pool.push({ shape, color });
  const rand = mulberry32(seedFromString(word));
  // shuffle the pool deterministically, then hand out tokens in that order
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const letterToken = new Map<string, Token>();
  let next = 0;
  for (const letter of word) {
    if (!letterToken.has(letter)) letterToken.set(letter, pool[next++]);
  }
  return word.split("").map((letter) => letterToken.get(letter)!);
}
