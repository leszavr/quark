
"use client";
import React from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  // Tailwind dark mode toggle
  const [colorMode, setColorMode] = React.useState(
    globalThis.window !== undefined && globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  const toggleColorMode = () => {
    const newMode = colorMode === "dark" ? "light" : "dark";
    setColorMode(newMode);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", newMode === "dark");
      globalThis.localStorage.setItem("theme", newMode);
    }
  };

  return (
    <button
      type="button"
      aria-label="Переключить тему"
      onClick={toggleColorMode}
      className="bg-transparent hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 p-2 rounded-md"
    >
      {colorMode === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
