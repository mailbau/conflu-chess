"use client";

import { useEffect, useMemo, useState } from "react";
import { getSudoku } from "sudoku-gen";
import type { Difficulty } from "sudoku-gen/dist/types/difficulty.type";
import styles from "./SudokuBoard.module.css";
import { loadSave, writeSave, clearSave, type SudokuSave } from "@/lib/sudokuStorage";

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"];

function newPuzzle(difficulty: Difficulty): SudokuSave {
  const { puzzle, solution } = getSudoku(difficulty);
  return {
    difficulty,
    puzzle,
    solution,
    board: puzzle.split("").map((c) => (c === "-" ? "" : c)),
    notes: Array.from({ length: 81 }, () => []),
    mistakes: 0,
    seconds: 0,
    solved: false,
  };
}

function rowOf(i: number) {
  return Math.floor(i / 9);
}
function colOf(i: number) {
  return i % 9;
}
function boxOf(i: number) {
  return Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3);
}

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SudokuBoard() {
  const [save, setSave] = useState<SudokuSave | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [notesMode, setNotesMode] = useState(false);

  // load existing game or start a new easy one, client-side only
  useEffect(() => {
    setSave(loadSave() ?? newPuzzle("easy"));
  }, []);

  // persist on every change
  useEffect(() => {
    if (save) writeSave(save);
  }, [save]);

  // timer
  useEffect(() => {
    if (!save || save.solved) return;
    const id = setInterval(() => {
      setSave((s) => (s && !s.solved ? { ...s, seconds: s.seconds + 1 } : s));
    }, 1000);
    return () => clearInterval(id);
  }, [save?.solved]); // eslint-disable-line react-hooks/exhaustive-deps

  const given = useMemo(
    () => (save ? save.puzzle.split("").map((c) => c !== "-") : []),
    [save?.puzzle] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const conflicts = useMemo(() => {
    if (!save) return new Set<number>();
    const bad = new Set<number>();
    for (let i = 0; i < 81; i++) {
      const v = save.board[i];
      if (!v) continue;
      for (let j = 0; j < 81; j++) {
        if (i === j) continue;
        const v2 = save.board[j];
        if (!v2 || v2 !== v) continue;
        if (rowOf(i) === rowOf(j) || colOf(i) === colOf(j) || boxOf(i) === boxOf(j)) {
          bad.add(i);
          bad.add(j);
        }
      }
    }
    return bad;
  }, [save?.board]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!save) return <p>Loading…</p>;

  function startNew(difficulty: Difficulty) {
    clearSave();
    setSave(newPuzzle(difficulty));
    setSelected(null);
  }

  function enterDigit(digit: string) {
    if (selected === null || !save || given[selected] || save.solved) return;
    if (notesMode) {
      setSave((s) => {
        if (!s) return s;
        const notes = s.notes.map((n) => [...n]);
        const set = notes[selected];
        const idx = set.indexOf(digit);
        if (idx >= 0) set.splice(idx, 1);
        else set.push(digit);
        return { ...s, notes };
      });
      return;
    }
    setSave((s) => {
      if (!s) return s;
      const board = [...s.board];
      const wasCorrectBefore = board[selected] === s.solution[selected];
      board[selected] = digit;
      const notes = s.notes.map((n, i) => (i === selected ? [] : n));
      const mistake = digit !== s.solution[selected] && !wasCorrectBefore;
      const solved = board.every((v, i) => v === s.solution[i]);
      return {
        ...s,
        board,
        notes,
        mistakes: s.mistakes + (mistake ? 1 : 0),
        solved,
      };
    });
  }

  function clearCell() {
    if (selected === null || given[selected]) return;
    setSave((s) => {
      if (!s) return s;
      const board = [...s.board];
      board[selected] = "";
      return { ...s, board };
    });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key >= "1" && e.key <= "9") enterDigit(e.key);
    else if (e.key === "Backspace" || e.key === "Delete") clearCell();
  }

  return (
    <div className={styles.wrap} tabIndex={0} onKeyDown={onKeyDown}>
      <div className={styles.boardCol}>
        <div className={styles.statusBar}>
          <span>
            Difficulty: <strong>{save.difficulty}</strong>
          </span>
          <span>
            Time: <strong>{formatTime(save.seconds)}</strong>
          </span>
          <span>
            Mistakes: <strong>{save.mistakes}</strong>
          </span>
        </div>

        {save.solved && <div className={styles.solvedBanner}>Solved! 🎉</div>}

        <div className={styles.grid}>
          {save.board.map((val, i) => {
            const isGiven = given[i];
            const isSelected = selected === i;
            const isPeer =
              selected !== null &&
              !isSelected &&
              (rowOf(i) === rowOf(selected) ||
                colOf(i) === colOf(selected) ||
                boxOf(i) === boxOf(selected));
            const classes = [
              styles.cell,
              rowOf(i) % 3 === 2 ? styles.cellRowEnd : "",
              isGiven ? styles.given : styles.entered,
              isSelected ? styles.selected : isPeer ? styles.peer : "",
              conflicts.has(i) ? styles.conflict : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <div key={i} className={classes} onClick={() => setSelected(i)}>
                {val ? (
                  val
                ) : save.notes[i].length ? (
                  <div className={styles.notes}>
                    {Array.from({ length: 9 }, (_, n) => (
                      <span key={n}>
                        {save.notes[i].includes(String(n + 1)) ? n + 1 : ""}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.numpad}>
          {Array.from({ length: 9 }, (_, n) => (
            <button key={n} onClick={() => enterDigit(String(n + 1))}>
              {n + 1}
            </button>
          ))}
        </div>
        <div className={styles.actions}>
          <button
            className={notesMode ? styles.notesToggleActive : ""}
            onClick={() => setNotesMode((v) => !v)}
          >
            Notes {notesMode ? "On" : "Off"}
          </button>
          <button onClick={clearCell}>Erase</button>
        </div>
        <div className={styles.difficultyPicker}>
          {DIFFICULTIES.map((d) => (
            <button key={d} onClick={() => startNew(d)}>
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
