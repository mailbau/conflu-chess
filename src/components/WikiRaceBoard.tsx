"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { submitScore } from "@/lib/submitScore";
import { dailyPair, todayDateKey } from "@/lib/wikiracer";
import { loadSave, writeSave, type WikiRaceSave } from "@/lib/wikiracerStorage";
import styles from "./WikiRaceBoard.module.css";

const API = "https://en.wikipedia.org/api/rest_v1/page";

async function randomTitle(): Promise<string> {
  const res = await fetch(`${API}/random/summary`);
  const data = await res.json();
  return data.title as string;
}

async function fetchArticleHtml(title: string): Promise<string> {
  const res = await fetch(`${API}/html/${encodeURIComponent(title)}`);
  if (!res.ok) throw new Error("article not found");
  return res.text();
}

// kills scripts/styles/edit-section links and rewrites internal wiki links
// to a data attribute we intercept, so navigation never leaves the page
function sanitize(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, style, link, .mw-editsection, sup.reference").forEach((el) =>
    el.remove()
  );
  doc.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href") || "";
    const m = href.match(/^\.?\/?(?:wiki\/)?([^#?]+)$/);
    if (m && !href.includes(":")) {
      a.setAttribute("data-wiki-title", decodeURIComponent(m[1]).replace(/_/g, " "));
      a.setAttribute("href", "#");
    } else {
      a.removeAttribute("href");
    }
  });
  return doc.body.innerHTML;
}

function newDaily(): WikiRaceSave {
  const dateKey = todayDateKey();
  const [start, target] = dailyPair(dateKey);
  return { mode: "daily", dateKey, target, path: [start], startedAt: Date.now(), status: "playing" };
}

async function newFree(): Promise<WikiRaceSave> {
  const [start, target] = await Promise.all([randomTitle(), randomTitle()]);
  return {
    mode: "free",
    dateKey: crypto.randomUUID(),
    target,
    path: [start],
    startedAt: Date.now(),
    status: "playing",
  };
}

export default function WikiRaceBoard() {
  const [mode, setMode] = useState<"daily" | "free">("daily");
  const [save, setSave] = useState<WikiRaceSave | null>(null);
  const [html, setHtml] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState(false);
  const currentTitleRef = useRef("");

  const loadArticle = useCallback(async (title: string) => {
    try {
      const raw = await fetchArticleHtml(title);
      setHtml(sanitize(raw));
      currentTitleRef.current = title;
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  // load (or start) today's daily puzzle, and separately the free-play state
  useEffect(() => {
    async function init() {
      const d = loadSave("daily");
      const todaysDaily = d && d.dateKey === todayDateKey() ? d : newDaily();
      writeSave(todaysDaily);
      const f = loadSave("free") ?? (await newFree());
      const active = mode === "daily" ? todaysDaily : f;
      setSave(active);
      await loadArticle(active.path[active.path.length - 1]);
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!save || save.status !== "playing") return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - save.startedAt) / 1000)), 500);
    return () => clearInterval(id);
  }, [save]);

  async function switchMode(next: "daily" | "free") {
    setMode(next);
    let active: WikiRaceSave;
    if (next === "daily") {
      const d = loadSave("daily");
      active = d && d.dateKey === todayDateKey() ? d : newDaily();
    } else {
      active = loadSave("free") ?? (await newFree());
    }
    writeSave(active);
    setSave(active);
    await loadArticle(active.path[active.path.length - 1]);
  }

  async function startNewFree() {
    const next = await newFree();
    writeSave(next);
    setSave(next);
    await loadArticle(next.path[0]);
  }

  function handleClick(e: React.MouseEvent) {
    const a = (e.target as HTMLElement).closest("a[data-wiki-title]");
    if (!a || !save || save.status !== "playing") return;
    e.preventDefault();
    const title = a.getAttribute("data-wiki-title")!;
    const path = [...save.path, title];
    const won = title.toLowerCase() === save.target.toLowerCase();
    const next: WikiRaceSave = won
      ? { ...save, path, status: "won", finishedMs: Date.now() - save.startedAt }
      : { ...save, path };
    writeSave(next);
    setSave(next);
    loadArticle(title);
    if (won) {
      submitScore("wikiracer", "fewest_clicks", path.length - 1);
      submitScore("wikiracer", "best_time", next.finishedMs!);
    }
  }

  if (!save) return <p>Loading…</p>;

  const clicks = save.path.length - 1;
  const secondsShown = save.status === "won" ? Math.floor((save.finishedMs ?? 0) / 1000) : elapsed;

  return (
    <div className={styles.wrap}>
      <div className={styles.modeTabs}>
        <button className={mode === "daily" ? styles.modeTabActive : ""} onClick={() => switchMode("daily")}>
          Daily
        </button>
        <button className={mode === "free" ? styles.modeTabActive : ""} onClick={() => switchMode("free")}>
          Free play
        </button>
      </div>

      <div className={styles.header}>
        <div>
          Get from <strong>{save.path[0]}</strong> to <strong>{save.target}</strong>
        </div>
        <div className={styles.stats}>
          <span>{secondsShown}s</span>
          <span>{clicks} clicks</span>
        </div>
        {mode === "free" && (
          <button className={styles.newGameButton} onClick={startNewFree}>
            New race
          </button>
        )}
      </div>

      {save.status === "won" && (
        <div className={styles.doneBanner}>
          Reached <strong>{save.target}</strong> in {clicks} clicks and {secondsShown}s.
          {mode === "daily" ? " Come back tomorrow for a new one." : (
            <button className={styles.newGameButton} onClick={startNewFree}>
              Play again
            </button>
          )}
        </div>
      )}

      <div className={styles.path}>{save.path.join(" → ")}</div>

      {error ? (
        <p>
          Could not load article.{" "}
          <button onClick={() => loadArticle(currentTitleRef.current)}>Retry</button>
        </p>
      ) : (
        <div
          className={styles.article}
          onClick={handleClick}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
