import type { Puzzle } from "./types";
import { loadPlayedIds } from "../kakuroStorage";

export type PooledPuzzle = Puzzle & { id: string; difficulty: string };

const cache = new Map<string, PooledPuzzle[]>();

async function loadPool(size: number, difficulty: string): Promise<PooledPuzzle[]> {
  const key = `${size}x${size}-${difficulty}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const res = await fetch(`/kakuro/${key}.json`);
  if (!res.ok) throw new Error(`failed to load puzzle pool: ${key}`);
  const pool = (await res.json()) as PooledPuzzle[];
  cache.set(key, pool);
  return pool;
}

// picks a random puzzle from the pool, preferring one not already played;
// once the whole pool for this size+difficulty has been played, it just
// picks any random one again
export async function pickPuzzle(size: number, difficulty: string): Promise<PooledPuzzle> {
  const pool = await loadPool(size, difficulty);
  if (pool.length === 0) throw new Error(`empty puzzle pool: ${size}x${size}-${difficulty}`);
  const played = loadPlayedIds();
  const unplayed = pool.filter((p) => !played.has(p.id));
  const choices = unplayed.length > 0 ? unplayed : pool;
  return choices[Math.floor(Math.random() * choices.length)];
}
