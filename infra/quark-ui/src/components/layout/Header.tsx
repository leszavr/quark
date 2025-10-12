'use client';

import {
  Box,
  HStack,
  Text,
  IconButton,
  Avatar,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Badge,
} from '@chakra-ui/react';
import { Home, Moon, Sun, Settings, LogOut, User, Zap, MessageSquare, MessageSquareOff } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/stores/appStore';

interface HeaderProps {
  showHomeButton?: boolean;
}

export function Header({ showHomeButton = false }: HeaderProps) {
  const { colorMode, toggleColorMode } = useColorMode();
  const pathname = usePathname();
  const { viewMode, setViewMode, chatWindow, setChatWindow } = useAppStore();
  
  const isChatVisible = chatWindow.isOpen && (viewMode === 'both' || viewMode === 'chat-only' || viewMode === 'home');
  
  const toggleChat = () => {
    if (isChatVisible) {
      // Скрываем только чат, блог остается открытым
      setViewMode('blog-only');
      setChatWindow({ isOpen: false });
    } else {
      // Показываем чат в режиме both (блог + чат)
      setChatWindow({ isOpen: true });
      setViewMode('both');
    }
  };

  const headerBg = colorMode === 'dark' ? 'gray.800' : 'white';
  const borderColor = colorMode === 'dark' ? 'gray.700' : 'gray.200';

  return (
    <Box
      as="header"
      w="full"
      borderBottom="1px solid"
      borderColor={borderColor}
      px={6}
      py={3}
      position="sticky"
      top={0}
      zIndex={1000}
      backdropFilter="blur(10px)"
      bg={colorMode === 'dark' 
        ? 'rgba(26, 32, 44, 0.8)' 
        : 'rgba(255, 255, 255, 0.8)'
      }
    >
      <HStack justify="space-between" align="center">
        {/* Левая часть - Логотип и домой (если нужно) */}
        <HStack spacing={4}>
          {showHomeButton && (
            <Link href="/">
              <IconButton
                aria-label="На главную"
                icon={<Home size={20} />}
                variant="ghost"
                size="md"
                _hover={{ 
                  bg: colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50' 
                }}
              />
            </Link>
          )}
          
          <Link href="/">
            <HStack spacing={3} cursor="pointer" _hover={{ opacity: 0.8 }}>
              {/* Логотип */}
              <Box
                w={10}
                h={10}
                borderRadius="lg"
                bg={colorMode === 'dark' ? '#00f0ff' : '#1a202c'}
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow={colorMode === 'dark' ? '0 4px 8px rgba(0, 240, 255, 0.3)' : '0 4px 8px rgba(26, 32, 44, 0.3)'}
              >
                <Zap size={20} color={colorMode === 'dark' ? 'black' : 'white'} />
              </Box>
              
              <Text 
                fontSize="2xl" 
                fontWeight="bold" 
                fontFamily="Space Grotesk"
                color={colorMode === 'dark' ? '#00f0ff' : '#1a202c'}
              >
                Quark
              </Text>
            </HStack>
          </Link>
        </HStack>

        {/* Правая часть - Управление чатом, переключатель темы и профиль */}
        <HStack spacing={3}>
          {/* Переключатель мессенджера */}
          <IconButton
            aria-label={isChatVisible ? "Скрыть мессенджер" : "Показать мессенджер"}
            icon={isChatVisible ? <MessageSquareOff size={20} /> : <MessageSquare size={20} />}
            onClick={toggleChat}
            variant="ghost"
            size="md"
            _hover={{ 
              bg: colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50' 
            }}
          />

          {/* Переключатель темы */}
          <IconButton
            aria-label="Переключить тему"
            icon={colorMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            onClick={toggleColorMode}
            variant="ghost"
            size="md"
            _hover={{ 
              bg: colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50' 
            }}
          />

          {/* Меню профиля */}
          <Menu>
            <MenuButton>
              <HStack 
                spacing={2} 
                cursor="pointer"
                p={2}
                borderRadius="lg"
                _hover={{ 
                  bg: colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50' 
                }}
                transition="all 0.2s"
              >
                <Avatar 
                  size="sm" 
                  name="Иван Петров"
                />
                <Box display={{ base: 'none', md: 'block' }}>
                  <Text fontSize="sm" fontWeight="medium">
                    Иван Петров
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    @ivanpetrov
                  </Text>
                </Box>
              </HStack>
            </MenuButton>
            
            <MenuList>
              <Link href="/profile">
                <MenuItem icon={<User size={16} />}>
                  Профиль
                </MenuItem>
              </Link>
              
              <MenuItem icon={<Settings size={16} />}>
                Настройки
              </MenuItem>
              
              <MenuDivider />
              
              <MenuItem icon={<LogOut size={16} />} color="red.500">
                Выйти
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </HStack>
    </Box>
  );
}