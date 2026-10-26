"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./AuthWidget.module.css";

export default function AuthWidget() {
  const [username, setUsername] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUsername(d.username))
      .catch(() => setUsername(null));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUsername(null);
  }

  if (username === undefined) return <div className={styles.widget} />;

  return (
    <div className={styles.widget}>
      {username ? (
        <>
          <span className={styles.username}>{username}</span>
          <button className={styles.link} onClick={logout}>
            Log out
          </button>
        </>
      ) : (
        <Link className={styles.link} href="/login">
          Sign in
        </Link>
      )}
      <Link className={styles.link} href="/leaderboard">
        Leaderboard
      </Link>
    </div>
  );
}
