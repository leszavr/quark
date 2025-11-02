"use client";

// import useBreakpointValue удалён, используйте Tailwind классы для адаптива
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAppStore } from "@/stores/appStore";
import { BlogFeed } from "./BlogFeed";
import { ChatList } from "./ChatList";
import { ChatWindow } from "./ChatWindow";
import { ResizableSplitter } from "./ResizableSplitter";
import { FloatingChatButton } from "./FloatingChatButton";

const MotionBox = motion.div;
const MotionFlex = motion.div;

interface WindowLayoutProps {
  onPostClick?: (postId: string) => void;
}

export function WindowLayout({ onPostClick }: WindowLayoutProps) {
  // colorMode удалён, используйте Tailwind классы для темы
  const { viewMode, blogWindow, chatWindow } = useAppStore();
  const [selectedChatId, setSelectedChatId] = useState<string>("1");
  const [chatWidth, setChatWidth] = useState<number>(30); // ширина чата в процентах
  const [debouncedChatWidth, setDebouncedChatWidth] = useState<number>(30); // для плавных переходов
  const [showChatWindow, setShowChatWindow] = useState<boolean>(false); // показывать ли окно переписки в мобильном режиме
  
  // Определяем размер экрана для адаптивности
  // Tailwind: используем window.matchMedia для адаптива
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
      setIsTablet(window.matchMedia("(min-width: 769px) and (max-width: 1024px)").matches);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Дебаунсинг для плавного переключения режимов
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedChatWidth(chatWidth);
    }, 150); // задержка 150мс для предотвращения частых переключений

    return () => clearTimeout(timer);
  }, [chatWidth]);

  // Определяем, показывать ли только список чатов (с гистерезисом для плавности)
  const showOnlyChatList = debouncedChatWidth <= 35;

  // Функции мобильной навигации
  const openChatWindow = (chatId: string) => {
    setSelectedChatId(chatId);
    if (showOnlyChatList) {
      setShowChatWindow(true);
    }
  };

  const backToChatList = () => {
    setShowChatWindow(false);
  };

  // Mobile version - simple layout
  if (isMobile) {
    return (
      <div className="flex h-full gap-2">
        {(viewMode === "blog-only" || viewMode === "both" || viewMode === "home") && blogWindow.isOpen && (
          <MotionBox
            className={viewMode === "both" ? "flex-1" : "flex-[2]"}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
              <BlogFeed onPostClick={onPostClick} />
            </div>
          </MotionBox>
        )}

        {(viewMode === "chat-only" || viewMode === "both" || viewMode === "home") && chatWindow.isOpen && (
          <MotionBox
            className={viewMode === "both" || viewMode === "home" ? "flex-1" : "flex-[2]"}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
              <div className="w-[300px] border-r border-gray-200 dark:border-gray-700">
                <ChatList 
                  onChatSelect={openChatWindow} 
                  selectedChatId={selectedChatId}
                />
              </div>
              <div className="flex-1">
                <ChatWindow chatId={selectedChatId} />
              </div>
            </div>
          </MotionBox>
        )}
      </div>
    );
  }

  // Desktop version - full dual-stream layout
  <div className="h-full p-4">
      {/* Режимы с двумя окнами - используем ResizableSplitter */}
      {(viewMode === "both" || viewMode === "home") && blogWindow.isOpen && chatWindow.isOpen && (
        <ResizableSplitter
          onRightWidthChange={setChatWidth}
          leftChild={
            <div className="h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-2xl hover:shadow-3xl hover:border-primary-500">
              {/* Заголовок окна блога */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2" />
              </div>
              <div style={{ height: "calc(100% - 52px)" }}>
                <BlogFeed onPostClick={onPostClick} />
              </div>
            </div>
          }
          rightChild={
            <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-2xl hover:shadow-3xl hover:border-secondary-500">
              {/* Заголовок окна чата */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700 min-h-[52px]">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-2" />
              </div>
              {/* Содержимое чата с плавными анимациями */}
              <AnimatePresence mode="wait">
                {showOnlyChatList ? (
                  // Мобильный режим: ChatList ⇄ ChatWindow
                  <MotionBox
                    key="mobile-chat-mode"
                    className="flex-1 overflow-hidden relative"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <AnimatePresence mode="wait">
                      {!showChatWindow ? (
                        <MotionBox
                          key="chat-list-mobile"
                          initial={{ x: 0, opacity: 1 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: "-100%", opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30, opacity: { duration: 0.2 } }}
                          className="absolute top-0 left-0 right-0 bottom-0"
                        >
                          <ChatList 
                            onChatSelect={openChatWindow} 
                            selectedChatId={selectedChatId}
                            fullWidth={true}
                          />
                        </MotionBox>
                      ) : (
                        <MotionBox
                          key="chat-window-mobile"
                          initial={{ x: "100%", opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: "100%", opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30, opacity: { duration: 0.2 } }}
                          className="absolute top-0 left-0 right-0 bottom-0"
                        >
                          <ChatWindow 
                            chatId={selectedChatId} 
                            showBackButton={true}
                            onBack={backToChatList}
                          />
                        </MotionBox>
                      )}
                    </AnimatePresence>
                  </MotionBox>
                ) : (
                  // Десктопный режим: ChatList + ChatWindow рядом
                  <MotionFlex
                    key="desktop-chat-mode"
                    className="flex-1 flex overflow-hidden"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <MotionBox 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "280px", opacity: 1, transition: { width: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.3, delay: 0.2 } } }}
                      exit={{ width: 0, opacity: 0, transition: { width: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.2 } } }}
                      className="border-r border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <ChatList 
                        onChatSelect={setSelectedChatId} 
                        selectedChatId={selectedChatId}
                      />
                    </MotionBox>
                    <MotionBox 
                      className="flex-1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.3 } }}
                      exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                    >
                      <ChatWindow chatId={selectedChatId} />
                    </MotionBox>
                  </MotionFlex>
                )}
              </AnimatePresence>
            </div>
          }
        />
      )}

      {/* Режимы с одним окном - используем старую логику */}
      {viewMode === "blog-only" && blogWindow.isOpen && (
        <AnimatePresence>
          <MotionBox
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.3 
            }}
          >
            <div className="h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-2xl hover:shadow-3xl hover:border-primary-500">
              {/* Заголовок окна */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2" />
              </div>
              <div style={{ height: "calc(100% - 52px)" }}>
                <BlogFeed onPostClick={onPostClick} />
              </div>
            </div>
          </MotionBox>
        </AnimatePresence>
      )}

      {viewMode === "chat-only" && chatWindow.isOpen && (
        <AnimatePresence>
          <MotionBox
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.3 
            }}
          >
            <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-2xl hover:shadow-3xl hover:border-secondary-500">
              {/* Заголовок окна */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700 min-h-[52px]">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-2" />
              </div>
              {/* Содержимое чата */}
              <div className="flex flex-1 overflow-hidden">
                <div className="w-[280px] border-r border-gray-200 dark:border-gray-700">
                  <ChatList 
                    onChatSelect={openChatWindow} 
                    selectedChatId={selectedChatId}
                  />
                </div>
                <div className="flex-1">
                  <ChatWindow chatId={selectedChatId} />
                </div>
              </div>
            </div>
          </MotionBox>
        </AnimatePresence>
      )}
      
      {/* Плавающая кнопка чата, когда мессенджер скрыт */}
      {(!chatWindow.isOpen || (viewMode === "blog-only")) && (
        <FloatingChatButton />
      )}
  </div>
  );
}