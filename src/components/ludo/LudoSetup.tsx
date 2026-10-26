"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getPlayerId } from "@/lib/playerId";
import styles from "./LudoSetup.module.css";

export default function LudoSetup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createGame() {
    if (!name.trim()) {
      setError("Enter a name first");
      return;
    }
    setCreating(true);
    setError(null);
    const playerId = getPlayerId();
    const res = await fetch("/api/ludo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, name: name.trim() }),
    });
    const data = await res.json();
    setCreating(false);
    if (data.id) {
      router.push(`/ludo/${data.id}`);
    } else {
      setError(data.error ?? "failed to create game");
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>Your name</div>
      <input
        className={styles.nameInput}
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={24}
        placeholder="e.g. Alice"
      />
      <button className={styles.createButton} onClick={createGame} disabled={creating}>
        {creating ? "Creating…" : "Create game"}
      </button>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
