"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatList } from "@/components/ChatList";
import { ChatWindow } from "@/components/ChatWindow";

const MotionDiv = motion.div;

interface ChatAreaProps {
  readonly showBackButton?: boolean;
  readonly onBack?: () => void;
  readonly onChatClick?: () => void;
}

export function ChatArea({ showBackButton = false, onBack, onChatClick }: ChatAreaProps) {
  const [selectedChatId, setSelectedChatId] = useState<string>("chat-1");
  const [showChatWindow, setShowChatWindow] = useState(false);

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setShowChatWindow(true);
    onChatClick?.();
  };

  const handleBackToList = () => {
    setShowChatWindow(false);
    onBack?.();
  };

  const isMobileMode = showBackButton;

  if (isMobileMode) {
    return (
      <div className="h-full relative overflow-hidden">
        <AnimatePresence mode="wait">
          {showChatWindow ? (
            <MotionDiv
              key="chat-window"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="h-full"
            >
              <ChatWindow chatId={selectedChatId} showBackButton={true} onBack={handleBackToList} />
            </MotionDiv>
          ) : (
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
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex flex-row h-full items-stretch">
      <div className="w-[300px] min-w-[300px] max-w-[400px] border-r border-gray-200 dark:border-gray-700">
        <ChatList 
          onChatSelect={setSelectedChatId}
          selectedChatId={selectedChatId}
          fullWidth={false}
        />
      </div>
      <div className="flex-1">
        <ChatWindow
          chatId={selectedChatId}
          showBackButton={false}
        />
      </div>
    </div>
  );
}
