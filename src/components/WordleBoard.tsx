"use client";

import { useEffect, useMemo, useState } from "react";
import {
  dailyWord,
  isValidGuess,
  pickRandomWord,
  scoreGuess,
  todayDateKey,
} from "@/lib/wordle";
import { loadSave, writeSave, type LetterStatus, type WordleSave } from "@/lib/wordleStorage";
import { submitScore } from "@/lib/submitScore";
import styles from "./WordleBoard.module.css";

const MAX_GUESSES = 6;
const KEY_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

function newDaily(): WordleSave {
  const dateKey = todayDateKey();
  return { mode: "daily", dateKey, word: dailyWord(dateKey), guesses: [], status: "playing" };
}

function newFree(): WordleSave {
  return { mode: "free", dateKey: crypto.randomUUID(), word: pickRandomWord(), guesses: [], status: "playing" };
}

export default function WordleBoard() {
  const [mode, setMode] = useState<"daily" | "free">("daily");
  const [save, setSave] = useState<WordleSave | null>(null);
  const [current, setCurrent] = useState("");
  const [shake, setShake] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // load (or start) today's daily puzzle, and separately the free-play state
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
    const scored = save.guesses.map((g) => ({ guess: g, score: scoreGuess(g, save.word) }));
    const filledRows = [...scored];
    if (save.status === "playing" && filledRows.length < MAX_GUESSES) {
      filledRows.push({ guess: current, score: [] });
    }
    while (filledRows.length < MAX_GUESSES) {
      filledRows.push({ guess: "", score: [] });
    }
    return filledRows;
  }, [save, current]);

  const keyStatus = useMemo(() => {
    const map: Record<string, LetterStatus> = {};
    if (!save) return map;
    for (const g of save.guesses) {
      const score = scoreGuess(g, save.word);
      g.split("").forEach((letter, i) => {
        const s = score[i];
        const prev = map[letter];
        const rank = { correct: 3, present: 2, absent: 1 } as const;
        if (!prev || rank[s] > rank[prev]) map[letter] = s;
      });
    }
    return map;
  }, [save]);

  function submitGuess() {
    if (!save || save.status !== "playing" || current.length !== 5) return;
    if (!isValidGuess(current)) {
      setError("Not in word list");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    setError(null);
    const guesses = [...save.guesses, current];
    const won = current.toLowerCase() === save.word.toLowerCase();
    const status = won ? "won" : guesses.length >= MAX_GUESSES ? "lost" : "playing";
    const next: WordleSave = { ...save, guesses, status };
    writeSave(next);
    setSave(next);
    setCurrent("");
    if (won) submitScore("wordle", "wins", 1);
  }

  function pressKey(k: string) {
    if (!save || save.status !== "playing") return;
    setError(null);
    if (k === "enter") submitGuess();
    else if (k === "back") setCurrent((c) => c.slice(0, -1));
    else if (current.length < 5) setCurrent((c) => c + k);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") pressKey("enter");
    else if (e.key === "Backspace") pressKey("back");
    else if (/^[a-zA-Z]$/.test(e.key)) pressKey(e.key.toLowerCase());
  }

  function startNewFree() {
    const next = newFree();
    writeSave(next);
    setSave(next);
    setCurrent("");
  }

  if (!save) return <p>Loading…</p>;

  const tileClass = (status: LetterStatus | undefined, filled: boolean) =>
    [
      styles.tile,
      filled ? styles.tileFilled : "",
      status === "correct" ? styles.tileCorrect : "",
      status === "present" ? styles.tilePresent : "",
      status === "absent" ? styles.tileAbsent : "",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div className={styles.wrap} tabIndex={0} onKeyDown={onKeyDown}>
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

      {save.status === "won" && <div className={`${styles.banner} ${styles.bannerWon}`}>Solved in {save.guesses.length}! 🎉</div>}
      {save.status === "lost" && (
        <div className={`${styles.banner} ${styles.bannerLost}`}>
          The word was {save.word.toUpperCase()}
        </div>
      )}
      {error && <div className={styles.status}>{error}</div>}

      <div className={`${styles.grid} ${shake ? styles.shake : ""}`}>
        {rows.map((row, ri) => (
          <div className={styles.row} key={ri}>
            {Array.from({ length: 5 }, (_, ci) => (
              <div key={ci} className={tileClass(row.score[ci], !!row.guess[ci])}>
                {row.guess[ci] ?? ""}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className={styles.keyboard}>
        {KEY_ROWS.map((row, ri) => (
          <div className={styles.keyboardRow} key={ri}>
            {ri === 2 && (
              <button className={`${styles.key} ${styles.keyWide}`} onClick={() => pressKey("enter")}>
                Enter
              </button>
            )}
            {row.split("").map((k) => (
              <button
                key={k}
                className={`${styles.key} ${
                  keyStatus[k] === "correct"
                    ? styles.keyCorrect
                    : keyStatus[k] === "present"
                      ? styles.keyPresent
                      : keyStatus[k] === "absent"
                        ? styles.keyAbsent
                        : ""
                }`}
                onClick={() => pressKey(k)}
              >
                {k}
              </button>
            ))}
            {ri === 2 && (
              <button className={`${styles.key} ${styles.keyWide}`} onClick={() => pressKey("back")}>
                ⌫
              </button>
            )}
          </div>
        ))}
      </div>

      {mode === "free" && save.status !== "playing" && (
        <button className={styles.newGameButton} onClick={startNewFree}>
          New word
        </button>
      )}
    </div>
  );
}
