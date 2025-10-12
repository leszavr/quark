'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  useColorMode,
  Button,
  Divider,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Search, MessageSquare, Plus } from 'lucide-react';
import { useChatStorage } from '../hooks/useChatStorage';
import type { Chat } from '../hooks/useChatStorage';

const MotionBox = motion.create(Box);

interface ChatListProps {
  onChatSelect?: (chatId: string) => void;
  selectedChatId?: string;
  fullWidth?: boolean; // Показывать ли в полную ширину без ChatWindow
}

export function ChatList({ onChatSelect, selectedChatId, fullWidth = false }: ChatListProps) {
  const { colorMode } = useColorMode();
  const { chats, getUnreadCount } = useChatStorage();

  return (
    <Box h="full" display="flex" flexDirection="column">
      {/* Заголовок */}
      <Box p={4} borderBottom="1px solid" borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}>
        <HStack spacing={3} mb={4} justify="space-between">
          <HStack spacing={3}>
            <Box
              w={8}
              h={8}
              borderRadius="md"
              bg={colorMode === 'light' ? '#4a5568' : '#68d391'}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <MessageSquare size={18} color={colorMode === 'light' ? 'white' : 'black'} />
            </Box>
            <Text
              fontSize="xl"
              fontWeight="bold"
              fontFamily="Space Grotesk"
              color={colorMode === 'light' ? '#4a5568' : '#68d391'}
            >
              Чаты
            </Text>
          </HStack>

          {/* Кнопка создания нового чата (только в fullWidth режиме) */}
          {fullWidth && (
            <Button
              size="sm"
              variant="ghost"
              borderRadius="md"
              _hover={{ bg: colorMode === 'dark' ? 'gray.700' : 'gray.100' }}
            >
              <Plus size={18} />
            </Button>
          )}
        </HStack>

        {/* Поиск */}
        <InputGroup>
          <InputLeftElement>
            <Search size={16} color="gray" />
          </InputLeftElement>
          <Input
            placeholder="Поиск чатов..."
            bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}
            border="none"
            _focus={{
              bg: colorMode === 'dark' ? 'gray.600' : 'white',
              boxShadow: '0 0 0 1px rgba(0, 240, 255, 0.5)',
            }}
          />
        </InputGroup>

        {/* Вкладки фильтрации (только в режиме fullWidth) */}
        {fullWidth && (
          <HStack spacing={0} mt={4}>
            <Button
              variant="ghost"
              size="sm"
              borderRadius="none"
              borderBottom="2px solid"
              borderColor="primary.400"
              color="primary.400"
              _hover={{ bg: 'transparent' }}
              fontWeight="semibold"
            >
              All Chats (1)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              borderRadius="none"
              color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
              _hover={{ bg: 'transparent', color: 'primary.400' }}
            >
              Unread (1)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              borderRadius="none"
              color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
              _hover={{ bg: 'transparent', color: 'primary.400' }}
            >
              Channels
            </Button>
          </HStack>
        )}
      </Box>

      {/* Список чатов */}
      <Box flex={1} overflowY="auto">
        <VStack spacing={0} align="stretch">
          {chats.map((chat: Chat, index: number) => (
            <MotionBox
              key={chat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Box
                p={4}
                cursor="pointer"
                bg={selectedChatId === chat.id 
                  ? (colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50') 
                  : 'transparent'
                }
                _hover={{
                  bg: colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50',
                }}
                transition="all 0.2s"
                onClick={() => onChatSelect?.(chat.id)}
                borderLeft={selectedChatId === chat.id ? '3px solid' : '3px solid transparent'}
                borderLeftColor={selectedChatId === chat.id ? 'primary.500' : 'transparent'}
              >
                <HStack spacing={3} align="flex-start">
                  <Box position="relative">
                    <Avatar 
                      size="md" 
                      name={chat.user.name}
                      src={chat.user.avatar}
                    />
                    {chat.user.isOnline && (
                      <Box
                        position="absolute"
                        bottom={0}
                        right={0}
                        w={3}
                        h={3}
                        bg="green.400"
                        borderRadius="full"
                        border="2px solid"
                        borderColor={colorMode === 'dark' ? 'gray.800' : 'white'}
                      />
                    )}
                  </Box>

                  <VStack align="stretch" spacing={1} flex={1} minW={0}>
                    <HStack justify="space-between" align="center">
                      <Text 
                        fontWeight="semibold" 
                        fontSize="sm"
                        isTruncated
                        flex={1}
                      >
                        {chat.user.name}
                      </Text>
                      <HStack spacing={2}>
                        <Text fontSize="xs" color="gray.500">
                          {chat.messages[chat.messages.length - 1]?.timestamp || ''}
                        </Text>
                        {getUnreadCount(chat.id) > 0 && (
                          <Badge
                            colorScheme="cyan"
                            borderRadius="full"
                            minW={5}
                            h={5}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text fontSize="xs" fontWeight="bold">
                              {getUnreadCount(chat.id)}
                            </Text>
                          </Badge>
                        )}
                      </HStack>
                    </HStack>

                    <Text fontSize="xs" color="gray.500" mb={1}>
                      {chat.user.username}
                    </Text>

                    <Text
                      fontSize="sm"
                      color="gray.600"
                      isTruncated
                      fontWeight={getUnreadCount(chat.id) > 0 ? 'medium' : 'normal'}
                    >
                      {chat.messages[chat.messages.length - 1]?.content || 'Нет сообщений'}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
              <Divider />
            </MotionBox>
          ))}
        </VStack>
      </Box>

      {/* Кнопка создать новый чат */}
      <Box p={4} borderTop="1px solid" borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}>
        <Button
          leftIcon={<Plus size={16} />}
          width="full"
          variant="outline"
          colorScheme="cyan"
          _hover={{
            bg: 'primary.50',
            borderColor: 'primary.500',
          }}
        >
          Новый чат
        </Button>
      </Box>
    </Box>
  );
}