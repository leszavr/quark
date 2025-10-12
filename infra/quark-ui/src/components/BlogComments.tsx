'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  Textarea,
  IconButton,
  useColorMode,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Heart, Reply, MoreHorizontal, Edit, Trash2, Send } from 'lucide-react';
import { useState, useRef } from 'react';

const MotionBox = motion.create(Box);

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  date: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

interface BlogCommentsProps {
  postId: string;
  comments: Comment[];
  onAddComment?: (content: string, parentId?: string) => void;
  onEditComment?: (commentId: string, content: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onLikeComment?: (commentId: string) => void;
}

// Mock данные комментариев
const mockComments: Comment[] = [
  {
    id: '1',
    content: 'Отличная статья! Особенно интересно про AI-ассистенты для кода. Уже пробовал GitHub Copilot и действительно впечатляет.',
    author: {
      name: 'Дмитрий Иванов',
      avatar: '',
      username: '@dmitry_dev',
    },
    date: '2 часа назад',
    likes: 5,
    isLiked: true,
    replies: [
      {
        id: '1-1',
        content: 'Согласен! А что думаешь про Cursor? Тоже недавно попробовал, кажется еще более умным.',
        author: {
          name: 'Анна Смирнова',
          avatar: '',
          username: '@anna_dev',
        },
        date: '1 час назад',
        likes: 2,
        isLiked: false,
      }
    ]
  },
  {
    id: '2',
    content: 'Хорошая подборка трендов. Но я бы еще добавил упоминание WebAssembly - тоже очень перспективная технология для веба.',
    author: {
      name: 'Сергей Петров',
      avatar: '',
      username: '@sergey_web',
    },
    date: '4 часа назад',
    likes: 3,
    isLiked: false,
  },
  {
    id: '3',
    content: 'Спасибо за статью! Можешь поподробнее рассказать про React Server Components? Пока не до конца понятно, как они работают.',
    author: {
      name: 'Мария Козлова',
      avatar: '',
      username: '@maria_react',
    },
    date: '6 часов назад',
    likes: 1,
    isLiked: false,
  },
];

export function BlogComments({ 
  postId, 
  comments = mockComments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLikeComment 
}: BlogCommentsProps) {
  const { colorMode } = useColorMode();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const cancelRef = useRef(null);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    onAddComment?.(newComment, replyTo || undefined);
    setNewComment('');
    setReplyTo(null);
  };

  const handleEditComment = (commentId: string, content: string) => {
    setEditingComment(commentId);
    setEditingContent(content);
  };

  const handleSaveEdit = () => {
    if (!editingContent.trim() || !editingComment) return;
    onEditComment?.(editingComment, editingContent);
    setEditingComment(null);
    setEditingContent('');
  };

