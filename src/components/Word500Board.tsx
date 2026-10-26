"use client";

import { useEffect, useMemo, useState } from "react";
import { dailyWord, isValidGuess, pickRandomWord, todayDateKey } from "@/lib/word500";
import { scoreGuess } from "@/lib/wordScoring";
import { loadSave, writeSave, type Mark, type Word500Save } from "@/lib/word500Storage";
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

function cycle(s: Mark): Mark {
  return s === "absent" ? "present" : s === "present" ? "correct" : s === "correct" ? "wrong" : "absent";
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
      return {
        guess: g,
        marks: save.annotations[i] ?? (Array(5).fill("absent") as Mark[]),
        correct,
        present,
        absent,
      };
    });
  }, [save]);

  const usedLetters = useMemo(() => {
    const used = new Set<string>();
    save?.guesses.forEach((g) => g.split("").forEach((c) => used.add(c)));
    return used;
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
    const annotations = [...save.annotations, Array(5).fill("absent") as Mark[]];
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

  function resetMarks() {
    if (!save) return;
    const annotations = save.annotations.map((row) => row.map(() => "absent" as Mark));
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

  const tileClass = (mark: Mark) =>
    [
      styles.tile,
      mark === "correct" ? styles.tileMarkedCorrect : "",
      mark === "present" ? styles.tileMarkedPresent : "",
      mark === "wrong" ? styles.tileMarkedWrong : "",
    ]
      .filter(Boolean)
      .join(" ");

  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

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
        only how many letters are green/yellow/gray — not which ones. Click a tile to cycle
        your own mark (gray → yellow → green → red for "definitely wrong"). Letters below
        show which ones you've already used.
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

      {save.guesses.length > 0 && (
        <button className={styles.resetMarksButton} onClick={resetMarks}>
          Reset colors
        </button>
      )}

      <div className={styles.keyboard}>
        {alphabet.map((letter) => (
          <span
            key={letter}
            className={usedLetters.has(letter) ? styles.keyUsed : styles.keyUnused}
          >
            {letter}
          </span>
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
