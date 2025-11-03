"use client";
import Image from "next/image";

import { motion, AnimatePresence } from "framer-motion";
import { Eye, MessageCircle, Heart, Share2, BookOpen, ArrowLeft, Edit3, Plus } from "lucide-react";
import { useState } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { BlogComments } from "./BlogComments";
import { TiptapEditor } from "./TiptapEditor";
import { useBlogStorage, BlogPost } from "../hooks/useBlogStorage";

const MotionCard = motion.create("div");
const MotionBox = motion.create("div");

// Типы состояний блога
type BlogViewState = "feed" | "post" | "editor";





interface BlogFeedProps {
  readonly onPostClick?: (postId: string) => void;
  readonly onChatClick?: () => void; // для мобильной навигации
}

export function BlogFeed({ onPostClick, onChatClick }: BlogFeedProps) {
  const [viewState, setViewState] = useState<BlogViewState>("feed");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  
  // Состояние редактора - все хуки должны быть объявлены до условных возвратов
  const [editorData, setEditorData] = useState({
    title: "",
    preview: "",
    content: "",
    tags: [] as string[],
  });
  const [editorErrors, setEditorErrors] = useState<string[]>([]);
  
  // Используем хук для работы с данными
  const {
    posts,
    loading,
    createPost,
    updatePost,
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
    setViewState("post");
    onPostClick?.(postId);
  };
  

  
  const backToFeed = () => {
    setViewState("feed");
    setSelectedPostId(null);
  };
  
  // Получаем выбранный пост
  const selectedPost = selectedPostId 
    ? posts.find(post => post.id === selectedPostId)
    : null;
    
  // Если данные загружаются, показываем индикатор
  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <span>Загрузка...</span>
      </div>
    );
  }

  // Рендер списка постов
  const renderFeedView = () => (
    <MotionBox
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <div className="flex flex-col gap-4 items-stretch h-full">
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gray-600 dark:bg-green-400 rounded-md flex items-center justify-center">
              <BookOpen size={18} className="text-white dark:text-black" />
            </div>
            <span className="text-2xl font-bold font-space-grotesk text-gray-600 dark:text-green-400">
              Лента блогов
            </span>
          </div>
          <div className="flex gap-2">
            {onChatClick && (
              <button
                className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-full"
                onClick={onChatClick}
              >
                <MessageCircle size={16} />
                Чат
              </button>
            )}
            <button
              className="p-2 border rounded"
              onClick={openEditorForNew}
              aria-label="Создать пост"
            >
              <Plus size={16} />
            </button>
            <span className="px-2 py-1 text-xs bg-cyan-100 text-cyan-700 rounded-full dark:bg-cyan-800 dark:text-cyan-200">
              {posts.length} постов
            </span>
          </div>
        </div>

        {/* Посты */}
        <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
          {posts.map((post, index) => (
            <MotionCard
              key={post.id}
              className="cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 rounded-lg w-full"
              onClick={() => openPost(post.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                y: -4,
                transition: { duration: 0.2 }
              }}
            >
              <div className="p-4 pb-2">
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <Image
                        fill
                        className="rounded-full object-cover"
                        src={post.author.avatar}
                        alt={post.author.name}
                        sizes="32px"
                      />
                    </div>
                    <div>
                      <span className="text-sm font-medium">
                        {post.author.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {post.author.username} • {post.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Eye size={14} className="text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="flex flex-col gap-3">
                  <div>
                    <span className="text-lg font-bold mb-2 block font-space-grotesk leading-tight">
                      {post.title}
                    </span>
                    <span className="text-md text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                      {post.preview}
                    </span>
                  </div>

                  {/* Теги */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full dark:bg-blue-800 dark:text-blue-200"
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-4">
                      <div className="flex gap-1 items-center">
                        <button
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePostLike(post.id);
                          }}
                          aria-label="Like"
                        >
                          <Heart size={16} fill={post.isLiked ? "#ff6b6b" : "none"} className={post.isLiked ? "text-red-400" : "text-gray-500"} />
                        </button>
                        <span className="text-sm text-gray-500">
                          {post.likes}
                        </span>
                      </div>
                      
                      <div className="flex gap-1 items-center">
                        <MessageCircle size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {post.comments}
                        </span>
                      </div>
                    </div>

                    <button
                      className="px-3 py-1 text-sm border border-cyan-500 text-cyan-700 rounded hover:bg-cyan-50 dark:hover:bg-cyan-900 dark:text-cyan-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPost(post.id);
                      }}
                    >
                      Читать
                    </button>
                  </div>
                </div>
              </div>
            </MotionCard>
          ))}

          {/* Кнопка загрузить еще */}
          <button
            className="px-4 py-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-cyan-500 transition-colors rounded-lg"
          >
            Загрузить еще посты
          </button>
        </div>
      </div>
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
        className="h-full"
      >
        <div className="flex flex-col gap-6 h-full">
          {/* Навигация */}
          <div className="flex justify-between items-center">
            <button
              className="p-2 border rounded"
              onClick={backToFeed}
              aria-label="Назад к блогу"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex gap-2">
              <button
                className="p-2 border rounded"
                onClick={openEditorForEdit}
                aria-label="Редактировать"
              >
                <Edit3 size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-6 flex-1 overflow-y-auto">
            {/* Заголовок поста */}
            <div>
              <span className="text-3xl font-bold font-space-grotesk leading-tight mb-4 block">
                {selectedPost.title}
              </span>
              
              <div className="flex gap-4 mb-4">
                <div className="flex gap-3">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image 
                      fill 
                      className="rounded-full object-cover" 
                      src={selectedPost.author.avatar} 
                      alt={selectedPost.author.name}
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <span className="text-md font-medium">
                      {selectedPost.author.name}
                    </span>
                    <span className="text-sm text-gray-500 block">
                      {selectedPost.author.username} • {selectedPost.date} • {selectedPost.readTime}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Теги */}
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-6">
                  {selectedPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full dark:bg-blue-800 dark:text-blue-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Контент поста */}
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg flex-1"
            >
              <MarkdownRenderer>
                {selectedPost.content || selectedPost.preview}
              </MarkdownRenderer>
            </div>
            
            {/* Действия с постом */}
            <div className="flex justify-between items-center py-4">
              <div className="flex gap-4">
                <div className="flex gap-2 cursor-pointer">
                  <button
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    onClick={() => togglePostLike(selectedPost.id)}
                    aria-label="Like"
                  >
                    <Heart size={20} fill={selectedPost.isLiked ? "#ff6b6b" : "none"} className={selectedPost.isLiked ? "text-red-400" : "text-gray-500"} />
                  </button>
                  <span className="text-md">{selectedPost.likes}</span>
                </div>
                <div className="flex gap-2">
                  <MessageCircle size={20} className="text-gray-500" />
                  <span className="text-md">{selectedPost.comments}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="p-2 border rounded"
                  aria-label="Share"
                >
                  <Share2 size={20} />
                </button>
                <button className="px-4 py-2 bg-cyan-500 text-white rounded" onClick={openEditorForEdit}>
                  Редактировать
                </button>
              </div>
            </div>
            
            {/* Комментарии */}
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
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
            </div>
          </div>
        </div>
      </MotionBox>
    );
  };

  // Инициализация редактора при редактировании поста
  const initializeEditor = (post?: BlogPost) => {
    if (post) {
      setEditorData({
        title: post.title,
        preview: post.preview,
        content: post.content || "",
        tags: post.tags || [],
      });
    } else {
      setEditorData({
        title: "",
        preview: "",
        content: "",
        tags: [],
      });
    }
    setEditorErrors([]);
  };

  // Открыть редактор для создания поста
  const openEditorForNew = () => {
    setSelectedPostId(null);
    initializeEditor();
    setViewState("editor");
  };

  // Открыть редактор для редактирования поста
  const openEditorForEdit = () => {
    if (selectedPost) {
      initializeEditor(selectedPost);
      setViewState("editor");
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
            name: "Вы",
            avatar: "",
            username: "@you",
          },
        });
        setSelectedPostId(newPost.id);
      }
      
      setEditorErrors([]);
      backToFeed();
    } catch (error) {
      console.error("Failed to save blog post:", error);
      setEditorErrors(["Ошибка при сохранении поста"]);
    }
  };



  // Рендер редактора
  const renderEditorView = () => (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <div className="flex flex-col gap-6 h-full">
        {/* Навигация редактора */}
        <div className="flex justify-between items-center">
          <button
            className="p-2 border rounded"
            onClick={backToFeed}
            aria-label="Назад"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-xl font-bold font-space-grotesk">
            {selectedPostId ? "Редактирование поста" : "Создание поста"}
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm border rounded">
              Предпросмотр
            </button>
            <button 
              className="px-3 py-1 text-sm bg-cyan-500 text-white rounded"
              onClick={handleSavePost}
              disabled={!editorData.title.trim() || !editorData.content.trim()}
            >
              {selectedPostId ? "Обновить" : "Опубликовать"}
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 flex-1">
          {/* Ошибки валидации */}
          {editorErrors.length > 0 && (
            <div
              className="bg-red-50 border border-red-200 rounded-lg p-3 dark:bg-red-900 dark:border-red-700"
            >
              {editorErrors.map((error) => (
                <span key={error} className="text-red-600 text-sm block dark:text-red-300">
                  • {error}
                </span>
              ))}
            </div>
          )}
          
          {/* Поля ввода */}
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <span className="mb-2 block text-sm font-medium">Заголовок</span>
              <input
                value={editorData.title}
                onChange={(e) => setEditorData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Введите заголовок поста..."
                className="w-full px-4 py-3 text-lg border rounded-xl"
              />
            </div>
            
            <div className="w-full">
              <span className="mb-2 block text-sm font-medium">Краткое описание</span>
              <textarea
                value={editorData.preview}
                onChange={(e) => setEditorData(prev => ({ ...prev, preview: e.target.value }))}
                placeholder="Краткое описание для превью..."
                rows={3}
                className="w-full px-4 py-2 border rounded-xl resize-vertical"
              />
            </div>
          </div>
          
          {/* WYSIWYG редактор контента */}
          <div className="flex-1">
            <span className="mb-3 block text-sm font-medium">Содержание</span>
            <TiptapEditor
              value={editorData.content}
              onChange={(content: string) => setEditorData(prev => ({ ...prev, content }))}
              placeholder="Начните писать ваш пост здесь..."
              height="350px"
            />
          </div>
        </div>
      </div>
    </MotionBox>
  );

  return (
    <div className="p-6 h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {viewState === "feed" && renderFeedView()}
        {viewState === "post" && renderPostView()}
        {viewState === "editor" && renderEditorView()}
      </AnimatePresence>
    </div>
  );
}