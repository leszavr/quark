import { useState, useEffect } from 'react';
import { MessageCircle, Users, Search, Home, Bell, User, Heart, MessageSquare, Repeat2, Share, MoreHorizontal, Minimize2, Maximize2, Plus } from 'lucide-react';
import './App.css';

type MessengerState = 'normal' | 'minimized' | 'fullscreen';

// Header с переключением тем
function Header({ onThemeChange, currentTheme }: { onThemeChange: (theme: string) => void, currentTheme: string }) {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  
  const themes = [
    { name: 'default', label: 'Классический', color: '#030213' },
    { name: 'blue', label: 'Синий', color: '#1DA1F2' },
    { name: 'purple', label: 'Фиолетовый', color: '#7C3AED' },
    { name: 'green', label: 'Зеленый', color: '#25D366' },
    { name: 'orange', label: 'Оранжевый', color: '#FF4500' },
    { name: 'indigo', label: 'Индиго', color: '#0088CC' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
              Q
            </div>
            <span className="text-xl font-bold">Quark</span>
          </div>

          {/* Навигация */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Home size={20} />
              Главная
            </a>
            <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Users size={20} />
              Сообщества
            </a>
            <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Bell size={20} />
              Уведомления
            </a>
          </nav>

          {/* Действия */}
          <div className="flex items-center gap-4">
            {/* Переключатель тем */}
            <div className="relative">
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: themes.find(t => t.name === currentTheme)?.color }}
                />
                <span className="text-sm font-medium">Тема</span>
              </button>
              
              {isThemeMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-100">
                    <h3 className="font-medium text-gray-900">Выберите тему</h3>
                  </div>
                  <div className="p-2">
                    {themes.map((theme) => (
                      <button
                        key={theme.name}
                        onClick={() => {
                          onThemeChange(theme.name);
                          setIsThemeMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors theme-button ${
                          currentTheme === theme.name ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: theme.color }}
                        />
                        <span className="text-sm font-medium">{theme.label}</span>
                        {currentTheme === theme.name && (
                          <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
              <Search size={20} />
            </button>
            <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
              <User size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// Блог-лента
function BlogFeed() {
  const posts = [
    {
      id: 1,
      author: 'Алексей Петров',
      username: '@alexey_p',
      avatar: '👨‍💻',
      time: '2ч',
      content: 'Только что запустил новый микросервис на Quark! Производительность впечатляет 🚀',
      likes: 12,
      comments: 3,
      reposts: 1,
      image: null
    },
    {
      id: 2,
      author: 'Мария Иванова',
      username: '@maria_dev',
      avatar: '👩‍💼',
      time: '4ч',
      content: 'Обновили систему мониторинга. Теперь отслеживаем все метрики в реальном времени. Кто-нибудь еще использует Grafana для визуализации?',
      likes: 8,
      comments: 5,
      reposts: 2,
      image: null
    },
    {
      id: 3,
      author: 'Команда Quark',
      username: '@quark_team',
      avatar: '🏢',
      time: '6ч',
      content: 'Релиз версии 2.1.0! 🎉\n\n✨ Новые возможности:\n• Улучшенная производительность\n• Новый UI\n• Расширенная система плагинов\n\n#QuarkUpdate #DevTools',
      likes: 45,
      comments: 12,
      reposts: 8,
      image: '/api/placeholder/400/200'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          {/* Заголовок поста */}
          <div className="flex items-center gap-3 p-4 pb-2">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
              {post.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900">{post.author}</h3>
                <span className="text-gray-500 text-sm">{post.username}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500 text-sm">{post.time}</span>
              </div>
            </div>
            <button className="w-8 h-8 hover:bg-gray-100 rounded-full flex items-center justify-center">
              <MoreHorizontal size={16} />
            </button>
          </div>

          {/* Содержимое */}
          <div className="px-4 pb-3">
            <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
            {post.image && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <img src={post.image} alt="" className="w-full h-48 object-cover bg-gray-100" />
              </div>
            )}
          </div>

          {/* Действия */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
              <Heart size={18} />
              <span className="text-sm">{post.likes}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
              <MessageSquare size={18} />
              <span className="text-sm">{post.comments}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
              <Repeat2 size={18} />
              <span className="text-sm">{post.reposts}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
              <Share size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Мессенджер
function Messenger({ 
  isVisible, 
  state, 
  onStateChange 
}: { 
  isVisible: boolean, 
  state: MessengerState, 
  onStateChange: (state: MessengerState) => void 
}) {
  const [activeChat, setActiveChat] = useState<string | null>('general');
  const [newMessage, setNewMessage] = useState('');

  const chats = [
    { id: 'general', name: 'Общий чат', lastMessage: 'Привет всем!', unread: 3, online: 12 },
    { id: 'dev', name: 'Разработчики', lastMessage: 'Пушим в прод?', unread: 1, online: 5 },
    { id: 'support', name: 'Поддержка', lastMessage: 'Все решено', unread: 0, online: 2 }
  ];

  const messages = [
    { id: 1, author: 'Алексей', content: 'Привет всем! Как дела?', timestamp: '14:30', isOwn: false },
    { id: 2, author: 'Вы', content: 'Привет! Все отлично, работаю над новыми фичами', timestamp: '14:32', isOwn: true },
    { id: 3, author: 'Мария', content: 'Круто! Что разрабатываете?', timestamp: '14:35', isOwn: false },
    { id: 4, author: 'Вы', content: 'Улучшаю систему мониторинга в Quark', timestamp: '14:36', isOwn: true }
  ];

  if (!isVisible) return null;

  const getMessengerClasses = () => {
    const baseClasses = "messenger-sidebar bg-white border-l border-gray-200 flex flex-col";
    
    switch (state) {
      case 'minimized':
        return `${baseClasses} messenger-minimized fixed bottom-4 right-4 w-80 rounded-lg shadow-lg`;
      case 'fullscreen':
        return `${baseClasses} messenger-fullscreen`;
      default:
        return `${baseClasses} fixed top-0 right-0 w-80 h-full z-40`;
    }
  };

  return (
    <div className={getMessengerClasses()}>
      {/* Заголовок мессенджера */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} className="text-blue-600" />
          <h3 className="font-medium">Мессенджер</h3>
          {state === 'normal' && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              {chats.reduce((sum, chat) => sum + chat.online, 0)} онлайн
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {state === 'fullscreen' ? (
            <button
              onClick={() => onStateChange('normal')}
              className="w-8 h-8 hover:bg-gray-200 rounded flex items-center justify-center"
            >
              <Minimize2 size={16} />
            </button>
          ) : (
            <button
              onClick={() => onStateChange('fullscreen')}
              className="w-8 h-8 hover:bg-gray-200 rounded flex items-center justify-center"
            >
              <Maximize2 size={16} />
            </button>
          )}
          
          <button
            onClick={() => onStateChange(state === 'minimized' ? 'normal' : 'minimized')}
            className="w-8 h-8 hover:bg-gray-200 rounded flex items-center justify-center"
          >
            {state === 'minimized' ? <Plus size={16} /> : <Minimize2 size={16} />}
          </button>
        </div>
      </div>

      {state !== 'minimized' && (
        <>
          {/* Список чатов */}
          <div className="border-b border-gray-200">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                  activeChat === chat.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-medium">
                  {chat.name[0]}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{chat.name}</span>
                    {chat.unread > 0 && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 truncate">{chat.lastMessage}</span>
                    <span className="text-xs text-green-500">{chat.online} онлайн</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

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
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Написать сообщение..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newMessage.trim()) {
                    // Здесь будет отправка сообщения
                    setNewMessage('');
                  }
                }}
              />
              <button 
                onClick={() => {
                  if (newMessage.trim()) {
                    // Здесь будет отправка сообщения
                    setNewMessage('');
                  }
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <MessageCircle size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Футер
function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                Q
              </div>
              <span className="font-bold text-lg">Quark</span>
            </div>
            <p className="text-gray-600 text-sm">
              Современная платформа для разработки и развертывания микросервисов
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Продукт</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-blue-600">Возможности</a></li>
              <li><a href="#" className="hover:text-blue-600">Документация</a></li>
              <li><a href="#" className="hover:text-blue-600">Примеры</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Поддержка</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-blue-600">Помощь</a></li>
              <li><a href="#" className="hover:text-blue-600">Сообщество</a></li>
              <li><a href="#" className="hover:text-blue-600">Контакты</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Компания</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-blue-600">О нас</a></li>
              <li><a href="#" className="hover:text-blue-600">Карьера</a></li>
              <li><a href="#" className="hover:text-blue-600">Новости</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">© 2024 Quark. Все права защищены.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-blue-600 text-sm">Политика конфиденциальности</a>
            <a href="#" className="text-gray-500 hover:text-blue-600 text-sm">Условия использования</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Основной компонент
export default function AppLayout() {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [isMessengerVisible, setIsMessengerVisible] = useState(true);
  const [messengerState, setMessengerState] = useState<MessengerState>('normal');

  // Применяем тему к документу
  useEffect(() => {
    document.body.className = currentTheme !== 'default' ? `theme-${currentTheme}` : '';
  }, [currentTheme]);

  const handleThemeChange = (newTheme: string) => {
    setCurrentTheme(newTheme);
  };

  return (
    <div className="app min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50">
      <Header onThemeChange={handleThemeChange} currentTheme={currentTheme} />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Демо секция */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full demo-pulse"></div>
                <span className="text-gray-600">Демо режим</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMessengerVisible(!isMessengerVisible)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm flex items-center gap-2"
                >
                  <MessageCircle size={16} />
                  {isMessengerVisible ? 'Скрыть чат' : 'Показать чат'}
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors btn-primary">
                  Войти как пользователь
                </button>
              </div>
            </div>
          </div>
          
          <BlogFeed />
        </div>
      </main>

      <Messenger 
        isVisible={isMessengerVisible} 
        state={messengerState}
        onStateChange={setMessengerState}
      />
      
      <Footer />
    </div>
  );
}