  const handleDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
    onOpen();
  };

  const confirmDelete = () => {
    if (commentToDelete) {
      onDeleteComment?.(commentToDelete);
      setCommentToDelete(null);
    }
    onClose();
  };

  const renderComment = (comment: Comment, isReply = false, parentIndex?: number) => (
    <MotionBox
      key={comment.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: isReply ? 0.1 : 0 }}
      ml={isReply ? 8 : 0}
    >
      <VStack spacing={3} align="stretch">
        <HStack spacing={3} align="start">
          <Avatar size="sm" name={comment.author.name} src={comment.author.avatar} />
          <VStack spacing={2} align="stretch" flex={1}>
            <HStack justify="space-between">
              <VStack spacing={0} align="start">
                <Text fontSize="sm" fontWeight="medium">
                  {comment.author.name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {comment.author.username} • {comment.date}
                </Text>
              </VStack>
              
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<MoreHorizontal size={16} />}
                  variant="ghost"
                  size="xs"
                  color="gray.500"
                />
                <MenuList>
                  <MenuItem 
                    icon={<Edit size={14} />}
                    onClick={() => handleEditComment(comment.id, comment.content)}
                  >
                    Редактировать
                  </MenuItem>
                  <MenuItem 
                    icon={<Trash2 size={14} />} 
                    color="red.500"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    Удалить
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
            
            {editingComment === comment.id ? (
              <VStack spacing={2} align="stretch">
                <Textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  size="sm"
                  borderRadius="8px"
                />
                <HStack spacing={2}>
                  <Button size="xs" colorScheme="blue" onClick={handleSaveEdit}>
                    Сохранить
                  </Button>
                  <Button 
                    size="xs" 
                    variant="ghost" 
                    onClick={() => {
                      setEditingComment(null);
                      setEditingContent('');
                    }}
                  >
                    Отмена
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <>
                <Text fontSize="sm" lineHeight="1.5">
                  {comment.content}
                </Text>
                
                <HStack spacing={4}>
                  <HStack spacing={1}>
                    <IconButton
                      aria-label="Like"
                      icon={<Heart size={14} fill={comment.isLiked ? '#ff6b6b' : 'none'} />}
                      variant="ghost"
                      size="xs"
                      color={comment.isLiked ? 'red.400' : 'gray.500'}
                      _hover={{ color: 'red.400' }}
                      onClick={() => onLikeComment?.(comment.id)}
                    />
                    <Text fontSize="xs" color="gray.500">
                      {comment.likes}
                    </Text>
                  </HStack>
                  
                  {!isReply && (
                    <Button
                      size="xs"
                      variant="ghost"
                      leftIcon={<Reply size={12} />}
                      color="gray.500"
                      _hover={{ color: 'primary.500' }}
                      onClick={() => setReplyTo(comment.id)}
                    >
                      Ответить
                    </Button>
                  )}
                </HStack>
              </>
            )}
          </VStack>
        </HStack>
        
        {/* Форма ответа */}
        {replyTo === comment.id && (
          <MotionBox
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            ml={8}
          >
            <VStack spacing={2} align="stretch">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Написать ответ..."
                size="sm"
                borderRadius="8px"
              />
              <HStack spacing={2}>
                <Button 
                  size="sm" 
                  colorScheme="blue" 
                  leftIcon={<Send size={14} />}
                  onClick={handleSubmitComment}
                  isDisabled={!newComment.trim()}
                >
                  Ответить
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setReplyTo(null);
                    setNewComment('');
                  }}
                >
                  Отмена
                </Button>
              </HStack>
            </VStack>
          </MotionBox>
        )}
        
        {/* Ответы на комментарий */}
        {comment.replies && comment.replies.length > 0 && (
          <VStack spacing={3} align="stretch" mt={2}>
            {comment.replies.map((reply) => renderComment(reply, true))}
          </VStack>
        )}
      </VStack>
    </MotionBox>
  );

  return (
    <>
      <VStack spacing={6} align="stretch">
        {/* Заголовок секции */}
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold" fontFamily="Space Grotesk">
            Комментарии ({comments.length})
          </Text>
        </HStack>
        
        {/* Форма добавления комментария */}
        <Box
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          p={4}
          borderRadius="12px"
          borderWidth="1px"
          borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
        >
          <VStack spacing={3} align="stretch">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Поделитесь своим мнением о посте..."
              rows={3}
              borderRadius="8px"
            />
            <HStack justify="end">
              <Button 
                colorScheme="blue" 
                size="sm"
                leftIcon={<Send size={14} />}
                onClick={handleSubmitComment}
                isDisabled={!newComment.trim()}
              >
                Комментировать
              </Button>
            </HStack>
          </VStack>
        </Box>
        
        <Divider />
        
        {/* Список комментариев */}
        <VStack spacing={6} align="stretch">
          {comments.map((comment, index) => (
            <Box key={comment.id}>
              {renderComment(comment, false, index)}
              {index < comments.length - 1 && <Divider mt={6} />}
            </Box>
          ))}
        </VStack>
      </VStack>
      
      {/* Диалог подтверждения удаления */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Удалить комментарий?
            </AlertDialogHeader>
            <AlertDialogBody>
              Это действие нельзя будет отменить. Комментарий будет удален навсегда.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Отмена
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Удалить
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}