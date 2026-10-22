"use client";

import { useEffect, useMemo, useState } from "react";
import { dailyWord, isValidGuess, pickRandomWord, todayDateKey } from "@/lib/word500";
import { scoreGuess, type LetterStatus } from "@/lib/wordScoring";
import { loadSave, writeSave, type Word500Save } from "@/lib/word500Storage";
import styles from "./Word500Board.module.css";

const MAX_GUESSES = 8;

function newDaily(): Word500Save {
  const dateKey = todayDateKey();
  return {
    mode: "daily",
    dateKey,
    word: dailyWord(dateKey),
    guesses: [],
    annotations: [],
    status: "playing",
  };
}

function newFree(): Word500Save {
  return {
    mode: "free",
    dateKey: crypto.randomUUID(),
    word: pickRandomWord(),
    guesses: [],
    annotations: [],
    status: "playing",
  };
}

function cycle(s: LetterStatus): LetterStatus {
  return s === "absent" ? "present" : s === "present" ? "correct" : "absent";
}

export default function Word500Board() {
  const [mode, setMode] = useState<"daily" | "free">("daily");
  const [save, setSave] = useState<Word500Save | null>(null);
  const [current, setCurrent] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = loadSave("daily");
    const todaysDaily = d && d.dateKey === todayDateKey() ? d : newDaily();
    writeSave(todaysDaily);
    const f = loadSave("free") ?? newFree();
    setSave(mode === "daily" ? todaysDaily : f);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function switchMode(next: "daily" | "free") {
    setMode(next);
    setCurrent("");
    setError(null);
    if (next === "daily") {
      const d = loadSave("daily");
      setSave(d && d.dateKey === todayDateKey() ? d : newDaily());
    } else {
      setSave(loadSave("free") ?? newFree());
    }
  }

  const rows = useMemo(() => {
    if (!save) return [];
    return save.guesses.map((g, i) => {
      const score = scoreGuess(g, save.word);
      const correct = score.filter((s) => s === "correct").length;
      const present = score.filter((s) => s === "present").length;
      const absent = 5 - correct - present;
      return { guess: g, marks: save.annotations[i] ?? Array(5).fill("absent"), correct, present, absent };
    });
  }, [save]);

  function submitGuess() {
    if (!save || save.status !== "playing") return;
    if (current.length !== 5) {
      setError("Guess must be 5 letters");
      return;
    }
    if (!isValidGuess(current)) {
      setError("Not in word list");
      return;
    }
    setError(null);
    const guesses = [...save.guesses, current.toLowerCase()];
    const annotations = [...save.annotations, Array(5).fill("absent") as LetterStatus[]];
    const won = current.toLowerCase() === save.word.toLowerCase();
    const status = won ? "won" : guesses.length >= MAX_GUESSES ? "lost" : "playing";
    const next: Word500Save = { ...save, guesses, annotations, status };
    writeSave(next);
    setSave(next);
    setCurrent("");
  }

  function toggleMark(rowIndex: number, letterIndex: number) {
    if (!save) return;
    const annotations = save.annotations.map((row, i) =>
      i === rowIndex ? row.map((s, j) => (j === letterIndex ? cycle(s) : s)) : row
    );
    const next = { ...save, annotations };
    writeSave(next);
    setSave(next);
  }

  function startNewFree() {
    const next = newFree();
    writeSave(next);
    setSave(next);
    setCurrent("");
    setError(null);
  }

  if (!save) return <p>Loading…</p>;

  const tileClass = (mark: LetterStatus) =>
    [
      styles.tile,
      mark === "correct" ? styles.tileMarkedCorrect : "",
      mark === "present" ? styles.tileMarkedPresent : "",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div className={styles.wrap}>
      <div className={styles.modeTabs}>
        <button
          className={mode === "daily" ? styles.modeTabActive : ""}
          onClick={() => switchMode("daily")}
        >
          Daily
        </button>
        <button
          className={mode === "free" ? styles.modeTabActive : ""}
          onClick={() => switchMode("free")}
        >
          Free play
        </button>
      </div>

      <div className={styles.hint}>
        5-letter word, {MAX_GUESSES - save.guesses.length} guesses left. Each guess shows
        only how many letters are green/yellow/gray — not which ones. Click a tile to mark
        your own guess.
      </div>

      {save.status === "won" && (
        <div className={`${styles.banner} ${styles.bannerWon}`}>
          Solved in {save.guesses.length}! 🎉
        </div>
      )}
      {save.status === "lost" && (
        <div className={`${styles.banner} ${styles.bannerLost}`}>
          The word was {save.word.toUpperCase()}
        </div>
      )}
      {error && <div className={styles.status}>{error}</div>}

      <div className={styles.grid}>
        {rows.map((row, ri) => (
          <div className={styles.guessRow} key={ri}>
            <div className={styles.tiles}>
              {row.guess.split("").map((letter, ci) => (
                <div
                  key={ci}
                  className={tileClass(row.marks[ci])}
                  onClick={() => toggleMark(ri, ci)}
                >
                  {letter}
                </div>
              ))}
            </div>
            <div className={styles.counts}>
              <span className={styles.countGreen}>{row.correct}</span>
              <span className={styles.countYellow}>{row.present}</span>
              <span className={styles.countGray}>{row.absent}</span>
            </div>
          </div>
        ))}
      </div>

      {save.status === "playing" && (
        <div className={styles.inputRow}>
          <input
            value={current}
            maxLength={5}
            onChange={(e) => setCurrent(e.target.value.replace(/[^a-zA-Z]/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && submitGuess()}
            placeholder="5-letter guess"
          />
          <button onClick={submitGuess} disabled={current.length !== 5}>
            Guess
          </button>
        </div>
      )}

      {mode === "free" && save.status !== "playing" && (
        <button className={styles.newGameButton} onClick={startNewFree}>
          New word
        </button>
      )}
    </div>
  );
}
