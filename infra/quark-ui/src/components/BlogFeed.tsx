'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  Card,
  CardBody,
  CardHeader,
  useColorMode,
  useColorModeValue,
  Badge,
  IconButton,
  Input,
  Textarea,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, MessageCircle, Heart, Share2, BookOpen, ArrowLeft, Edit3, Plus } from 'lucide-react';
import { useState } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { BlogComments } from './BlogComments';
import { TiptapEditor } from './TiptapEditor';
import { useBlogStorage, BlogPost } from '../hooks/useBlogStorage';

const MotionCard = motion.create(Card);
const MotionBox = motion.create(Box);

// Типы состояний блога
type BlogViewState = 'feed' | 'post' | 'editor';





interface BlogFeedProps {
  onPostClick?: (postId: string) => void;
  onChatClick?: () => void; // для мобильной навигации
}

export function BlogFeed({ onPostClick, onChatClick }: BlogFeedProps) {
  const { colorMode } = useColorMode();
  
  // Цвета для темы - все хуки должны быть в начале компонента
  const iconBg = useColorModeValue('#4a5568', '#68d391');
  const iconColor = useColorModeValue('white', 'black');
  const titleColor = useColorModeValue('#4a5568', '#68d391');
  
  const [viewState, setViewState] = useState<BlogViewState>('feed');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  
  // Состояние редактора - все хуки должны быть объявлены до условных возвратов
  const [editorData, setEditorData] = useState({
    title: '',
    preview: '',
    content: '',
    tags: [] as string[],
  });
  const [editorErrors, setEditorErrors] = useState<string[]>([]);
  
  // Используем хук для работы с данными
  const {
    posts,
    loading,
    createPost,
    updatePost,
    deletePost,
    togglePostLike,
    getPostComments,
    addComment,
    editComment,
    deleteComment,
    toggleCommentLike,
    validatePost,
  } = useBlogStorage();
  
  // Функции навигации
  const openPost = (postId: string) => {
    setSelectedPostId(postId);
    setViewState('post');
    onPostClick?.(postId);
  };
  

  
  const backToFeed = () => {
    setViewState('feed');
    setSelectedPostId(null);
  };
  
  // Получаем выбранный пост
  const selectedPost = selectedPostId 
    ? posts.find(post => post.id === selectedPostId)
    : null;
    
  // Если данные загружаются, показываем индикатор
  if (loading) {
    return (
      <Box p={6} h="full" display="flex" alignItems="center" justifyContent="center">
        <Text>Загрузка...</Text>
      </Box>
    );
  }

  // Рендер списка постов
  const renderFeedView = () => (
    <MotionBox
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      h="full"
    >
      <VStack spacing={4} align="stretch" h="full">
        {/* Заголовок */}
        <HStack justify="space-between" mb={4}>
          <HStack spacing={3}>
            <Box
              w={8}
              h={8}
              borderRadius="md"
              bg={iconBg}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <BookOpen size={18} color={iconColor} />
            </Box>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              fontFamily="Space Grotesk"
              color={titleColor}
            >
              Лента блогов
            </Text>
          </HStack>
          <HStack spacing={2}>
            {onChatClick && (
              <Button
                leftIcon={<MessageCircle />}
                size="sm"
                colorScheme="blue"
                variant="solid"
                onClick={onChatClick}
                borderRadius="full"
              >
                Чат
              </Button>
            )}
            <IconButton
              aria-label="Создать пост"
              icon={<Plus />}
              variant="outline"
              size="sm"
              onClick={openEditorForNew}
            />
            <Badge colorScheme="cyan" variant="subtle">
              {posts.length} постов
            </Badge>
          </HStack>
        </HStack>

        {/* Посты */}
        <VStack spacing={4} flex={1} overflowY="auto">
          {posts.map((post, index) => (
            <MotionCard
              key={post.id}
              cursor="pointer"
              onClick={() => openPost(post.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                y: -4,
                transition: { duration: 0.2 }
              }}
              bg={colorMode === 'dark' ? 'gray.800' : 'white'}
              borderWidth="1px"
              borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
              shadow="lg"
              _hover={{
                shadow: 'xl',
                borderColor: colorMode === 'dark' ? 'primary.500' : 'primary.400',
              }}
              w="full"
            >
              <CardHeader pb={2}>
                <HStack justify="space-between">
                  <HStack spacing={3}>
                    <Avatar 
                      size="sm" 
                      name={post.author.name}
                      src={post.author.avatar}
                    />
                    <Box>
                      <Text fontSize="sm" fontWeight="medium">
                        {post.author.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {post.author.username} • {post.date}
                      </Text>
                    </Box>
                  </HStack>
                  <HStack spacing={2}>
                    <HStack spacing={1}>
                      <Eye size={14} color="gray" />
                      <Text fontSize="xs" color="gray.500">
                        {post.readTime}
                      </Text>
                    </HStack>
                  </HStack>
                </HStack>
              </CardHeader>

              <CardBody pt={0}>
                <VStack align="stretch" spacing={3}>
                  <Box>
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      mb={2}
                      fontFamily="Space Grotesk"
                      lineHeight="shorter"
                    >
                      {post.title}
                    </Text>
                    <Text
                      fontSize="md"
                      color="gray.600"
                      lineHeight="base"
                      noOfLines={3}
                      _dark={{ color: 'gray.400' }}
                    >
                      {post.preview}
                    </Text>
                  </Box>

                  {/* Теги */}
                  {post.tags && post.tags.length > 0 && (
                    <HStack spacing={2} flexWrap="wrap">
                      {post.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Text
                          key={tagIndex}
                          fontSize="xs"
                          px={2}
                          py={1}
                          bg="blue.100"
                          color="blue.700"
                          borderRadius="full"
                          _dark={{
                            bg: 'blue.800',
                            color: 'blue.200'
                          }}
                        >
                          #{tag}
                        </Text>
                      ))}
                      {post.tags.length > 3 && (
                        <Text fontSize="xs" color="gray.500">
                          +{post.tags.length - 3}
                        </Text>
                      )}
                    </HStack>
                  )}

                  <HStack justify="space-between" align="center" pt={2}>
                    <HStack spacing={4}>
                      <HStack spacing={1}>
                        <IconButton
                          aria-label="Like"
                          icon={<Heart size={16} fill={post.isLiked ? '#ff6b6b' : 'none'} />}
                          variant="ghost"
                          size="sm"
                          color={post.isLiked ? 'red.400' : 'gray.500'}
                          _hover={{ color: 'red.400' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePostLike(post.id);
                          }}
                        />
                        <Text fontSize="sm" color="gray.500">
                          {post.likes}
                        </Text>
                      </HStack>
                      
                      <HStack spacing={1}>
                        <IconButton
                          aria-label="Comments"
                          icon={<MessageCircle size={16} />}
                          variant="ghost"
                          size="sm"
                          color="gray.500"
                          _hover={{ color: 'primary.500' }}
                        />
                        <Text fontSize="sm" color="gray.500">
                          {post.comments}
                        </Text>
                      </HStack>
                    </HStack>

                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="cyan"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPost(post.id);
                      }}
                    >
                      Читать
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </MotionCard>
          ))}

          {/* Кнопка загрузить еще */}
          <Button
            variant="ghost"
            size="lg"
            color="gray.500"
            _hover={{ 
              bg: colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50',
              color: 'primary.500'
            }}
          >
            Загрузить еще посты
          </Button>
        </VStack>
      </VStack>
    </MotionBox>
  );

  // Рендер детального просмотра поста
  const renderPostView = () => {
    if (!selectedPost) return null;
    
    return (
      <MotionBox
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
        h="full"
      >
        <VStack spacing={6} h="full" align="stretch">
          {/* Навигация */}
          <HStack justify="space-between" align="center">
            <IconButton
              aria-label="Назад к блогу"
              icon={<ArrowLeft />}
              variant="outline"
              size="sm"
              onClick={backToFeed}
            />
            <HStack spacing={2}>
              <IconButton
                aria-label="Редактировать"
                icon={<Edit3 />}
                variant="outline"
                size="sm"
                onClick={openEditorForEdit}
              />
            </HStack>
          </HStack>
          
          <VStack spacing={6} align="stretch" flex={1} overflowY="auto">
            {/* Заголовок поста */}
            <Box>
              <Text
                fontSize="3xl"
                fontWeight="bold"
                fontFamily="Space Grotesk"
                lineHeight="shorter"
                mb={4}
              >
                {selectedPost.title}
              </Text>
              
              <HStack spacing={4} mb={4}>
                <HStack spacing={3}>
                  <Avatar size="md" name={selectedPost.author.name} />
                  <Box>
                    <Text fontSize="md" fontWeight="medium">
                      {selectedPost.author.name}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {selectedPost.author.username} • {selectedPost.date} • {selectedPost.readTime}
                    </Text>
                  </Box>
                </HStack>
              </HStack>
              
              {/* Теги */}
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <HStack spacing={2} flexWrap="wrap" mb={6}>
                  {selectedPost.tags.map((tag, index) => (
                    <Text
                      key={index}
                      fontSize="sm"
                      px={3}
                      py={1}
                      bg="blue.100"
                      color="blue.700"
                      borderRadius="full"
                      _dark={{
                        bg: 'blue.800',
                        color: 'blue.200'
                      }}
                    >
                      #{tag}
                    </Text>
                  ))}
                </HStack>
              )}
            </Box>
            
            {/* Контент поста */}
            <Box
              bg={colorMode === 'dark' ? 'gray.800' : 'white'}
              borderRadius="16px"
              p={8}
              borderWidth="1px"
              borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
              shadow="lg"
              flex={1}
            >
              <MarkdownRenderer>
                {selectedPost.content || selectedPost.preview}
              </MarkdownRenderer>
            </Box>
            
            {/* Действия с постом */}
            <HStack justify="space-between" align="center" py={4}>
              <HStack spacing={4}>
                <HStack spacing={2} cursor="pointer">
                  <IconButton
                    aria-label="Like"
                    icon={<Heart size={20} fill={selectedPost.isLiked ? '#ff6b6b' : 'none'} />}
                    variant="ghost"
                    size="md"
                    color={selectedPost.isLiked ? 'red.400' : 'gray.500'}
                    _hover={{ color: 'red.400' }}
                    onClick={() => togglePostLike(selectedPost.id)}
                  />
                  <Text fontSize="md">{selectedPost.likes}</Text>
                </HStack>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Comments"
                    icon={<MessageCircle size={20} />}
                    variant="ghost"
                    size="md"
                    color="gray.500"
                    _hover={{ color: 'primary.500' }}
                  />
                  <Text fontSize="md">{selectedPost.comments}</Text>
                </HStack>
              </HStack>
              <HStack spacing={2}>
                <IconButton
                  aria-label="Share"
                  icon={<Share2 size={20} />}
                  variant="outline"
                  size="md"
                />
                <Button size="md" colorScheme="cyan" onClick={openEditorForEdit}>
                  Редактировать
                </Button>
              </HStack>
            </HStack>
            
            {/* Комментарии */}
            <Box
              bg={colorMode === 'dark' ? 'gray.800' : 'white'}
              borderRadius="16px"
              p={6}
              borderWidth="1px"
              borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
              shadow="lg"
            >
              <BlogComments 
                postId={selectedPost.id}
                comments={getPostComments(selectedPost.id)}
                onAddComment={(content, parentId) => {
                  addComment(selectedPost.id, content, parentId);
                }}
                onEditComment={editComment}
                onDeleteComment={deleteComment}
                onLikeComment={toggleCommentLike}
              />
            </Box>
          </VStack>
        </VStack>
      </MotionBox>
    );
  };

  // Инициализация редактора при редактировании поста
  const initializeEditor = (post?: BlogPost) => {
    if (post) {
      setEditorData({
        title: post.title,
        preview: post.preview,
        content: post.content || '',
        tags: post.tags || [],
      });
    } else {
      setEditorData({
        title: '',
        preview: '',
        content: '',
        tags: [],
      });
    }
    setEditorErrors([]);
  };

  // Открыть редактор для создания поста
  const openEditorForNew = () => {
    setSelectedPostId(null);
    initializeEditor();
    setViewState('editor');
  };

  // Открыть редактор для редактирования поста
  const openEditorForEdit = () => {
    if (selectedPost) {
      initializeEditor(selectedPost);
      setViewState('editor');
    }
  };

  // Сохранение поста
  const handleSavePost = () => {
    const validation = validatePost(editorData);
    
    if (!validation.isValid) {
      setEditorErrors(validation.errors);
      return;
    }

    try {
      if (selectedPostId) {
        // Редактирование существующего поста
        updatePost(selectedPostId, {
          title: editorData.title,
          preview: editorData.preview,
          content: editorData.content,
          tags: editorData.tags,
          isPublished: true,
        });
      } else {
        // Создание нового поста
        const newPost = createPost({
          title: editorData.title,
          preview: editorData.preview,
          content: editorData.content,
          tags: editorData.tags,
          isPublished: true,
          author: {
            name: 'Вы',
            avatar: '',
            username: '@you',
          },
        });
        setSelectedPostId(newPost.id);
      }
      
      setEditorErrors([]);
      backToFeed();
    } catch (error) {
      setEditorErrors(['Ошибка при сохранении поста']);
    }
  };



  // Рендер редактора
  const renderEditorView = () => (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      h="full"
    >
      <VStack spacing={6} h="full" align="stretch">
        {/* Навигация редактора */}
        <HStack justify="space-between" align="center">
          <IconButton
            aria-label="Назад"
            icon={<ArrowLeft />}
            variant="outline"
            size="sm"
            onClick={backToFeed}
          />
          <Text fontSize="xl" fontWeight="bold" fontFamily="Space Grotesk">
            {selectedPostId ? 'Редактирование поста' : 'Создание поста'}
          </Text>
          <HStack spacing={2}>
            <Button size="sm" variant="outline">
              Предпросмотр
            </Button>
            <Button 
              size="sm" 
              colorScheme="cyan"
              onClick={handleSavePost}
              isDisabled={!editorData.title.trim() || !editorData.content.trim()}
            >
              {selectedPostId ? 'Обновить' : 'Опубликовать'}
            </Button>
          </HStack>
        </HStack>
        
        <VStack spacing={4} flex={1} align="stretch">
          {/* Ошибки валидации */}
          {editorErrors.length > 0 && (
            <Box
              bg="red.50"
              borderColor="red.200"
              borderWidth="1px"
              borderRadius="8px"
              p={3}
              _dark={{ bg: 'red.900', borderColor: 'red.700' }}
            >
              {editorErrors.map((error, index) => (
                <Text key={index} color="red.600" fontSize="sm" _dark={{ color: 'red.300' }}>
                  • {error}
                </Text>
              ))}
            </Box>
          )}
          
          {/* Поля ввода */}
          <VStack spacing={4}>
            <Box w="full">
              <Text mb={2} fontSize="sm" fontWeight="medium">Заголовок</Text>
              <Input
                value={editorData.title}
                onChange={(e) => setEditorData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Введите заголовок поста..."
                size="lg"
                borderRadius="12px"
              />
            </Box>
            
            <Box w="full">
              <Text mb={2} fontSize="sm" fontWeight="medium">Краткое описание</Text>
              <Textarea
                value={editorData.preview}
                onChange={(e) => setEditorData(prev => ({ ...prev, preview: e.target.value }))}
                placeholder="Краткое описание для превью..."
                rows={3}
                borderRadius="12px"
                resize="vertical"
              />
            </Box>
          </VStack>
          
          {/* WYSIWYG редактор контента */}
          <Box flex={1}>
            <Text mb={3} fontSize="sm" fontWeight="medium">Содержание</Text>
            <TiptapEditor
              value={editorData.content}
              onChange={(content: string) => setEditorData(prev => ({ ...prev, content }))}
              placeholder="Начните писать ваш пост здесь..."
              height="350px"
            />
          </Box>
        </VStack>
      </VStack>
    </MotionBox>
  );

  return (
    <Box p={6} h="full" overflow="hidden">
      <AnimatePresence mode="wait">
        {viewState === 'feed' && renderFeedView()}
        {viewState === 'post' && renderPostView()}
        {viewState === 'editor' && renderEditorView()}
      </AnimatePresence>
    </Box>
  );
}