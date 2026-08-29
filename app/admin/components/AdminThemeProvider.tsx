"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AdminTheme = "system" | "light" | "dark";

type AdminThemeContextValue = {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
};

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);

  if (!context) {
    throw new Error(
      "useAdminTheme must be used inside AdminThemeProvider"
    );
  }

  return context;
}

function applyTheme(theme: AdminTheme) {
  const root = document.documentElement;

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  root.classList.toggle("dark", isDark);
  root.dataset.adminTheme = theme;
}

export default function AdminThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<AdminTheme>(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    const saved = localStorage.getItem("minenote-admin-theme");

    return saved === "light" || saved === "dark" || saved === "system"
      ? saved
      : "system";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme === "system") {
      const media = window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

      const handleChange = () => applyTheme("system");

      media.addEventListener("change", handleChange);

      return () => media.removeEventListener("change", handleChange);
    }

    applyTheme(theme);
  }, [theme]);

  function setTheme(nextTheme: AdminTheme) {
    setThemeState(nextTheme);
    localStorage.setItem("minenote-admin-theme", nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
}
