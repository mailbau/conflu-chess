"use client";

import type { LudoState, Color } from "@/lib/ludo/types";
import { BASE, FINISHED } from "@/lib/ludo/types";
import { CENTER, SAFE_SQUARES, tokenCoord, boardSquare, MAIN_PATH } from "@/lib/ludo/board";
import styles from "./LudoBoard.module.css";

const GRID_SIZE = 15;

const COLOR_HEX: Record<Color, string> = {
  red: "#e06c75",
  green: "#7ee2a0",
  yellow: "#e8c468",
  blue: "#61afef",
};

type TokenPlacement = {
  color: Color;
  tokenIndex: number;
  row: number;
  col: number;
  clickable: boolean;
};

export default function LudoBoard({
  state,
  myColor,
  onMoveToken,
}: {
  state: LudoState;
  myColor: Color | null;
  onMoveToken: (token: number) => void;
}) {
  const legal = state.phase.kind === "move" ? state.phase.legal : [];
  const isMyMoveTurn =
    state.phase.kind === "move" && state.players[state.current]?.color === myColor;

  const placements: TokenPlacement[] = [];
  state.players.forEach((p) => {
    p.tokens.forEach((progress, tokenIndex) => {
      const [row, col] = tokenCoord(p.color, progress, tokenIndex);
      placements.push({
        color: p.color,
        tokenIndex,
        row,
        col,
        clickable: isMyMoveTurn && p.color === myColor && legal.includes(tokenIndex),
      });
    });
  });

  // group tokens sharing the same cell so they can be nudged apart visually
  const byCell = new Map<string, TokenPlacement[]>();
  for (const t of placements) {
    const key = `${t.row},${t.col}`;
    byCell.set(key, [...(byCell.get(key) ?? []), t]);
  }

  const cells = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const isPath = MAIN_PATH.some(([pr, pc]) => pr === r && pc === c);
      const pathIndex = MAIN_PATH.findIndex(([pr, pc]) => pr === r && pc === c);
      const isSafe = isPath && SAFE_SQUARES.has(pathIndex);
      const isCenter = r === CENTER[0] && c === CENTER[1];
      cells.push(
        <div
          key={`${r}-${c}`}
          className={[
            styles.cell,
            isPath ? styles.pathCell : styles.emptyCell,
            isSafe ? styles.safeCell : "",
            isCenter ? styles.centerCell : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ gridRow: r + 1, gridColumn: c + 1 }}
        />
      );
    }
  }

  // base corner backgrounds
  const corners: [Color, number, number][] = [
    ["red", 0, 0],
    ["green", 0, 9],
    ["yellow", 9, 9],
    ["blue", 9, 0],
  ];

  return (
    <div className={styles.board}>
      {cells}
      {corners.map(([color, r, c]) => (
        <div
          key={color}
          className={styles.baseCorner}
          style={{
            gridRow: `${r + 1} / span 6`,
            gridColumn: `${c + 1} / span 6`,
            background: `${COLOR_HEX[color]}22`,
            borderColor: COLOR_HEX[color],
          }}
        />
      ))}
      {Array.from(byCell.entries()).map(([key, group]) =>
        group.map((t, i) => {
          const offset = group.length > 1 ? (i - (group.length - 1) / 2) * 7 : 0;
          return (
            <div
              key={`${key}-${t.color}-${t.tokenIndex}`}
              className={`${styles.token} ${t.clickable ? styles.tokenClickable : ""}`}
              style={{
                gridRow: t.row + 1,
                gridColumn: t.col + 1,
                background: COLOR_HEX[t.color],
                transform: `translateX(${offset}%)`,
              }}
              onClick={() => t.clickable && onMoveToken(t.tokenIndex)}
              title={`${t.color} token ${t.tokenIndex + 1}`}
            />
          );
        })
      )}
    </div>
  );
}

export function squareLabel(progress: number): string {
  if (progress === BASE) return "base";
  if (progress === FINISHED) return "home";
  return String(progress);
}

export { boardSquare };
