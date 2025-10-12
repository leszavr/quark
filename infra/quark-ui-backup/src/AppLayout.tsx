import React, { useState } from 'react'
import './App.css'

// Простой Header без сложных зависимостей
function SimpleHeader({ onThemeChange, currentTheme }: { onThemeChange: (theme: string) => void, currentTheme: string }) {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  
  const themes = [
    { name: 'default', label: 'Классический', color: '#030213' },
    { name: 'blue', label: 'Синий', color: '#1DA1F2' },
    { name: 'purple', label: 'Фиолетовый', color: '#7C3AED' },
    { name: 'green', label: 'Зеленый', color: '#25D366' },
    { name: 'orange', label: 'Оранжевый', color: '#FF4500' },
    { name: 'indigo', label: 'Индиго', color: '#0088CC' }
  ]

  return (
    <header className="header sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
              Q
            </div>
            <span className="text-xl font-bold">Quark</span>
          </div>

          {/* Действия */}
          <div className="flex items-center gap-4">
            {/* Простое меню тем */}
            <div className="relative">
              <button 
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
              >
                🎨 Тема
              </button>
              
              {isThemeMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {themes.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => {
                        onThemeChange(theme.name)
                        setIsThemeMenuOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span>{theme.label}</span>
                      {currentTheme === theme.name && <span className="ml-auto">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Вход
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

// Простая лента блогов
function SimpleBlogFeed() {
  const posts = [
    {
      id: '1',
      title: 'Как создать современный веб-интерфейс',
      excerpt: 'В этой статье мы разберем основные принципы создания современных пользовательских интерфейсов...',
      author: 'Алексей Иванов',
      blogName: 'Веб-разработка',
      publishedAt: '2 часа назад',
      likes: 42,
      comments: 12
    },
    {
      id: '2',
      title: 'Искусственный интеллект в 2025: новые возможности',
      excerpt: 'Обзор последних достижений в области ИИ и их влияние на различные сферы жизни...',
      author: 'Мария Петрова',
      blogName: 'Технологии будущего',
      publishedAt: '4 часа назад',
      likes: 87,
      comments: 23
    }
  ]

  return (
    <div className="blog-feed max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📚</span>
        <h2 className="text-2xl font-bold">Лента блогов</h2>
        <span className="text-sm text-gray-500">{posts.length} публикации</span>
      </div>
      
      <div className="space-y-6">
        {posts.map((post) => (
          <article key={post.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                👤
              </div>
              <div>
                <div className="font-medium">{post.author}</div>
                <div className="text-sm text-gray-500">{post.blogName} • {post.publishedAt}</div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-2">{post.title}</h3>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 text-gray-500 hover:text-red-500">
                ❤️ {post.likes}
              </button>
              <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500">
                💬 {post.comments}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

// Простой мессенджер
function SimpleMessenger({ isVisible }: { isVisible: boolean }) {
  const [isMinimized, setIsMinimized] = useState(false)
  
  const messages = [
    { id: '1', author: 'Анна Волкова', content: 'Отличная статья про React!', timestamp: '14:23', isOwn: false },
    { id: '2', author: 'Вы', content: 'Согласен, очень полезно', timestamp: '14:25', isOwn: true },
    { id: '3', author: 'Игорь Петров', content: 'Кто пробовал Next.js?', timestamp: '14:28', isOwn: false }
  ]

  if (!isVisible) return null

  return (
    <div className="messenger-sidebar fixed right-4 top-20 bottom-4 w-80 bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span>💬</span>
          <span className="font-medium">Общий чат</span>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-6 h-6 hover:bg-gray-100 rounded flex items-center justify-center"
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          <button className="w-6 h-6 hover:bg-gray-100 rounded flex items-center justify-center">
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Сообщения */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-lg p-2 ${
                  msg.isOwn 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {!msg.isOwn && <div className="text-xs font-medium mb-1">{msg.author}</div>}
                  <div className="text-sm">{msg.content}</div>
                  <div className={`text-xs mt-1 ${msg.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ввод сообщения */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Написать сообщение..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                📤
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Простой футер
function SimpleFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
              Q
            </div>
            <div>
              <div className="font-bold">Quark</div>
              <div className="text-sm text-gray-500">Платформа для творчества</div>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            <div>📧 info@quark.dev</div>
            <div>📞 +7 (800) 123-45-67</div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function AppLayout() {
  const [theme, setTheme] = useState('default')
  const [messengerVisible, setMessengerVisible] = useState(true)

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    document.body.className = newTheme !== 'default' ? `theme-${newTheme}` : ''
  }

  return (
    <div className="app min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50">
      <SimpleHeader onThemeChange={handleThemeChange} currentTheme={theme} />
      
      <main className="main flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Демо секция */}
          <div className="demo-section mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Демо режим</span>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Войти как пользователь
              </button>
            </div>
          </div>
          
          <SimpleBlogFeed />
        </div>
      </main>

      <SimpleMessenger isVisible={messengerVisible} />
      <SimpleFooter />
    </div>
  )
}

export default AppLayout
