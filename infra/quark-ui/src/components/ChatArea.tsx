'use client';

import { useState } from 'react';
import { Box, HStack } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatList } from '@/components/ChatList';
import { ChatWindow } from '@/components/ChatWindow';

const MotionBox = motion.create(Box);

interface ChatAreaProps {
  showBackButton?: boolean;
  onBack?: () => void;
  onChatClick?: () => void; // для мобильной навигации из ResizableLayout
}

export function ChatArea({ showBackButton = false, onBack, onChatClick }: ChatAreaProps) {
  const [selectedChatId, setSelectedChatId] = useState<string>('chat-1'); // По умолчанию первый чат
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
      <Box h="full" position="relative" overflow="hidden">
        <AnimatePresence mode="wait">
          {!showChatWindow ? (
            // Показываем список чатов
            <MotionBox
              key="chat-list"
              initial={{ x: 0 }}
              animate={{ x: 0 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="100%"
            >
              <ChatList 
                onChatSelect={handleChatSelect}
                selectedChatId={selectedChatId}
                fullWidth={true}
              />
            </MotionBox>
          ) : (
            // Показываем окно чата
            <MotionBox
              key="chat-window"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="100%"
            >
              <ChatWindow
                chatId={selectedChatId}
                showBackButton={true}
                onBack={handleBackToList}
              />
            </MotionBox>
          )}
        </AnimatePresence>
      </Box>
    );
  }

  // Десктопный режим: ChatList + ChatWindow рядом
  return (
    <HStack spacing={0} align="stretch" h="full">
      {/* Список чатов (30% ширины) */}
      <Box 
        w="300px" 
        minW="300px" 
        maxW="400px"
        borderRight="1px solid" 
        borderColor="gray.200" 
        _dark={{ borderColor: "gray.700" }}
      >
        <ChatList 
          onChatSelect={setSelectedChatId}
          selectedChatId={selectedChatId}
          fullWidth={false}
        />
      </Box>

      {/* Окно чата (70% ширины) */}
      <Box flex={1}>
        <ChatWindow
          chatId={selectedChatId}
          showBackButton={false}
        />
      </Box>
    </HStack>
  );
}