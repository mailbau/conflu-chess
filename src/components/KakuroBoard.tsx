"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { generatePuzzle } from "@/lib/kakuro/generator";
import type { Difficulty } from "@/lib/kakuro/types";
import { isSolved, wrongCellsFor } from "@/lib/kakuro/check";
import { loadSave, writeSave, clearSave, type KakuroSave } from "@/lib/kakuroStorage";
import { submitScore } from "@/lib/submitScore";
import styles from "./KakuroBoard.module.css";

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

function newGame(difficulty: Difficulty): KakuroSave {
  const puzzle = generatePuzzle(difficulty);
  return {
    difficulty,
    rows: puzzle.rows,
    cols: puzzle.cols,
    cells: puzzle.cells,
    runs: puzzle.runs,
    board: Array.from({ length: puzzle.rows }, () => Array(puzzle.cols).fill("")),
    seconds: 0,
    solved: false,
  };
}

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function KakuroBoard() {
  const [save, setSave] = useState<KakuroSave | null>(null);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [wrongCells, setWrongCells] = useState<Set<string>>(new Set());
  const prevSolved = useRef(false);

  useEffect(() => {
    setSave(loadSave() ?? newGame("easy"));
  }, []);

  useEffect(() => {
    if (save) writeSave(save);
  }, [save]);

  useEffect(() => {
    if (!save || save.solved) return;
    const id = setInterval(() => {
      setSave((s) => (s && !s.solved ? { ...s, seconds: s.seconds + 1 } : s));
    }, 1000);
    return () => clearInterval(id);
  }, [save?.solved]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (save?.solved && !prevSolved.current) {
      submitScore("kakuro", `best_time_${save.difficulty}`, save.seconds * 1000);
    }
    prevSolved.current = save?.solved ?? false;
  }, [save?.solved]); // eslint-disable-line react-hooks/exhaustive-deps

  const isWhite = useMemo(
    () => save?.cells.map((row) => row.map((c) => c.type === "white")) ?? [],
    [save?.cells]
  );

  if (!save) return <p>Loading…</p>;

  function startNew(difficulty: Difficulty) {
    clearSave();
    setSave(newGame(difficulty));
    setSelected(null);
    setWrongCells(new Set());
  }

  function enterDigit(digit: string) {
    if (!selected || !save || save.solved) return;
    const [r, c] = selected;
    if (!isWhite[r][c]) return;
    const board = save.board.map((row) => [...row]);
    board[r][c] = digit;
    const solved = isSolved(save.runs, board);
    setSave({ ...save, board, solved });
    setWrongCells(new Set());
  }

  function clearCell() {
    if (!selected || !save) return;
    const [r, c] = selected;
    if (!isWhite[r][c]) return;
    const board = save.board.map((row) => [...row]);
    board[r][c] = "";
    setSave({ ...save, board });
    setWrongCells(new Set());
  }

  function check() {
    if (!save) return;
    setWrongCells(wrongCellsFor(save.runs, save.board));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key >= "1" && e.key <= "9") enterDigit(e.key);
    else if (e.key === "Backspace" || e.key === "Delete") clearCell();
  }

  return (
    <div className={styles.wrap} tabIndex={0} onKeyDown={onKeyDown}>
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
          Time: <strong>{formatTime(save.seconds)}</strong>
        </span>
        <button className={styles.checkButton} onClick={check}>
          Check
        </button>
        <button className={styles.resetButton} onClick={() => startNew(save.difficulty)}>
          New puzzle
        </button>
      </div>

      {save.solved && <div className={styles.solvedBanner}>Solved! 🎉</div>}

      <div className={styles.boardScroll}>
        <div
          className={styles.grid}
          style={{ gridTemplateColumns: `repeat(${save.cols}, 34px)` }}
        >
          {save.cells.map((row, r) =>
            row.map((cell, c) => {
              if (cell.type === "black") {
                return (
                  <div key={`${r}-${c}`} className={styles.blackCell}>
                    {cell.right !== null && <span className={styles.clueRight}>{cell.right}</span>}
                    {cell.down !== null && <span className={styles.clueDown}>{cell.down}</span>}
                  </div>
                );
              }
              const isSelected = selected?.[0] === r && selected?.[1] === c;
              const isWrong = wrongCells.has(`${r},${c}`);
              return (
                <div
                  key={`${r}-${c}`}
                  className={`${styles.whiteCell} ${isSelected ? styles.selected : ""} ${
                    isWrong ? styles.wrong : ""
                  }`}
                  onClick={() => setSelected([r, c])}
                >
                  {save.board[r][c]}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className={styles.numpad}>
        {Array.from({ length: 9 }, (_, n) => (
          <button key={n} onClick={() => enterDigit(String(n + 1))}>
            {n + 1}
          </button>
        ))}
        <button onClick={clearCell}>Erase</button>
      </div>
    </div>
  );
}
