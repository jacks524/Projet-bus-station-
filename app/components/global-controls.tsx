"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useLanguage, useTheme } from "@/app/providers";

export default function GlobalControls() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <div className="global-controls">
      <button
        type="button"
        className="control-button"
        onClick={toggleTheme}
        aria-label={t("Basculer le thème", "Toggle theme")}
        title={t("Mode sombre", "Dark mode")}
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <button
        type="button"
        className="control-button language-button"
        onClick={toggleLanguage}
        aria-label={t("Changer de langue", "Switch language")}
        title={t("Langue", "Language")}
      >
        {language === "fr" ? "FR" : "EN"}
      </button>
    </div>
  );
}
