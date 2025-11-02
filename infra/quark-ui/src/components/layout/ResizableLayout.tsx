"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
// Chakra UI удалён, используем div и Tailwind
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion.div;

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
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Мобильный режим - переключение между экранами
  if (isMobileMode) {
    return (
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{ height }}
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
              className="absolute top-0 left-0 w-full h-full"
            >
              {React.cloneElement(leftPanel as React.ReactElement<{ onChatClick: () => void }>, {
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
              className="absolute top-0 left-0 w-full h-full"
            >
              {React.cloneElement(rightPanel as React.ReactElement<{ showBackButton: boolean; onBack: () => void }>, {
                showBackButton: true,
                onBack: backToChatList
              })}
            </MotionBox>
          )}
        </AnimatePresence>
  </div>
    );
  }

  // Обычный десктопный режим
  return (
    <div
      ref={containerRef}
      className="flex flex-row items-stretch relative"
      style={{ height }}
    >
      {/* Левая панель */}
      <div
        className="relative"
        style={{ width: `${leftWidth}%`, minWidth: `${minLeftWidth}px` }}
      >
        {leftPanel}
  </div>

      {/* Разделительная линия */}
      <div
        className="w-1 bg-gray-300 dark:bg-gray-600 cursor-col-resize relative transition-colors duration-200 hover:bg-blue-400 dark:hover:bg-blue-500"
        onMouseDown={handleMouseDown}
      >
        {/* Визуальный индикатор */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-10 rounded-full bg-gray-400 dark:bg-gray-500 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
        >
          <div className="w-0.5 h-5 bg-white rounded-full mr-0.5" />
          <div className="w-0.5 h-5 bg-white rounded-full" />
        </div>
      </div>

      {/* Правая панель */}
      <div
        className="flex-1"
        style={{ minWidth: `${minRightWidth}px` }}
      >
        {rightPanel}
      </div>
  </div>
  );
}