"use client";

import { useEffect, useRef, useState } from "react";

type Theme = "warm" | "dark" | "system";

type ThemeItem = {
  value: Theme;
  label: string;
};

const themes: ThemeItem[] = [
  { value: "warm", label: "Warm" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  root.dataset.theme = theme;

  if (theme === "system") {
    root.removeAttribute("data-theme-mode");
  } else {
    root.dataset.themeMode = theme;
  }
}

function ThemeIcon({
  theme,
  className = "h-[18px] w-[18px]",
}: {
  theme: Theme;
  className?: string;
}) {
  if (theme === "warm") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className={className}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3.5" />
        <path
          strokeLinecap="round"
          d="M12 2.5v2M12 19.5v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2.5 12h2M19.5 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"
        />
      </svg>
    );
  }

  if (theme === "dark") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className={className}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2Z"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path strokeLinecap="round" d="M8 21h8M12 17v4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 12 4 4L19 6"
      />
    </svg>
  );
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("system");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("minenote-theme");

    const nextTheme: Theme =
      stored === "warm" || stored === "dark" || stored === "system"
        ? stored
        : "system";

    applyTheme(nextTheme);

    const frame = window.requestAnimationFrame(() => {
      setTheme(nextTheme);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function selectTheme(nextTheme: Theme) {
    setTheme(nextTheme);
    window.localStorage.setItem("minenote-theme", nextTheme);
    applyTheme(nextTheme);
    setOpen(false);
  }

  const activeTheme =
    themes.find((item) => item.value === theme) ?? themes[2];

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Theme: ${activeTheme.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="
          flex h-10 shrink-0 items-center justify-center gap-2
          rounded-xl border border-[var(--mn-border)]
          bg-[var(--mn-surface)]
          px-3
          text-xs font-semibold
          text-[var(--mn-text-secondary)]
          outline-none
          transition-all duration-200
          hover:-translate-y-0.5
          hover:border-[var(--mn-text-muted)]
          hover:bg-[var(--mn-surface-soft)]
          hover:text-[var(--mn-text)]
          focus-visible:border-[var(--mn-focus)]
          focus-visible:ring-2
          focus-visible:ring-[var(--mn-focus)]
        "
      >
        <ThemeIcon theme={theme} />

        <span className="hidden xl:inline text-xs font-semibold">
          Theme
        </span>

      </button>

      {open && (
        <div
          role="menu"
          aria-label="Choose theme"
          className="
            absolute right-0 top-[calc(100%+0.5rem)] z-50
            min-w-48 overflow-hidden
            rounded-2xl
            border border-[var(--mn-border)]
            bg-[var(--mn-surface)]
            p-1.5
            shadow-[var(--mn-shadow-lg)]
          "
        >
          <div className="px-3 pb-2 pt-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--mn-text-muted)]">
              Appearance
            </p>
          </div>

          {themes.map((item) => {
            const selected = item.value === theme;

            return (
              <button
                key={item.value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => selectTheme(item.value)}
                className={`
                  flex w-full items-center gap-3
                  rounded-xl px-3 py-2.5
                  text-left text-sm
                  transition-all duration-200
                  ${
                    selected
                      ? "bg-[var(--mn-accent-soft)] text-[var(--mn-text)]"
                      : "text-[var(--mn-text-secondary)] hover:bg-[var(--mn-surface-soft)] hover:text-[var(--mn-text)]"
                  }
                `}
              >
                <span
                  className={`
                    flex h-8 w-8 shrink-0 items-center justify-center
                    rounded-lg
                    ${
                      selected
                        ? "bg-[var(--mn-accent-soft)] text-[var(--mn-accent)]"
                        : "bg-[var(--mn-surface-soft)] text-[var(--mn-text-secondary)]"
                    }
                  `}
                >
                  <ThemeIcon theme={item.value} className="h-4 w-4" />
                </span>

                <span className="flex-1 font-medium">
                  {item.label}
                </span>

                {selected && (
                  <span className="text-[var(--mn-accent)]">
                    <CheckIcon />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
