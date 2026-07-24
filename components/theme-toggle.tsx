"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

/**
 * Switches between Obsidian (dark) and Daylight (light). The initial value is
 * applied by an inline script in the root layout, so this only mirrors what is
 * already on the document — no flash on load.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem("axom-theme", next);
    } catch {
      // Storage unavailable (private mode) — the toggle still works for this session.
    }
  }

  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to Daylight" : "Switch to Obsidian"}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="glass glass-hover flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-ax-dim hover:text-ax-text transition"
    >
      {isDark ? <Sun size={13} className="text-ax-warn" /> : <Moon size={13} className="text-ax-info" />}
      <span className="hidden sm:inline">{isDark ? "Daylight" : "Obsidian"}</span>
    </button>
  );
}
