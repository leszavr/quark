import React, { useState } from 'react'
import { Header } from './components/HeaderNew'
import { BlogFeed } from './components/BlogFeed'
import { Messenger } from './components/Messenger'
import { Footer } from './components/Footer'
import { ThemeProvider } from './components/ThemeProvider'
import { useToast } from './hooks/use-toast'
import { Toaster } from './components/ui/toaster'
import './App.css'

// Типы данных
interface User {
  id: string
  name: string
  email: string
  avatar: string
}

interface BlogPost {
  id: string
  title: string
  excerpt: string
  author: string
  authorAvatar: string
  blogName: string
  publishedAt: string
  tags: string[]
  likes: number
  comments: number
  isLiked: boolean
}

interface Message {
  id: string
  author: string
  authorAvatar?: string
  content: string
  timestamp: string
  isOwn: boolean
}

// Моковые данные точно как в оригинальном макете
const mockUser: User = {
  id: '1',
  name: 'Иван Петров',
  email: 'ivan@example.com',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
}

const mockPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Как создать современный веб-интерфейс',
    excerpt: 'В этой статье мы разберем основные принципы создания современных пользовательских интерфейсов, рассмотрим популярные библиотеки и инструменты...',
    author: 'Алексей Иванов',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    blogName: 'Веб-разработка',
    publishedAt: '2 часа назад',
    tags: ['React', 'UI/UX', 'Frontend'],
    likes: 42,
    comments: 12,
    isLiked: false
  },
  {
    id: '2', 
    title: 'Искусственный интеллект в 2025: новые возможности',
    excerpt: 'Обзор последних достижений в области ИИ и их влияние на различные сферы жизни. Рассматриваем практические применения машинного обучения...',
    author: 'Мария Петрова',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face',
    blogName: 'Технологии будущего',
    publishedAt: '4 часа назад',
    tags: ['ИИ', 'ML', 'Технологии'],
    likes: 87,
    comments: 23,
    isLiked: true
  },
  {
    id: '3',
    title: 'Секреты продуктивности разработчика',
    excerpt: 'Делимся проверенными методами и инструментами для повышения эффективности работы программиста. От организации рабочего места до автоматизации задач...',
    author: 'Дмитрий Козлов',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    blogName: 'Карьера в IT',
    publishedAt: '6 часов назад',
    tags: ['Продуктивность', 'Карьера', 'Советы'],
    likes: 156,
    comments: 34,
    isLiked: false
  },
  {
    id: '4',
    title: 'Мобильная разработка: тренды 2025',
    excerpt: 'Анализируем текущие тенденции в мобильной разработке, новые фреймворки и подходы к созданию кроссплатформенных приложений...',
    author: 'Елена Смирнова',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    blogName: 'Mobile Dev',
    publishedAt: '8 часов назад',
    tags: ['Mobile', 'React Native', 'Flutter'],
    likes: 73,
    comments: 18,
    isLiked: true
  }
]

const mockMessages: Message[] = [
  {
    id: '1',
    author: 'Анна Волкова',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face',
    content: 'Отличная статья про React! Очень помогла разобраться с хуками',
    timestamp: '14:23',
    isOwn: false
  },
  {
    id: '2',
    author: 'Вы',
    content: 'Согласен, автор хорошо объяснил сложные концепции',
    timestamp: '14:25',
    isOwn: true
  },
  {
    id: '3',
    author: 'Игорь Петров',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    content: 'Кто-нибудь пробовал новую версию Next.js?',
    timestamp: '14:28',
    isOwn: false
  },
  {
    id: '4',
    author: 'Мария Сидорова',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    content: 'Да, App Router действительно удобнее старого подхода',
    timestamp: '14:30',
    isOwn: false
  },
  {
    id: '5',
    author: 'Алексей Иванов',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    content: 'Спасибо за обратную связь по статье! 🚀',
    timestamp: '14:32',
    isOwn: false
  }
]

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [theme, setTheme] = useState<string>('default')
  const [isMessengerVisible, setIsMessengerVisible] = useState(true)
  const [isMessengerMinimized, setIsMessengerMinimized] = useState(false)
  const [posts, setPosts] = useState<BlogPost[]>(mockPosts)
  const { toast } = useToast()

  const handleLogin = () => {
    if (!user) {
      setUser(mockUser)
      toast({
        title: "Добро пожаловать!",
        description: `Вы вошли как ${mockUser.name}`,
      })
    }
  }

  const handleLogout = () => {
    setUser(null)
    toast({
      title: "Выход выполнен",
      description: "До свидания!",
    })
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    // Применяем тему к body
    document.body.className = newTheme !== 'default' ? `theme-${newTheme}` : ''
    toast({
      title: "Тема изменена",
      description: `Применена ${newTheme} тема`,
    })
  }

  const handleLike = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    )
  }

  const handleComment = (postId: string) => {
    toast({
      title: "Комментарий",
      description: "Функция комментариев в разработке",
    })
  }

  const handleSendMessage = (content: string) => {
    toast({
      title: "Сообщение отправлено",
      description: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
    })
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="app min-h-screen bg-gradient-to-br from-background via-background to-secondary">
        <Header 
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onThemeChange={handleThemeChange}
          currentTheme={theme}
        />
        
        <main className="main flex-1">
          <div className="container mx-auto px-4">
            <div className="content-wrapper">
              {/* Демо секция */}
              {!user && (
                <div className="demo-section mb-8 p-4 bg-card rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="demo-pulse w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-muted-foreground">Демо режим</span>
                    </div>
                    <button 
                      onClick={handleLogin}
                      className="btn btn-primary btn-sm"
                    >
                      Войти как пользователь
                    </button>
                  </div>
                </div>
              )}
              
              <BlogFeed 
                posts={posts}
                onLike={handleLike}
                onComment={handleComment}
              />
            </div>
          </div>
        </main>

        <Messenger 
          messages={mockMessages}
          onSendMessage={handleSendMessage}
          isLoggedIn={!!user}
          isVisible={isMessengerVisible}
          isMinimized={isMessengerMinimized}
          onToggleVisibility={() => setIsMessengerVisible(!isMessengerVisible)}
          onToggleMinimized={() => setIsMessengerMinimized(!isMessengerMinimized)}
        />

        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default App
