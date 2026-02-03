"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";
type Language = "fr" | "en";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (value: Theme) => void;
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (value: Language) => void;
  toggleLanguage: () => void;
  t: (fr: string, en: string) => string;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const LanguageContext = createContext<LanguageContextValue | null>(null);

const THEME_STORAGE_KEY = "busstation_theme";
const LANG_STORAGE_KEY = "busstation_lang";

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within Providers");
  return ctx;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within Providers");
  return ctx;
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
}

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "fr";
  const stored = window.localStorage.getItem(LANG_STORAGE_KEY) as Language | null;
  if (stored === "fr" || stored === "en") return stored;
  const browserLang = navigator.language?.toLowerCase() || "fr";
  return browserLang.startsWith("en") ? "en" : "fr";
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [language, setLanguageState] = useState<Language>("fr");

  useEffect(() => {
    setThemeState(getInitialTheme());
    setLanguageState(getInitialLanguage());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LANG_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const themeValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: (value) => setThemeState(value),
      toggleTheme: () => setThemeState((prev) => (prev === "dark" ? "light" : "dark")),
    }),
    [theme]
  );

  const languageValue = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: (value) => setLanguageState(value),
      toggleLanguage: () => setLanguageState((prev) => (prev === "fr" ? "en" : "fr")),
      t: (fr, en) => (language === "fr" ? fr : en),
    }),
    [language]
  );

  return (
    <ThemeContext.Provider value={themeValue}>
      <LanguageContext.Provider value={languageValue}>{children}</LanguageContext.Provider>
    </ThemeContext.Provider>
  );
}
