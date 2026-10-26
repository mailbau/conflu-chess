"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "confluence" | "postman";
const THEMES: Theme[] = ["confluence", "postman"];
const KEY = "disguise-theme";

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "confluence",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("confluence");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && THEMES.includes(saved as Theme)) setThemeState(saved as Theme);
    } catch {
      // ignore
    }
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    try {
      localStorage.setItem(KEY, t);
    } catch {
      // ignore
    }
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
