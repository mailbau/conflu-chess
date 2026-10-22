"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TIME_CONTROLS } from "@/lib/gameTypes";
import { getPlayerId } from "@/lib/playerId";
import styles from "./ChessSetup.module.css";

type Color = "white" | "black" | "random";

export default function ChessSetup() {
  const router = useRouter();
  const [tcIndex, setTcIndex] = useState(2); // default 5 min
  const [color, setColor] = useState<Color>("random");
  const [link, setLink] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function createChallenge() {
    setCreating(true);
    const tc = TIME_CONTROLS[tcIndex];
    const playerId = getPlayerId();
    const res = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, baseMin: tc.baseMin, incSec: tc.incSec, color }),
    });
    const data = await res.json();
    setCreating(false);
    if (data.id) {
      const url = `${window.location.origin}/chess/${data.id}`;
      setLink(url);
      router.push(`/chess/${data.id}`);
    }
  }

  async function copyLink() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked: the input below is still there to select manually
    }
  }

  return (
    <div>
      <div className={styles.section}>
        <div className={styles.label}>Time control</div>
        <div className={styles.picker}>
          {TIME_CONTROLS.map((tc, i) => (
            <button
              key={tc.label}
              className={i === tcIndex ? styles.active : ""}
              onClick={() => setTcIndex(i)}
            >
              {tc.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.label}>Play as</div>
        <div className={styles.picker}>
          {(["white", "random", "black"] as Color[]).map((c) => (
            <button
              key={c}
              className={color === c ? styles.active : ""}
              onClick={() => setColor(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <button className={styles.createButton} onClick={createChallenge} disabled={creating}>
        {creating ? "Creating…" : "Create challenge"}
      </button>

      {link && (
        <div className={styles.linkBox}>
          Send this link to your friend:
          <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
          <button className={styles.copyButton} onClick={copyLink}>
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
