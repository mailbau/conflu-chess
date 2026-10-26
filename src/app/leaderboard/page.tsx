"use client";

import { useEffect, useState } from "react";
import ThemedShell from "@/components/ThemedShell";
import { SCORE_REGISTRY } from "@/lib/scoreRegistry";
import styles from "./leaderboard.module.css";

const GAME_LABELS: Record<string, string> = {
  chess: "Chess",
  ludo: "Ludo",
  wordle: "Wordle",
  word500: "Word500",
  polygonle: "Polygonle",
  sudoku: "Sudoku",
  minesweeper: "Minesweeper",
  typingtest: "Typing test",
  kakuro: "Kakuro",
};

const GAMES = Object.keys(SCORE_REGISTRY);

type Row = { username: string; display: string };

export default function LeaderboardPage() {
  const [game, setGame] = useState(GAMES[0]);
  const metrics = Object.keys(SCORE_REGISTRY[game]);
  const [metric, setMetric] = useState(metrics[0]);
  const [rows, setRows] = useState<Row[]>([]);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(true);

  function switchGame(g: string) {
    setGame(g);
    setMetric(Object.keys(SCORE_REGISTRY[g])[0]);
  }

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?game=${game}&metric=${metric}`)
      .then((r) => r.json())
      .then((d) => {
        setRows(d.rows ?? []);
        setLabel(d.label ?? "");
        setLoading(false);
      });
  }, [game, metric]);

  return (
    <ThemedShell
      breadcrumb="Spaces / 2026 - Central Operation Group (COG)"
      title="Leaderboard"
      meta="Top scores across every game. Sign in to show up here."
    >
      <div className={styles.wrap}>
        <div className={styles.gameTabs}>
          {GAMES.map((g) => (
            <button key={g} className={g === game ? styles.tabActive : ""} onClick={() => switchGame(g)}>
              {GAME_LABELS[g] ?? g}
            </button>
          ))}
        </div>

        {metrics.length > 1 && (
          <div className={styles.metricTabs}>
            {metrics.map((m) => (
              <button
                key={m}
                className={m === metric ? styles.tabActive : ""}
                onClick={() => setMetric(m)}
              >
                {SCORE_REGISTRY[game][m].label}
              </button>
            ))}
          </div>
        )}

        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>{label}</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3}>Loading…</td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={3}>No scores yet. Be the first.</td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr key={row.username}>
                <td>{i + 1}</td>
                <td>{row.username}</td>
                <td>{row.display}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ThemedShell>
  );
}
