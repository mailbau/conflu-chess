"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "something went wrong");
      return;
    }
    router.push("/");
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span>◆</span> Confluence
        </div>
        <div className={styles.tabs}>
          <button
            className={mode === "login" ? styles.tabActive : ""}
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
          <button
            className={mode === "signup" ? styles.tabActive : ""}
            onClick={() => setMode("signup")}
          >
            Create account
          </button>
        </div>

        <div className={styles.field}>
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} maxLength={20} />
        </div>
        <div className={styles.field}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button className={styles.submitButton} onClick={submit} disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>

        <div className={styles.hint}>
          {mode === "login"
            ? "No account needed to play. Sign in only to save scores to the leaderboard."
            : "Username: 3-20 characters, letters/numbers/underscore. Password: 6+ characters."}
        </div>
      </div>
    </div>
  );
}
