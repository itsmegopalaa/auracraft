"use client";

import { useAdminTheme } from "./AdminThemeProvider";

export default function AdminThemeSwitcher() {
  const { theme, setTheme } = useAdminTheme();

  return (
    <select
      value={theme}
      onChange={(event) =>
        setTheme(
          event.target.value as "system" | "light" | "dark"
        )
      }
      aria-label="Admin theme"
      className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none transition hover:bg-zinc-50 focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      <option value="system">🖥️ System</option>
      <option value="light">☀️ Light</option>
      <option value="dark">🌙 Dark</option>
    </select>
  );
}
