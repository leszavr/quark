'use client';

import { useState, useEffect } from 'react';

export interface BlogPost {
  id: string;
  title: string;
  preview: string;
  content: string;
  tags: string[];
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  date: string;
  readTime: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
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
  parentId?: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  POSTS: 'quark-ui-blog-posts',
  COMMENTS: 'quark-ui-blog-comments',
  DRAFTS: 'quark-ui-blog-drafts',
};

// Дефолтные посты, если localStorage пуст
const defaultPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Будущее веб-разработки: тенденции 2025',
    preview: 'Исследуем новые технологии и подходы, которые формируют будущее веб-разработки. От ИИ-интеграции до новых фреймворков...',
    content: `# Будущее веб-разработки: тенденции 2025

Веб-разработка стремительно развивается, и 2025 год обещает стать поворотным моментом в индустрии. Давайте рассмотрим ключевые тенденции, которые будут формировать будущее.

## 🤖 Интеграция искусственного интеллекта

ИИ становится неотъемлемой частью веб-разработки:

- **AI-ассистенты для кода** - GitHub Copilot, Cursor, и другие инструменты
- **Автоматическая генерация UI** на основе описаний
- **Оптимизация производительности** с помощью ML алгоритмов

## ⚡ Новые фреймворки и инструменты

### React Server Components
Революционный подход к рендерингу:
\`\`\`jsx
// Серверный компонент
async function BlogPost({ id }) {
  const post = await db.post.findUnique({ where: { id } });
  return <Article post={post} />;
}
\`\`\`

### Next.js App Router
Новая архитектура маршрутизации с улучшенной производительностью и developer experience.

## 🎨 Дизайн и UX тренды

- **Neomorphism** - объемные интерфейсы с мягкими тенями
- **Micro-interactions** - детализированная обратная связь
- **Adaptive design** - интерфейсы, адаптирующиеся к контексту использования

## 🔮 Заключение

Будущее веб-разработки светлое и полно возможностей. Главное - оставаться в курсе трендов и не бояться экспериментировать с новыми технологиями.

*Что думаете об этих тенденциях? Поделитесь в комментариях!*`,
    tags: ['веб-разработка', 'тренды', 'ИИ', 'фреймворки'],
    author: {
      name: 'Анна Смирнова',
      avatar: '',
      username: '@anna_dev',
    },
    date: '2 часа назад',
    readTime: '5 мин',
    likes: 24,
    comments: 8,
    isLiked: false,
    isPublished: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Дизайн-системы в современных продуктах',
    preview: 'Как создать масштабируемую дизайн-систему, которая будет работать для всей команды и продукта...',
    content: `# Дизайн-системы в современных продуктах

Создание успешного цифрового продукта невозможно без четко организованной дизайн-системы. Рассмотрим, как построить систему, которая будет служить годами.

## 🎯 Что такое дизайн-система?

Дизайн-система - это набор переиспользуемых компонентов, паттернов и принципов, которые обеспечивают консистентность пользовательского опыта.

### Основные компоненты:

1. **Design Tokens** - базовые значения (цвета, шрифты, отступы)
2. **UI Components** - переиспользуемые элементы интерфейса
3. **Patterns** - готовые решения для типовых задач
4. **Guidelines** - принципы и правила использования

## 🛠 Инструменты для создания

### Figma + Storybook
Идеальная связка для современных команд:

\`\`\`javascript
// Пример компонента в Storybook
export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      options: ['primary', 'secondary', 'outline'],
      control: { type: 'select' },
    },
  },
};
\`\`\`

### Design Tokens
\`\`\`json
{
  "color": {
    "primary": {
      "500": { "value": "#00f0ff" },
      "600": { "value": "#00d4e6" }
    }
  }
}
\`\`\`

## 📈 Преимущества дизайн-систем

- **Скорость разработки** - готовые компоненты экономят время
- **Консистентность** - единый стиль во всем продукте  
- **Масштабируемость** - легко добавлять новые фичи
- **Командная работа** - общий язык между дизайнерами и разработчиками

## 🚀 Заключение

Инвестиции в дизайн-систему окупаются многократно. Начинайте с малого, развивайте постепенно, и ваша команда скажет вам спасибо!`,
    tags: ['дизайн-система', 'UI/UX', 'Figma', 'Storybook'],
    author: {
      name: 'Михаил Петров',
      avatar: '',
      username: '@mike_design',
    },
    date: '1 день назад',
    readTime: '8 мин',
    likes: 42,
    comments: 15,
    isLiked: true,
    isPublished: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function useBlogStorage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Инициализация данных из localStorage
  useEffect(() => {
    try {
      const storedPosts = localStorage.getItem(STORAGE_KEYS.POSTS);
      const storedComments = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      
      if (storedPosts) {
        setPosts(JSON.parse(storedPosts));
      } else {
        setPosts(defaultPosts);
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(defaultPosts));
      }
      
      if (storedComments) {
        setComments(JSON.parse(storedComments));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      setPosts(defaultPosts);
    } finally {
      setLoading(false);
    }
  }, []);

  // Сохранение постов в localStorage
  const savePosts = (newPosts: BlogPost[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(newPosts));
      setPosts(newPosts);
    } catch (error) {
      console.error('Error saving posts to localStorage:', error);
    }
  };

  // Сохранение комментариев в localStorage
  const saveComments = (newComments: Comment[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(newComments));
      setComments(newComments);
    } catch (error) {
      console.error('Error saving comments to localStorage:', error);
    }
  };

  // Создание нового поста
  const createPost = (postData: Partial<BlogPost>): BlogPost => {
    const now = new Date().toISOString();
    const newPost: BlogPost = {
      id: `post-${Date.now()}`,
      title: postData.title || 'Untitled Post',
      preview: postData.preview || '',
      content: postData.content || '',
      tags: postData.tags || [],
      author: postData.author || {
        name: 'Anonymous',
        avatar: '',
        username: '@anonymous',
      },
      date: 'Только что',
      readTime: `${Math.max(1, Math.ceil((postData.content || '').length / 1000))} мин`,
      likes: 0,
      comments: 0,
      isLiked: false,
      isPublished: postData.isPublished ?? false,
      createdAt: now,
      updatedAt: now,
    };

    const newPosts = [newPost, ...posts];
    savePosts(newPosts);
    return newPost;
  };

  // Обновление поста
  const updatePost = (postId: string, updates: Partial<BlogPost>) => {
    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            ...updates, 
            updatedAt: new Date().toISOString(),
            readTime: updates.content 
              ? `${Math.max(1, Math.ceil(updates.content.length / 1000))} мин`
              : post.readTime
          }
        : post
    );
    savePosts(updatedPosts);
  };

  // Удаление поста
  const deletePost = (postId: string) => {
    const updatedPosts = posts.filter(post => post.id !== postId);
    savePosts(updatedPosts);
    
    // Также удаляем комментарии к этому посту
    const updatedComments = comments.filter(comment => comment.postId !== postId);
    saveComments(updatedComments);
  };

  // Лайк поста
  const togglePostLike = (postId: string) => {
    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    );
    savePosts(updatedPosts);
  };

  // Получение комментариев для поста
  const getPostComments = (postId: string): Comment[] => {
    return comments.filter(comment => comment.postId === postId && !comment.parentId);
  };

  // Добавление комментария
  const addComment = (postId: string, content: string, parentId?: string) => {
    const now = new Date().toISOString();
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      content,
      author: {
        name: 'Вы',
        avatar: '',
        username: '@you',
      },
      date: 'Только что',
      likes: 0,
      isLiked: false,
      parentId,
      createdAt: now,
    };

    const newComments = [...comments, newComment];
    saveComments(newComments);

    // Обновляем счетчик комментариев в посте
    updatePost(postId, { 
      comments: posts.find(p => p.id === postId)?.comments || 0 + 1 
    });

    return newComment;
  };

  // Редактирование комментария
  const editComment = (commentId: string, content: string) => {
    const updatedComments = comments.map(comment =>
      comment.id === commentId
        ? { ...comment, content }
        : comment
    );
    saveComments(updatedComments);
  };

  // Удаление комментария
  const deleteComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    const updatedComments = comments.filter(c => 
      c.id !== commentId && c.parentId !== commentId
    );
    saveComments(updatedComments);

    // Обновляем счетчик комментариев в посте
    const postComments = getPostComments(comment.postId);
    updatePost(comment.postId, { comments: Math.max(0, postComments.length - 1) });
  };

  // Лайк комментария
  const toggleCommentLike = (commentId: string) => {
    const updatedComments = comments.map(comment =>
      comment.id === commentId
        ? {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          }
        : comment
    );
    saveComments(updatedComments);
  };

  // Валидация поста
  const validatePost = (postData: Partial<BlogPost>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!postData.title?.trim()) {
      errors.push('Заголовок обязателен');
    }
    
    if (postData.title && postData.title.length > 100) {
      errors.push('Заголовок не должен превышать 100 символов');
    }
    
    if (!postData.content?.trim()) {
      errors.push('Содержание поста обязательно');
    }
    
    if (postData.content && postData.content.length < 10) {
      errors.push('Содержание должно быть не менее 10 символов');
    }
    
    if (!postData.preview?.trim()) {
      errors.push('Краткое описание обязательно');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Сохранение черновика
  const saveDraft = (postData: Partial<BlogPost>) => {
    try {
      const drafts = JSON.parse(localStorage.getItem(STORAGE_KEYS.DRAFTS) || '[]');
      const draftId = `draft-${Date.now()}`;
      const draft = {
        id: draftId,
        ...postData,
        savedAt: new Date().toISOString()
      };
      
      const updatedDrafts = [...drafts, draft];
      localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(updatedDrafts));
      return draft;
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  return {
    posts,
    comments,
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
    saveDraft,
  };
}