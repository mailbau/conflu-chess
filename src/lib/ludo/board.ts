import type { Color } from "./types";
import { BASE, FINISHED, HOME_START } from "./types";

export type Coord = [row: number, col: number]; // 0..14, 15x15 grid

// the 52-square main loop, listed starting at red's start square and going
// clockwise all the way back around to just before it
export const MAIN_PATH: Coord[] = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7],
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14],
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7],
  [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0], [6, 0],
];

if (MAIN_PATH.length !== 51 + 1) {
  throw new Error("MAIN_PATH must have exactly 52 squares");
}

// index into MAIN_PATH where each color enters (progress 0 for that color)
export const START_INDEX: Record<Color, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// absolute MAIN_PATH indexes that are safe from capture: the 4 starts + 4 stars
export const SAFE_SQUARES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// each color's 5-square home column, nearest-entry first, nearest-center last
export const HOME_COLUMN: Record<Color, Coord[]> = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
};

// 4 token slots inside each color's base corner
export const BASE_SLOTS: Record<Color, Coord[]> = {
  red: [[1, 1], [1, 3], [3, 1], [3, 3]],
  green: [[1, 11], [1, 13], [3, 11], [3, 13]],
  yellow: [[11, 11], [11, 13], [13, 11], [13, 13]],
  blue: [[11, 1], [11, 3], [13, 1], [13, 3]],
};

export const CENTER: Coord = [7, 7];

// absolute main-track square index for a given color's relative progress (0..50)
export function boardSquare(color: Color, progress: number): number {
  return (START_INDEX[color] + progress) % MAIN_PATH.length;
}

// grid coordinate to render a token at, given its color, progress, and which
// of the 4 tokens it is (0..3, only used for base slots and the finish pile)
export function tokenCoord(color: Color, progress: number, tokenIndex: number): Coord {
  if (progress === BASE) return BASE_SLOTS[color][tokenIndex];
  if (progress === FINISHED) return CENTER;
  if (progress >= HOME_START) return HOME_COLUMN[color][progress - HOME_START];
  return MAIN_PATH[boardSquare(color, progress)];
}
