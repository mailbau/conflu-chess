"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DIFFICULTY_CONFIG,
  emptyBoard,
  placeMines,
  revealFrom,
  revealAllMines,
  countFlags,
  isWin,
  type Difficulty,
  type Cell,
} from "@/lib/minesweeper";
import { loadSave, writeSave, clearSave, type MinesweeperSave } from "@/lib/minesweeperStorage";
import styles from "./MinesweeperBoard.module.css";

const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "expert"];

function newGame(difficulty: Difficulty): MinesweeperSave {
  const { rows, cols } = DIFFICULTY_CONFIG[difficulty];
  return {
    difficulty,
    board: emptyBoard(rows, cols),
    minesPlaced: false,
    status: "playing",
    seconds: 0,
  };
}

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MinesweeperBoard() {
  const [save, setSave] = useState<MinesweeperSave | null>(null);

  useEffect(() => {
    setSave(loadSave() ?? newGame("beginner"));
  }, []);

  useEffect(() => {
    if (save) writeSave(save);
  }, [save]);

  useEffect(() => {
    if (!save || save.status !== "playing" || !save.minesPlaced) return;
    const id = setInterval(() => {
      setSave((s) => (s && s.status === "playing" ? { ...s, seconds: s.seconds + 1 } : s));
    }, 1000);
    return () => clearInterval(id);
  }, [save?.status, save?.minesPlaced]); // eslint-disable-line react-hooks/exhaustive-deps

  const mineCount = useMemo(() => {
    if (!save) return 0;
    return DIFFICULTY_CONFIG[save.difficulty].mines - countFlags(save.board);
  }, [save]);

  if (!save) return <p>Loading…</p>;

  function startNew(difficulty: Difficulty) {
    clearSave();
    setSave(newGame(difficulty));
  }

  function reveal(r: number, c: number) {
    if (!save || save.status !== "playing") return;
    const cell = save.board[r][c];
    if (cell.revealed || cell.flagged) return;

    let board = save.board;
    let minesPlaced = save.minesPlaced;
    if (!minesPlaced) {
      board = placeMines(board, DIFFICULTY_CONFIG[save.difficulty].mines, r, c);
      minesPlaced = true;
    }

    if (board[r][c].mine) {
      setSave({ ...save, board: revealAllMines(board), minesPlaced, status: "lost" });
      return;
    }

    board = revealFrom(board, r, c);
    const won = isWin(board);
    setSave({ ...save, board, minesPlaced, status: won ? "won" : "playing" });
  }

  function toggleFlag(e: React.MouseEvent, r: number, c: number) {
    e.preventDefault();
    if (!save || save.status !== "playing") return;
    const cell = save.board[r][c];
    if (cell.revealed) return;
    const board = save.board.map((row, ri) =>
      row.map((cl, ci) => (ri === r && ci === c ? { ...cl, flagged: !cl.flagged } : cl))
    );
    setSave({ ...save, board });
  }

  const { cols } = DIFFICULTY_CONFIG[save.difficulty];

  function cellContent(cell: Cell) {
    if (!cell.revealed) return cell.flagged ? "🚩" : "";
    if (cell.mine) return "💣";
    return cell.adjacent || "";
  }

  function cellClass(cell: Cell) {
    return [
      styles.cell,
      cell.revealed ? styles.cellRevealed : "",
      cell.revealed && cell.mine ? styles.cellMine : "",
      !cell.revealed && cell.flagged ? styles.cellFlag : "",
      cell.revealed && cell.adjacent > 0 ? styles[`n${cell.adjacent}`] : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.difficultyPicker}>
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            className={d === save.difficulty ? styles.difficultyActive : ""}
            onClick={() => startNew(d)}
          >
            {d}
          </button>
        ))}
      </div>

      <div className={styles.statusBar}>
        <span>
          Mines: <strong>{mineCount}</strong>
        </span>
        <span>
          Time: <strong>{formatTime(save.seconds)}</strong>
        </span>
        <button className={styles.resetButton} onClick={() => startNew(save.difficulty)}>
          Reset
        </button>
      </div>

      {save.status === "won" && <div className={`${styles.banner} ${styles.bannerWon}`}>Cleared! 🎉</div>}
      {save.status === "lost" && <div className={`${styles.banner} ${styles.bannerLost}`}>Boom. Try again.</div>}

      <div className={styles.boardScroll}>
        <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${cols}, 26px)` }}>
          {save.board.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={cellClass(cell)}
                onClick={() => reveal(r, c)}
                onContextMenu={(e) => toggleFlag(e, r, c)}
              >
                {cellContent(cell)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
