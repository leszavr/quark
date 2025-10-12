'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box, HStack } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion.create(Box);

interface ResizableLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  minLeftWidth?: number;
  minRightWidth?: number;
  defaultLeftWidth?: number;
  height?: string;
  // Пропсы для мобильной навигации
  onChatSelect?: () => void;
  onBackToList?: () => void;
  mobileThreshold?: number; // порог ширины для мобильного режима (в процентах)
}

export function ResizableLayout({
  leftPanel,
  rightPanel,
  minLeftWidth = 300,
  minRightWidth = 300,
  defaultLeftWidth = 60, // 60% по умолчанию
  height = "100vh",
  onChatSelect,
  onBackToList,
  mobileThreshold = 35 // 35% и меньше = мобильный режим
}: ResizableLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [showChatWindow, setShowChatWindow] = useState(false); // для мобильной навигации
  const containerRef = useRef<HTMLDivElement>(null);

  // Определяем мобильный режим
  const isMobileMode = leftWidth <= mobileThreshold;

  // Функции мобильной навигации
  const openChatWindow = useCallback(() => {
    setShowChatWindow(true);
    onChatSelect?.();
  }, [onChatSelect]);

  const backToChatList = useCallback(() => {
    setShowChatWindow(false);
    onBackToList?.();
  }, [onBackToList]);

  // Сброс мобильного режима при увеличении ширины
  useEffect(() => {
    if (!isMobileMode) {
      setShowChatWindow(false);
    }
  }, [isMobileMode]);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
    
    // Вычисляем новую ширину в процентах
    const newLeftPercent = (mouseX / containerWidth) * 100;
    
    // Вычисляем минимальные ширины в процентах
    const minLeftPercent = (minLeftWidth / containerWidth) * 100;
    const minRightPercent = (minRightWidth / containerWidth) * 100;
    
    // Ограничиваем размеры
    const clampedWidth = Math.max(
      minLeftPercent,
      Math.min(100 - minRightPercent, newLeftPercent)
    );
    
    setLeftWidth(clampedWidth);
  }, [isDragging, minLeftWidth, minRightWidth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Добавляем глобальные обработчики событий
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Мобильный режим - переключение между экранами
  if (isMobileMode) {
    return (
      <Box
        ref={containerRef}
        h={height}
        position="relative"
        overflow="hidden"
      >
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
              {React.cloneElement(leftPanel as React.ReactElement<any>, {
                onChatClick: openChatWindow
              })}
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
              {React.cloneElement(rightPanel as React.ReactElement<any>, {
                showBackButton: true,
                onBack: backToChatList
              })}
            </MotionBox>
          )}
        </AnimatePresence>
      </Box>
    );
  }

  // Обычный десктопный режим
  return (
    <HStack
      ref={containerRef}
      spacing={0}
      align="stretch"
      h={height}
      position="relative"
    >
      {/* Левая панель */}
      <Box
        width={`${leftWidth}%`}
        minW={`${minLeftWidth}px`}
        position="relative"
      >
        {leftPanel}
      </Box>

      {/* Разделительная линия */}
      <Box
        width="4px"
        bg="gray.300"
        _dark={{ bg: "gray.600" }}
        cursor="col-resize"
        position="relative"
        onMouseDown={handleMouseDown}
        _hover={{
          bg: "blue.400",
          _dark: { bg: "blue.500" }
        }}
        transition="background-color 0.2s"
      >
        {/* Визуальный индикатор */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          width="20px"
          height="40px"
          borderRadius="full"
          bg="gray.400"
          _dark={{ bg: "gray.500" }}
          opacity={0}
          _hover={{ opacity: 1 }}
          transition="opacity 0.2s"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            width="2px"
            height="20px"
            bg="white"
            borderRadius="full"
            mr="2px"
          />
          <Box
            width="2px"
            height="20px"
            bg="white"
            borderRadius="full"
          />
        </Box>
      </Box>

      {/* Правая панель */}
      <Box
        flex={1}
        minW={`${minRightWidth}px`}
      >
        {rightPanel}
      </Box>
    </HStack>
  );
}