"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { randomWords } from "@/lib/typingWords";
import { submitScore } from "@/lib/submitScore";
import styles from "./TypingTestBoard.module.css";

const DURATIONS = [15, 30, 60];
const WORD_POOL = 200; // plenty for any duration at normal typing speed

type Phase = "idle" | "running" | "done";

export default function TypingTestBoard() {
  const [duration, setDuration] = useState(30);
  const [words, setWords] = useState<string[]>([]);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [result, setResult] = useState<{ wpm: number; accuracy: number; raw: number } | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const startRef = useRef<number | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [scrollY, setScrollY] = useState(0);
  // the running interval reads these every tick instead of closing over
  // `typed`/`words`/`duration` state, which would otherwise be pinned to
  // whatever they were the instant the effect last re-ran (the moment typing
  // started) and never reflect what's actually been typed since
  const typedRef = useRef("");
  const wordsRef = useRef<string[]>([]);
  const durationRef = useRef(duration);

  useEffect(() => {
    const w = randomWords(WORD_POOL);
    wordsRef.current = w;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial word list on mount
    setWords(w);
  }, []);

  function reset(nextDuration = duration) {
    const w = randomWords(WORD_POOL);
    wordsRef.current = w;
    setWords(w);
    typedRef.current = "";
    setTyped("");
    setPhase("idle");
    setTimeLeft(nextDuration);
    setResult(null);
    setScrollY(0);
    startRef.current = null;
    durationRef.current = nextDuration;
    inputRef.current?.focus();
  }

  function finish() {
    const typedWords = typedRef.current.trim().split(/\s+/).filter(Boolean);
    const target = wordsRef.current;
    let correctChars = 0;
    let totalChars = 0;
    typedWords.forEach((w, i) => {
      const t = target[i] ?? "";
      totalChars += w.length + 1; // +1 for the space after it
      for (let c = 0; c < w.length; c++) {
        if (w[c] === t[c]) correctChars++;
      }
    });
    const minutes = durationRef.current / 60;
    const wpm = Math.round(correctChars / 5 / minutes);
    const raw = Math.round(totalChars / 5 / minutes);
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    setResult({ wpm, accuracy: Math.min(100, accuracy), raw });
    setPhase("done");
    submitScore("typingtest", `best_wpm_${durationRef.current}`, wpm);
  }

  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      if (startRef.current === null) return;
      const elapsed = (Date.now() - startRef.current) / 1000;
      const left = Math.max(0, durationRef.current - elapsed);
      setTimeLeft(Math.ceil(left));
      if (left <= 0) {
        clearInterval(id);
        finish();
      }
    }, 200);
    return () => clearInterval(id);
  }, [phase]);

  function handleChange(value: string) {
    if (phase === "done") return;
    if (phase === "idle") {
      startRef.current = Date.now();
      setPhase("running");
    }
    typedRef.current = value;
    setTyped(value);

    const wordIndex = value.split(" ").length - 1;
    if (wordsRef.current.length - wordIndex < 20) {
      const extended = [...wordsRef.current, ...randomWords(WORD_POOL)];
      wordsRef.current = extended;
      setWords(extended);
    }
  }

  function switchDuration(d: number) {
    setDuration(d);
    reset(d);
  }

  const typedWords = typed.split(" ");
  const currentWordIndex = typedWords.length - 1;
  const currentInput = typedWords[currentWordIndex] ?? "";

  // scroll just enough to keep the current word's line one line down from the
  // top, instead of snapping a whole page at once -- the CSS transition on
  // the translateY below is what makes the move itself smooth
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const word = wordRefs.current[currentWordIndex];
    if (!viewport || !word) return;
    const lineHeight = parseFloat(getComputedStyle(viewport).lineHeight);
    const relativeTop = word.getBoundingClientRect().top - viewport.getBoundingClientRect().top + scrollY;
    const next = Math.max(0, relativeTop - lineHeight);
    setScrollY((prev) => (Math.abs(prev - next) > 1 ? next : prev));
  }, [currentWordIndex, words]); // eslint-disable-line react-hooks/exhaustive-deps

  if (words.length === 0) return <p>Loading…</p>;

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.durationTabs}>
          {DURATIONS.map((d) => (
            <button
              key={d}
              className={duration === d ? styles.tabActive : ""}
              onClick={() => switchDuration(d)}
            >
              {d}s
            </button>
          ))}
        </div>
        <div className={styles.timer}>{phase === "idle" ? duration : timeLeft}s</div>
      </div>

      {phase !== "done" && (
        <div
          ref={viewportRef}
          className={styles.textArea}
          onClick={() => inputRef.current?.focus()}
        >
          <div
            ref={lineRef}
            className={styles.textLines}
            style={{ transform: `translateY(-${scrollY}px)` }}
          >
            {words.map((word, wi) => (
              <span
                key={wi}
                ref={(el) => {
                  wordRefs.current[wi] = el;
                }}
                className={styles.word}
              >
                {word.split("").map((ch, ci) => {
                  let cls = styles.charPending;
                  if (wi < currentWordIndex) {
                    cls = typedWords[wi]?.[ci] === ch ? styles.charCorrect : styles.charWrong;
                  } else if (wi === currentWordIndex) {
                    if (ci < currentInput.length) {
                      cls = currentInput[ci] === ch ? styles.charCorrect : styles.charWrong;
                    } else if (ci === currentInput.length) {
                      cls = styles.charCursor;
                    }
                  }
                  return (
                    <span key={ci} className={cls}>
                      {ch}
                    </span>
                  );
                })}
                {wi === currentWordIndex && currentInput.length > word.length && (
                  <span className={styles.charExtra}>{currentInput.slice(word.length)}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {phase !== "done" && (
        <input
          ref={inputRef}
          className={styles.hiddenInput}
          value={typed}
          onChange={(e) => handleChange(e.target.value)}
          autoFocus
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
      )}

      {phase === "done" && result && (
        <div className={styles.results}>
          <div className={styles.resultBig}>
            <span className={styles.resultValue}>{result.wpm}</span>
            <span className={styles.resultLabel}>wpm</span>
          </div>
          <div className={styles.resultRow}>
            <div>
              <span className={styles.resultValueSmall}>{result.accuracy}%</span>
              <span className={styles.resultLabel}>accuracy</span>
            </div>
            <div>
              <span className={styles.resultValueSmall}>{result.raw}</span>
              <span className={styles.resultLabel}>raw</span>
            </div>
          </div>
          <button className={styles.restartButton} onClick={() => reset()}>
            Try again
          </button>
        </div>
      )}

      {phase !== "done" && (
        <button className={styles.restartButton} onClick={() => reset()}>
          Restart
        </button>
      )}
    </div>
  );
}
