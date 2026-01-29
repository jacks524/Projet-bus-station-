"use client";

import React from "react";
import { Moon, Sun, Languages } from "lucide-react";
import { useLanguage, useTheme } from "../providers";

export default function GlobalControls() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-2 py-2 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
      <button
        type="button"
        onClick={toggleTheme}
        className="inline-flex items-center justify-center rounded-full p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
        aria-label={t("Basculer le thème", "Toggle theme")}
        title={t("Basculer le thème", "Toggle theme")}
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <button
        type="button"
        onClick={toggleLanguage}
        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
        aria-label={t("Changer la langue", "Switch language")}
        title={t("Changer la langue", "Switch language")}
      >
        <Languages className="h-3.5 w-3.5" />
        <span>{language === "fr" ? "FR" : "EN"}</span>
      </button>
    </div>
  );
}
