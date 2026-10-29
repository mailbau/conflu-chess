"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { submitScore } from "@/lib/submitScore";
import styles from "./WikiRaceBoard.module.css";

type Phase = "loading-setup" | "running" | "done";

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

export default function WikiRaceBoard() {
  const [phase, setPhase] = useState<Phase>("loading-setup");
  const [target, setTarget] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [html, setHtml] = useState("");
  const [path, setPath] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState(false);
  const startRef = useRef<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const loadArticle = useCallback(async (title: string) => {
    try {
      const raw = await fetchArticleHtml(title);
      setHtml(sanitize(raw));
      setCurrentTitle(title);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  const setup = useCallback(async () => {
    setPhase("loading-setup");
    const [start, dest] = await Promise.all([randomTitle(), randomTitle()]);
    setTarget(dest);
    setPath([start]);
    startRef.current = Date.now();
    setElapsed(0);
    await loadArticle(start);
    setPhase("running");
  }, [loadArticle]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    setup();
  }, [setup]);

  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      if (startRef.current) setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, [phase]);

  function handleClick(e: React.MouseEvent) {
    const a = (e.target as HTMLElement).closest("a[data-wiki-title]");
    if (!a) return;
    e.preventDefault();
    const title = a.getAttribute("data-wiki-title")!;
    const nextPath = [...path, title];
    setPath(nextPath);
    loadArticle(title).then(() => {
      if (title.toLowerCase() === target.toLowerCase()) {
        setPhase("done");
        submitScore("wikiracer", "fewest_clicks", nextPath.length - 1);
        submitScore("wikiracer", "best_time", Date.now() - (startRef.current ?? Date.now()));
      }
    });
  }

  if (phase === "loading-setup" && !target) return <p>Loading…</p>;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          Get from <strong>{path[0]}</strong> to <strong>{target}</strong>
        </div>
        <div className={styles.stats}>
          <span>{elapsed}s</span>
          <span>{path.length - 1} clicks</span>
        </div>
        <button className={styles.newGameButton} onClick={setup}>
          New race
        </button>
      </div>

      {phase === "done" && (
        <div className={styles.doneBanner}>
          Reached <strong>{target}</strong> in {path.length - 1} clicks and {elapsed}s.{" "}
          <button className={styles.newGameButton} onClick={setup}>
            Play again
          </button>
        </div>
      )}

      <div className={styles.path}>{path.join(" → ")}</div>

      {error ? (
        <p>Could not load article. <button onClick={() => loadArticle(currentTitle)}>Retry</button></p>
      ) : (
        <div
          ref={contentRef}
          className={styles.article}
          onClick={handleClick}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
