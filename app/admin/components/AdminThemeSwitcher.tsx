"use client";

import { useEffect, useRef, useState } from "react";
import { useAdminTheme } from "./AdminThemeProvider";

type Theme = "system" | "light" | "dark";

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === "light") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2.5v2M12 19.5v2M4.58 4.58l1.42 1.42M18 18l1.42 1.42M2.5 12h2M19.5 12h2M4.58 19.42 6 18M18 6l1.42-1.42" />
      </svg>
    );
  }

  if (theme === "dark") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

const options: Array<{
  value: Theme;
  label: string;
}> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export default function AdminThemeSwitcher() {
  const { theme, setTheme } = useAdminTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div
      ref={ref}
      className="relative shrink-0"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Theme: ${theme}`}
        aria-expanded={open}
        className="admin-theme-switcher flex h-10 w-10 items-center justify-center rounded-full border border-[var(--mn-border)] bg-[var(--mn-control-bg)] text-[var(--mn-text-secondary)] transition hover:border-[var(--mn-border-strong)] hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)]"
      >
        <ThemeIcon theme={theme} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-[70] min-w-[150px] overflow-hidden rounded-[18px] border border-[var(--mn-border)] bg-[var(--mn-surface)] p-1.5 shadow-[var(--mn-shadow-lg)]">
          {options.map((option) => {
            const active = theme === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-sm transition ${
                  active
                    ? "bg-[var(--mn-accent-soft)] font-semibold text-[var(--mn-text)]"
                    : "text-[var(--mn-text-secondary)] hover:bg-[var(--mn-control-bg)] hover:text-[var(--mn-text)]"
                }`}
              >
                <ThemeIcon theme={option.value} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
