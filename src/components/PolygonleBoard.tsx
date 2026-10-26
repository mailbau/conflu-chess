"use client";

import { useEffect, useMemo, useState } from "react";
import { dailyWord, randomWord, shapesForWord, todayDateKey, type Token } from "@/lib/polygonle";
import { scoreGuess, type LetterStatus } from "@/lib/wordScoring";
import { loadSave, writeSave, type PolygonleSave } from "@/lib/polygonleStorage";
import { submitScore } from "@/lib/submitScore";
import styles from "./PolygonleBoard.module.css";

const MAX_GUESSES = 6;

function newDaily(): PolygonleSave {
  const dateKey = todayDateKey();
  return { mode: "daily", dateKey, word: dailyWord(dateKey), guesses: [], status: "playing" };
}

function newFree(): PolygonleSave {
  return { mode: "free", dateKey: crypto.randomUUID(), word: randomWord(), guesses: [], status: "playing" };
}

function Shape({ token }: { token: Token }) {
  const shapeClass =
    {
      circle: styles.shapeCircle,
      square: styles.shapeSquare,
      triangle: styles.shapeTriangle,
      diamond: styles.shapeDiamond,
      pentagon: styles.shapePentagon,
      hexagon: styles.shapeHexagon,
      star: styles.shapeStar,
      cross: styles.shapeCross,
    }[token.shape];
  return (
    <div className={`${styles.shape} ${shapeClass}`} style={{ backgroundColor: token.color }} />
  );
}

export default function PolygonleBoard() {
  const [mode, setMode] = useState<"daily" | "free">("daily");
  const [save, setSave] = useState<PolygonleSave | null>(null);
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

  const tokens = useMemo(() => (save ? shapesForWord(save.word) : []), [save?.word]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = useMemo(() => {
    if (!save) return [];
    return save.guesses.map((g) => ({ guess: g, score: scoreGuess(g, save.word) }));
  }, [save]);

  function submitGuess() {
    if (!save || save.status !== "playing") return;
    if (current.length !== save.word.length) {
      setError(`Guess must be ${save.word.length} letters`);
      return;
    }
    if (!/^[a-zA-Z]+$/.test(current)) {
      setError("Letters only");
      return;
    }
    setError(null);
    const guesses = [...save.guesses, current.toLowerCase()];
    const won = current.toLowerCase() === save.word.toLowerCase();
    const status = won ? "won" : guesses.length >= MAX_GUESSES ? "lost" : "playing";
    const next: PolygonleSave = { ...save, guesses, status };
    writeSave(next);
    setSave(next);
    setCurrent("");
    if (won) submitScore("polygonle", "wins", 1);
  }

  function startNewFree() {
    const next = newFree();
    writeSave(next);
    setSave(next);
    setCurrent("");
    setError(null);
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
        Matching shapes = matching letters. {save.word.length} letters, {MAX_GUESSES - save.guesses.length} guesses left.
      </div>

      <div className={styles.shapeRow}>
        {tokens.map((t, i) => (
          <Shape key={i} token={t} />
        ))}
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
          <div className={styles.row} key={ri}>
            {row.guess.split("").map((letter, ci) => (
              <div key={ci} className={tileClass(row.score[ci], true)}>
                {letter}
              </div>
            ))}
          </div>
        ))}
      </div>

      {save.status === "playing" && (
        <div className={styles.inputRow}>
          <input
            value={current}
            maxLength={save.word.length}
            onChange={(e) => setCurrent(e.target.value.replace(/[^a-zA-Z]/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && submitGuess()}
            placeholder={`${save.word.length}-letter guess`}
          />
          <button onClick={submitGuess} disabled={current.length !== save.word.length}>
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
