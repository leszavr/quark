'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  useColorMode,
  Textarea,
  Button,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Video, MoreVertical, Paperclip, Send, Smile, Mic, Check, CheckCheck } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { EmojiPicker } from './EmojiPicker';
import { FileUploader } from './FileUploader';
import { MessageAttachments } from './MessageAttachments';
import { useState, useRef, useEffect } from 'react';
import { useChatStorage } from '../hooks/useChatStorage';
import type { Message, Chat, ChatUser, MessageAttachment } from '../hooks/useChatStorage';

const MotionBox = motion.create(Box);

// Компонент для рендеринга сообщений с поддержкой Markdown (пасхалка!)
interface MessageContentProps {
  content: string;
}

function MessageContent({ content }: MessageContentProps) {
  const { colorMode } = useColorMode();
  
  // Проверяем, содержит ли сообщение Markdown синтаксис
  const hasMarkdown = /(\*\*.*\*\*|\*.*\*|`.*`|#+ |^\s*[\-\*\+]\s+|^\s*\d+\.\s+|\[.*\]\(.*\)|```[\s\S]*```)/gm.test(content);
  
  if (hasMarkdown) {
    // Если есть Markdown - рендерим через MarkdownRenderer
    return (
      <Box 
        sx={{
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            fontSize: 'sm',
            fontWeight: 'bold',
            margin: '0.25rem 0',
          },
          '& p': {
            margin: '0.25rem 0',
            fontSize: 'sm',
          },
          '& ul, & ol': {
            margin: '0.25rem 0',
            paddingLeft: '1rem',
          },
          '& li': {
            fontSize: 'sm',
            margin: '0.1rem 0',
          },
          '& code': {
            fontSize: 'xs',
            padding: '0.1rem 0.25rem',
            borderRadius: '0.25rem',
            backgroundColor: colorMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          },
          '& pre': {
            fontSize: 'xs',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            margin: '0.5rem 0',
            backgroundColor: colorMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          },
          '& blockquote': {
            borderLeft: '3px solid',
            borderColor: 'primary.400',
            paddingLeft: '0.5rem',
            margin: '0.5rem 0',
            fontStyle: 'italic',
          }
        }}
      >
        <MarkdownRenderer>{content}</MarkdownRenderer>
      </Box>
    );
  }
  
  // Обычное текстовое сообщение
  return <Text fontSize="sm">{content}</Text>;
}

// Типы импортированы из useChatStorage

// Моковые данные теперь в useChatStorage

interface ChatWindowProps {
  chatId?: string;
  onClose?: () => void;
  showBackButton?: boolean; // показывать ли кнопку назад (для мобильного режима)
  onBack?: () => void; // функция возврата к списку чатов
}

