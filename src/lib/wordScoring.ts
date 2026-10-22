export type LetterStatus = "correct" | "present" | "absent";

// standard Wordle-style coloring for any word length: exact matches first,
// then letters present elsewhere, accounting for duplicate letters correctly
export function scoreGuess(guess: string, word: string): LetterStatus[] {
  const g = guess.toLowerCase().split("");
  const w = word.toLowerCase().split("");
  const len = w.length;
  const result: LetterStatus[] = new Array(len).fill("absent");
  const remaining: Record<string, number> = {};

  for (let i = 0; i < len; i++) {
    if (g[i] === w[i]) {
      result[i] = "correct";
    } else {
      remaining[w[i]] = (remaining[w[i]] ?? 0) + 1;
    }
  }
  for (let i = 0; i < len; i++) {
    if (result[i] === "correct") continue;
    if (remaining[g[i]] > 0) {
      result[i] = "present";
      remaining[g[i]]--;
    }
  }
  return result;
}
