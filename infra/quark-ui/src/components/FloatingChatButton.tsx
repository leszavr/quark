"use client";

import { IconButton } from "../../button";

import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/stores/appStore";

const MotionIconButton = motion(IconButton);

export function FloatingChatButton() {
  // Цветовая схема теперь через Tailwind dark: классы
  const colorMode = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const { setViewMode, setChatWindow, viewMode } = useAppStore();
  
  const handleChatToggle = () => {
    // Всегда показываем чат в режиме both (блог + чат)
    setChatWindow({ isOpen: true });
    setViewMode("both");
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-[1000]"
    >
      <MotionIconButton
        aria-label="Открыть чат"
        icon={<MessageSquare size={24} />}
        className="w-14 h-14 rounded-full shadow-lg bg-gray-700 text-white dark:bg-green-300 dark:text-black"
        style={{ boxShadow: "0 8px 24px rgba(74,85,104,0.4)" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        onClick={handleChatToggle}
      />
  </div>
  );
}
