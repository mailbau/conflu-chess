import { randomInt } from "crypto";

// server-side die roll, so a client can never fake a roll
export function rollDie(): number {
  return randomInt(1, 7); // 1..6
}
