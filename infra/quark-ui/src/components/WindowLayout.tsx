'use client';

import { Box, Flex, useColorMode, useBreakpointValue } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { BlogFeed } from './BlogFeed';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { ResizableSplitter } from './ResizableSplitter';
import { FloatingChatButton } from './FloatingChatButton';

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

interface WindowLayoutProps {
  onPostClick?: (postId: string) => void;
}

export function WindowLayout({ onPostClick }: WindowLayoutProps) {
  const { colorMode } = useColorMode();
  const { viewMode, blogWindow, chatWindow } = useAppStore();
  const [selectedChatId, setSelectedChatId] = useState<string>('1');
  const [chatWidth, setChatWidth] = useState<number>(30); // ширина чата в процентах
  const [debouncedChatWidth, setDebouncedChatWidth] = useState<number>(30); // для плавных переходов
  const [showChatWindow, setShowChatWindow] = useState<boolean>(false); // показывать ли окно переписки в мобильном режиме
  
  // Определяем размер экрана для адаптивности
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });

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

  // Мобильная версия
  if (isMobile) {
    return (
      <Box h="full" position="relative">
        {viewMode === 'chat-only' || viewMode === 'both' || viewMode === 'home' ? (
          <Flex h="full">
            <Box w="100%" maxW="400px">
              <ChatList 
                onChatSelect={openChatWindow} 
                selectedChatId={selectedChatId}
              />
            </Box>
            <AnimatePresence>
              {selectedChatId && (
                <MotionBox
                  flex={1}
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <ChatWindow chatId={selectedChatId} />
                </MotionBox>
              )}
            </AnimatePresence>
          </Flex>
        ) : (
          <BlogFeed onPostClick={onPostClick} />
        )}
      </Box>
    );
  }

  // Планшетная версия
  if (isTablet) {
    return (
      <Flex h="full" gap={2}>
        {(viewMode === 'blog-only' || viewMode === 'both' || viewMode === 'home') && blogWindow.isOpen && (
          <MotionBox
            flex={viewMode === 'both' ? 1 : 2}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Box
              h="full"
              bg={colorMode === 'dark' ? 'gray.800' : 'white'}
              borderRadius="lg"
              border="1px solid"
              borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
              overflow="hidden"
              shadow="lg"
            >
              <BlogFeed onPostClick={onPostClick} />
            </Box>
          </MotionBox>
        )}

        {(viewMode === 'chat-only' || viewMode === 'both' || viewMode === 'home') && chatWindow.isOpen && (
          <MotionBox
            flex={viewMode === 'both' || viewMode === 'home' ? 1 : 2}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Flex
              h="full"
              bg={colorMode === 'dark' ? 'gray.800' : 'white'}
              borderRadius="lg"
              border="1px solid"
              borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
              overflow="hidden"
              shadow="lg"
            >
              <Box w="300px" borderRight="1px solid" borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}>
                <ChatList 
                  onChatSelect={openChatWindow} 
                  selectedChatId={selectedChatId}
                />
              </Box>
              <Box flex={1}>
                <ChatWindow chatId={selectedChatId} />
              </Box>
            </Flex>
          </MotionBox>
        )}
      </Flex>
    );
  }

  // Десктопная версия - полноценный двойной поток
  return (
    <Box h="full" p={4}>
      {/* Режимы с двумя окнами - используем ResizableSplitter */}
      {(viewMode === 'both' || viewMode === 'home') && blogWindow.isOpen && chatWindow.isOpen && (
        <ResizableSplitter
          onRightWidthChange={setChatWidth}
          leftChild={
            <Box
              h="full"
              bg={colorMode === 'dark' ? 'gray.800' : 'white'}
              borderRadius="xl"
              border="1px solid"
              borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
              overflow="hidden"
              shadow="2xl"
              _hover={{
                shadow: '3xl',
                borderColor: 'primary.500',
              }}
            >
              {/* Заголовок окна блога */}
              <Flex
                align="center"
                justify="space-between"
                p={3}
                bg={colorMode === 'dark' ? 'gray.750' : 'gray.50'}
                borderBottom="1px solid"
                borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
              >
                <Box 
                  w={3} 
                  h={3} 
                  bg="green.400" 
                  borderRadius="full"
                  mr={2}
                />
              </Flex>
              
              <Box h="calc(100% - 52px)">
                <BlogFeed onPostClick={onPostClick} />
              </Box>
            </Box>
          }
          rightChild={
            <Flex
              h="full"
              bg={colorMode === 'dark' ? 'gray.800' : 'white'}
              borderRadius="xl"
              border="1px solid"
              borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
              overflow="hidden"
              shadow="2xl"
              _hover={{
                shadow: '3xl',
                borderColor: 'secondary.500',
              }}
              direction="column"
            >
              {/* Заголовок окна чата */}
              <Flex
                align="center"
                justify="space-between"
                p={3}
                bg={colorMode === 'dark' ? 'gray.750' : 'gray.50'}
                borderBottom="1px solid"
                borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
                minH="52px"
              >
                <Box 
                  w={3} 
                  h={3} 
                  bg="blue.400" 
                  borderRadius="full"
                  mr={2}
                />
              </Flex>
              
              {/* Содержимое чата с плавными анимациями */}
              <AnimatePresence mode="wait">
                {showOnlyChatList ? (
                  // Мобильный режим: ChatList ⇄ ChatWindow
                  <MotionBox
                    key="mobile-chat-mode"
                    flex={1}
                    overflow="hidden"
                    position="relative"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                      duration: 0.4,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {!showChatWindow ? (
                        <MotionBox
                          key="chat-list-mobile"
                          initial={{ x: 0, opacity: 1 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: '-100%', opacity: 0 }}
                          transition={{ 
                            type: 'spring', 
                            stiffness: 300, 
                            damping: 30,
                            opacity: { duration: 0.2 }
                          }}
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
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
                          initial={{ x: '100%', opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: '100%', opacity: 0 }}
                          transition={{ 
                            type: 'spring', 
                            stiffness: 300, 
                            damping: 30,
                            opacity: { duration: 0.2 }
                          }}
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
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
                    flex={1}
                    overflow="hidden"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ 
                      duration: 0.4,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    <MotionBox 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ 
                        width: "280px", 
                        opacity: 1,
                        transition: { 
                          width: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
                          opacity: { duration: 0.3, delay: 0.2 }
                        }
                      }}
                      exit={{ 
                        width: 0, 
                        opacity: 0,
                        transition: { 
                          width: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                          opacity: { duration: 0.2 }
                        }
                      }}
                      borderRight="1px solid" 
                      borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
                      overflow="hidden"
                    >
                      <ChatList 
                        onChatSelect={setSelectedChatId} 
                        selectedChatId={selectedChatId}
                      />
                    </MotionBox>
                    <MotionBox 
                      flex={1}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        transition: { duration: 0.4, delay: 0.3 }
                      }}
                      exit={{ 
                        opacity: 0, 
                        x: 20,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <ChatWindow chatId={selectedChatId} />
                    </MotionBox>
                  </MotionFlex>
                )}
              </AnimatePresence>
            </Flex>
          }
        />
      )}

      {/* Режимы с одним окном - используем старую логику */}
      {viewMode === 'blog-only' && blogWindow.isOpen && (
        <AnimatePresence>
          <MotionBox
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30,
              duration: 0.3 
            }}
            h="full"
          >
            <Box
              h="full"
              bg={colorMode === 'dark' ? 'gray.800' : 'white'}
              borderRadius="xl"
              border="1px solid"
              borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
              overflow="hidden"
              shadow="2xl"
              _hover={{
                shadow: '3xl',
                borderColor: 'primary.500',
              }}
            >
              {/* Заголовок окна */}
              <Flex
                align="center"
                justify="space-between"
                p={3}
                bg={colorMode === 'dark' ? 'gray.750' : 'gray.50'}
                borderBottom="1px solid"
                borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
              >
                <Box 
                  w={3} 
                  h={3} 
                  bg="green.400" 
                  borderRadius="full"
                  mr={2}
                />
              </Flex>
              
              <Box h="calc(100% - 52px)">
                <BlogFeed onPostClick={onPostClick} />
              </Box>
            </Box>
          </MotionBox>
        </AnimatePresence>
      )}

      {viewMode === 'chat-only' && chatWindow.isOpen && (
        <AnimatePresence>
          <MotionBox
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30,
              duration: 0.3 
            }}
            h="full"
          >
            <Flex
              h="full"
              bg={colorMode === 'dark' ? 'gray.800' : 'white'}
              borderRadius="xl"
              border="1px solid"
              borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
              overflow="hidden"
              shadow="2xl"
              _hover={{
                shadow: '3xl',
                borderColor: 'secondary.500',
              }}
              direction="column"
            >
              {/* Заголовок окна */}
              <Flex
                align="center"
                justify="space-between"
                p={3}
                bg={colorMode === 'dark' ? 'gray.750' : 'gray.50'}
                borderBottom="1px solid"
                borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
                minH="52px"
              >
                <Box 
                  w={3} 
                  h={3} 
                  bg="blue.400" 
                  borderRadius="full"
                  mr={2}
                />
              </Flex>
              
              {/* Содержимое чата */}
              <Flex flex={1} overflow="hidden">
                <Box 
                  w="280px" 
                  borderRight="1px solid" 
                  borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
                >
                  <ChatList 
                    onChatSelect={openChatWindow} 
                    selectedChatId={selectedChatId}
                  />
                </Box>
                <Box flex={1}>
                  <ChatWindow chatId={selectedChatId} />
                </Box>
              </Flex>
            </Flex>
          </MotionBox>
        </AnimatePresence>
      )}
      
      {/* Плавающая кнопка чата, когда мессенджер скрыт */}
      {(!chatWindow.isOpen || (viewMode === 'blog-only')) && (
        <FloatingChatButton />
      )}
    </Box>
  );
}