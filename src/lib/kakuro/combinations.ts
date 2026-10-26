// every way to pick `length` distinct digits from 1-9 that sum to `sum`,
// used for the "show possible combinations" hint on a clue cell
const cache = new Map<string, number[][]>();

function combosOf(length: number, sum: number): number[][] {
  const key = `${length}:${sum}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const out: number[][] = [];
  function pick(start: number, remaining: number, chosen: number[], remainingSum: number) {
    if (remaining === 0) {
      if (remainingSum === 0) out.push([...chosen]);
      return;
    }
    for (let d = start; d <= 9; d++) {
      if (d > remainingSum) break;
      chosen.push(d);
      pick(d + 1, remaining - 1, chosen, remainingSum - d);
      chosen.pop();
    }
  }
  pick(1, length, [], sum);
  cache.set(key, out);
  return out;
}

export function possibleCombinations(length: number, sum: number): number[][] {
  return combosOf(length, sum);
}
