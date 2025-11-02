"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatList } from "@/components/ChatList";
import { ChatWindow } from "@/components/ChatWindow";

const MotionDiv = motion.div;

interface ChatAreaProps {
  showBackButton?: boolean;
  onBack?: () => void;
  onChatClick?: () => void; // для мобильной навигации из ResizableLayout
}

export function ChatArea({ showBackButton = false, onBack, onChatClick }: ChatAreaProps) {
  const [selectedChatId, setSelectedChatId] = useState<string>("chat-1"); // По умолчанию первый чат
  const [showChatWindow, setShowChatWindow] = useState(false); // для мобильной навигации

  // Функции мобильной навигации
  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setShowChatWindow(true);
    onChatClick?.(); // уведомляем ResizableLayout о выборе чата
  };

  const handleBackToList = () => {
    setShowChatWindow(false);
    onBack?.(); // уведомляем ResizableLayout о возврате к списку
  };

  // Проверяем, нужен ли мобильный режим (передается через showBackButton)
  const isMobileMode = showBackButton;

  if (isMobileMode) {
    // Мобильная навигация: ChatList ⇄ ChatWindow
    return (
  <div className="h-full relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!showChatWindow ? (
            // Показываем список чатов
            <MotionDiv
              key="chat-list"
              initial={{ x: 0 }}
              animate={{ x: 0 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-0 left-0 w-full h-full"
            >
              <ChatList 
                onChatSelect={handleChatSelect}
                selectedChatId={selectedChatId}
                fullWidth={true}
              />
            </MotionDiv>
          ) : (
            // Показываем окно чата
            <MotionDiv
              key="chat-window"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-0 left-0 w-full h-full"
            >
              <ChatWindow
                chatId={selectedChatId}
                showBackButton={true}
                onBack={handleBackToList}
              />
            </MotionDiv>
          )}
        </AnimatePresence>
  </div>
    );
  }

  // Десктопный режим: ChatList + ChatWindow рядом
  return (
  <div className="flex flex-row h-full items-stretch">
      {/* Список чатов (30% ширины) */}
      <div className="w-[300px] min-w-[300px] max-w-[400px] border-r border-gray-200 dark:border-gray-700">
        <ChatList 
          onChatSelect={setSelectedChatId}
          selectedChatId={selectedChatId}
          fullWidth={false}
        />
  </div>

      {/* Окно чата (70% ширины) */}
  <div className="flex-1">
        <ChatWindow
          chatId={selectedChatId}
          showBackButton={false}
        />
  </div>
  </div>
  );
}