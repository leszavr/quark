"use client";

import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/stores/appStore";

const MotionButton = motion.button;

export function FloatingChatButton() {
  const { setViewMode, setChatWindow } = useAppStore();
  
  const handleChatToggle = () => {
    // Всегда показываем чат в режиме both (блог + чат)
    setChatWindow({ isOpen: true });
    setViewMode("both");
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-[1000]"
    >
      <MotionButton
        type="button"
        aria-label="Открыть чат"
        className="w-14 h-14 rounded-full shadow-lg bg-gray-700 text-white dark:bg-green-300 dark:text-black flex items-center justify-center"
        style={{ boxShadow: "0 8px 24px rgba(74,85,104,0.4)" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        onClick={handleChatToggle}
      >
        <MessageSquare size={24} />
      </MotionButton>
  </div>
  );
}
