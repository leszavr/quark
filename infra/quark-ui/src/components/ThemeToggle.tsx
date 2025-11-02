
"use client";
import React from "react";

import { IconButton } from "../../button";

import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  // Tailwind dark mode toggle
  const [colorMode, setColorMode] = React.useState(
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  const toggleColorMode = () => {
    const newMode = colorMode === "dark" ? "light" : "dark";
    setColorMode(newMode);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", newMode === "dark");
      window.localStorage.setItem("theme", newMode);
    }
  };

  return (
    <IconButton
      aria-label="Переключить тему"
      icon={colorMode === "light" ? <Moon size={18} /> : <Sun size={18} />}
      onClick={toggleColorMode}
      className="bg-transparent hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200"
      size="sm"
    />
  );
}
