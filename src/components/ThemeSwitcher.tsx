"use client";

import { useTheme } from "@/lib/theme";
import styles from "./ThemeSwitcher.module.css";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <div className={styles.wrap}>
      <button
        className={theme === "confluence" ? styles.active : ""}
        onClick={() => setTheme("confluence")}
        title="Confluence disguise"
      >
        Confluence
      </button>
      <button
        className={theme === "postman" ? styles.active : ""}
        onClick={() => setTheme("postman")}
        title="Postman disguise"
      >
        Postman
      </button>
    </div>
  );
}