export function ChatWindow({ chatId = 'chat-1', onClose, showBackButton = false, onBack }: ChatWindowProps) {
  const { colorMode } = useColorMode();
  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<MessageAttachment[]>([]);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const { 
    chats, 
    sendMessage, 
    markMessagesAsRead, 
    getChatById 
  } = useChatStorage();
  
  // Получаем текущий чат
  const currentChat = getChatById(chatId);
  const messages = currentChat?.messages || [];
  const user = currentChat?.user;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Отмечаем сообщения как прочитанные при открытии чата
  useEffect(() => {
    if (currentChat) {
      markMessagesAsRead(chatId);
    }
  }, [chatId, markMessagesAsRead]);

  const handleSend = () => {
    if (message.trim() || attachedFiles.length > 0) {
      sendMessage(chatId, message, attachedFiles);
      setMessage('');
      setAttachedFiles([]);
      setShowFileUploader(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const newMessage = message + emoji;
    setMessage(newMessage);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFilesChange = (files: any[]) => {
    // Конвертируем FileAttachment в MessageAttachment
    const messageAttachments: MessageAttachment[] = files.map(file => ({
      id: file.id,
      name: file.file.name,
      size: file.file.size,
      type: file.type,
      mimeType: file.file.type,
      preview: file.preview,
      url: file.preview || URL.createObjectURL(file.file),
    }));
    setAttachedFiles(messageAttachments);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Автоматическое изменение высоты textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Статус сообщений теперь определяется через isRead в Message

  return (
    <Box h="full" display="flex" flexDirection="column">
      {/* Шапка чата */}
      <Box
        p={4}
        borderBottom="1px solid"
        borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
        bg={colorMode === 'dark' ? 'gray.800' : 'white'}
      >
        <HStack justify="space-between">
          <HStack spacing={3}>
            {/* Кнопка назад (только в мобильном режиме) */}
            {showBackButton && (
              <IconButton
                aria-label="Назад к списку чатов"
                icon={<ArrowLeft size={18} />}
                size="sm"
                variant="ghost"
                onClick={onBack}
                _hover={{ bg: colorMode === 'dark' ? 'gray.700' : 'gray.100' }}
              />
            )}
            <Box position="relative">
              <Avatar 
                size="sm" 
                name={user?.name || 'Пользователь'}
                src={user?.avatar}
              />
              {user?.isOnline && (
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
            <Box>
              <Text fontWeight="semibold" fontSize="sm">
                {user?.name || 'Пользователь'}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {user?.isOnline ? 'онлайн' : user?.lastSeen || 'не в сети'}
              </Text>
            </Box>
          </HStack>

          <HStack spacing={1}>
            <IconButton
              aria-label="Voice call"
              icon={<Phone size={16} />}
              variant="ghost"
              size="sm"
              color="gray.500"
              _hover={{ color: 'primary.500' }}
            />
            <IconButton
              aria-label="Video call"
              icon={<Video size={16} />}
              variant="ghost"
              size="sm"
              color="gray.500"
              _hover={{ color: 'primary.500' }}
            />
            <IconButton
              aria-label="More options"
              icon={<MoreVertical size={16} />}
              variant="ghost"
              size="sm"
              color="gray.500"
              _hover={{ color: 'primary.500' }}
            />
          </HStack>
        </HStack>
      </Box>

      {/* Сообщения */}
      <Box flex={1} overflowY="auto" p={4}>
        <VStack spacing={3} align="stretch">
          {messages.map((msg: Message, index: number) => (
            <MotionBox
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              alignSelf={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
              maxW="70%"
            >
              <Box
                bg={msg.sender === 'user' 
                  ? (colorMode === 'dark' ? 'primary.600' : 'primary.500')
                  : (colorMode === 'dark' ? 'gray.700' : 'gray.100')
                }
                color={msg.sender === 'user' ? 'white' : 'inherit'}
                p={3}
                borderRadius="xl"
                borderBottomRightRadius={msg.sender === 'user' ? 'md' : 'xl'}
                borderBottomLeftRadius={msg.sender === 'other' ? 'md' : 'xl'}
                position="relative"
              >
                <Box fontSize="sm" mb={1}>
                  <MessageContent content={msg.content} />
                </Box>
                
                {/* Отображение вложений */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <MessageAttachments 
                    attachments={msg.attachments} 
                    isOwn={msg.sender === 'user'}
                  />
                )}
                
                <HStack justify="flex-end" spacing={1} mt={1}>
                  <Text fontSize="xs" opacity={0.7}>
                    {msg.timestamp}
                  </Text>
                  {msg.sender === 'user' && (
                    <Icon
                      as={msg.isRead ? CheckCheck : Check}
                      boxSize={3}
                      opacity={0.7}
                      color={msg.isRead ? 'cyan.300' : 'gray.300'}
                    />
                  )}
                </HStack>
              </Box>
            </MotionBox>
          ))}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      {/* Поле ввода */}
      <Box
        p={4}
        borderTop="1px solid"
        borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
        bg={colorMode === 'dark' ? 'gray.800' : 'white'}
      >
        {/* Область загрузки файлов */}
        {showFileUploader && (
          <Box mb={4}>
            <FileUploader onFilesChange={handleFilesChange} />
          </Box>
        )}

        <HStack spacing={2} align="flex-end">
          <IconButton
            aria-label="Прикрепить файл"
            icon={<Paperclip size={18} />}
            variant="ghost"
            size="sm"
            color={showFileUploader ? 'primary.500' : 'gray.500'}
            _hover={{ color: 'primary.500' }}
            onClick={() => setShowFileUploader(!showFileUploader)}
          />

          <Box flex={1}>
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Введите сообщение..."
              resize="none"
              rows={1}
              minH="40px"
              maxH="120px"
              bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}
              border="1px solid"
              borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
              borderRadius="xl"
              _focus={{
                borderColor: 'primary.500',
                boxShadow: '0 0 0 1px rgba(0, 240, 255, 0.5)',
              }}
              _placeholder={{
                color: 'gray.500',
              }}
            />
          </Box>

          <EmojiPicker onEmojiSelect={handleEmojiSelect} />

          <IconButton
            aria-label="Voice message"
            icon={<Mic size={18} />}
            variant="ghost"
            size="sm"
            color="gray.500"
            _hover={{ color: 'red.400' }}
          />

          <IconButton
            aria-label="Send message"
            icon={<Send size={18} />}
            colorScheme="cyan"
            size="sm"
            onClick={handleSend}
            isDisabled={!message.trim() && attachedFiles.length === 0}
            bg={(message.trim() || attachedFiles.length > 0) ? (colorMode === 'dark' ? '#00f0ff' : '#1a202c') : undefined}
            color={(message.trim() || attachedFiles.length > 0) ? (colorMode === 'dark' ? 'black' : 'white') : undefined}
            _hover={{
              transform: (message.trim() || attachedFiles.length > 0) ? 'scale(1.05)' : undefined,
            }}
          />
        </HStack>
      </Box>
    </Box>
  );
}