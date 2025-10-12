'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Avatar,
  Badge,
  useColorMode,
  Divider,
  Button,
} from '@chakra-ui/react';
import { Home, MessageSquare, User, Puzzle, Settings, BookOpen, LayoutGrid, Zap } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import Link from 'next/link';

export function AppSidebar() {
  const { colorMode } = useColorMode();
  const { viewMode, setViewMode, unreadChats } = useAppStore();

  const mainItems = [
    { title: 'Главная', mode: 'home' as const, icon: Home },
    { title: 'Блог', mode: 'blog-only' as const, icon: BookOpen },
    { title: 'Чат', mode: 'chat-only' as const, icon: MessageSquare, badge: unreadChats > 0 ? unreadChats.toString() : undefined },
    { title: 'Оба окна', mode: 'both' as const, icon: LayoutGrid },
  ];

  const systemItems = [
    { title: 'Plugin Hub', icon: Puzzle },
    { title: 'Settings', icon: Settings },
  ];

  const sidebarBg = colorMode === 'dark' ? 'gray.800' : 'gray.50';
  const itemHoverBg = colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50';

  return (
    <Box
      w="280px"
      h="100vh"
      bg={sidebarBg}
      borderRight="1px solid"
      borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
      p={4}
      display="flex"
      flexDirection="column"
    >
      {/* Заголовок */}
      <HStack mb={6} spacing={3}>
        <Box
          w={8}
          h={8}
          borderRadius="md"
          bg={colorMode === 'dark' ? '#00f0ff' : '#1a202c'}
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow={colorMode === 'dark' ? "0 4px 8px rgba(0, 240, 255, 0.3)" : "0 4px 8px rgba(26, 32, 44, 0.3)"}
        >
          <Zap size={18} color="black" />
        </Box>
        <Text fontSize="xl" fontWeight="bold" fontFamily="Space Grotesk">
          Quark
        </Text>
      </HStack>

      {/* Основная навигация */}
      <VStack spacing={2} align="stretch" mb={6}>
        <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={2}>
          Навигация
        </Text>
        {mainItems.map((item) => (
          <Button
            key={item.title}
            variant={viewMode === item.mode ? 'solid' : 'ghost'}
            colorScheme={viewMode === item.mode ? 'cyan' : undefined}
            justifyContent="flex-start"
            leftIcon={<item.icon size={18} />}
            _hover={{ bg: viewMode === item.mode ? undefined : itemHoverBg }}
            onClick={() => setViewMode(item.mode)}
            rightIcon={
              item.badge ? (
                <Badge colorScheme="cyan" size="sm">
                  {item.badge}
                </Badge>
              ) : undefined
            }
          >
            {item.title}
          </Button>
        ))}
      </VStack>

      <Divider />

      {/* Системная навигация */}
      <VStack spacing={2} mb={4}>
        {systemItems.map((item) => (
          <Button
            key={item.title}
            variant="ghost"
            justifyContent="flex-start"
            leftIcon={<item.icon size={18} />}
            _hover={{ bg: itemHoverBg }}
          >
            {item.title}
          </Button>
        ))}
      </VStack>

      <Box flex={1} />

      {/* Профиль пользователя */}
      <Link href="/profile" style={{ width: '100%' }}>
        <HStack
          p={3}
          borderRadius="lg"
          bg={colorMode === 'dark' ? 'whiteAlpha.50' : 'blackAlpha.50'}
          _hover={{
            bg: colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.100',
            transform: 'translateY(-1px)',
          }}
          transition="all 0.2s"
          cursor="pointer"
        >
          <Avatar size="sm" name="Иван Петров" />
          <Box flex={1} overflow="hidden">
            <Text fontSize="sm" fontWeight="medium" isTruncated>
              Иван Петров
            </Text>
            <Text fontSize="xs" color="gray.500" isTruncated>
              @ivanpetrov
            </Text>
          </Box>
        </HStack>
      </Link>
    </Box>
  );
}
