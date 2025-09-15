# Quark Platform UI

Модульный административный интерфейс для экосистемы микросервисов Quark Platform.

## 🎯 Назначение

**Quark Platform UI** - это эволюционный административный интерфейс, который растет вместе с платформой через модульную архитектуру микрофронтендов. Каждый сервис может регистрировать свои UI компоненты, создавая единую точку управления всей экосистемой.

## 🏗️ Архитектура

### Модульная система
- **Core Platform** - базовое Vue.js приложение с маршрутизацией
- **Design System** - единая система дизайна с Tailwind CSS
- **Module Loader** - динамическая загрузка UI модулей сервисов
- **Unified API Client** - централизованный клиент для API запросов

### Технологический стек
- **Vue.js 3** с Composition API
- **Vue Router** для маршрутизации
- **Pinia** для state management
- **Tailwind CSS** для стилизации
- **Vite** для сборки и разработки
- **Nginx** для продакшена

## 🚀 Быстрый старт

### Разработка
```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Приложение доступно по адресу http://localhost:3100
```

### Продакшен
```bash
# Сборка для продакшена
npm run build

# Запуск через Docker
docker build -t quark-ui .
docker run -p 3100:3100 quark-ui
```

## 📋 Функциональность

### Текущие модули

#### 🏠 Dashboard
- Общий обзор состояния платформы
- Статистика сервисов и пользователей
- Real-time мониторинг

#### 🔐 Auth Module
- Тестирование Auth Service API
- Регистрация и авторизация пользователей
- Управление JWT токенами
- Просмотр профиля пользователя

#### 📊 Monitoring Module
- Интеграция с Monitoring Dashboard
- Встроенный iframe с мониторингом
- Базовые метрики системы

#### 🔌 Plugin Hub Module
- Просмотр зарегистрированных сервисов
- Статистика Plugin Hub
- Управление сервисами

## 🎨 Design System

### Цветовая схема
- **Primary**: Синяя палитра (#3b82f6 - #1e3a8a)
- **Gray**: Нейтральная палитра для текста и фонов
- **Success**: Зеленый для успешных операций
- **Warning**: Желтый для предупреждений
- **Error**: Красный для ошибок

### Компоненты
- **Кнопки**: btn, btn-primary, btn-secondary, btn-outline
- **Карточки**: card, card-header, card-body, card-footer
- **Формы**: form-input, form-label
- **Статусы**: status-badge, status-online, status-warning, status-offline

## 🔌 Добавление новых модулей

### Структура модуля
```javascript
// modules/new-service/NewServiceModule.vue
export default {
  name: 'NewServiceModule',
  // Компонент модуля
}

// modules/new-service/index.js
export default {
  name: 'new-service',
  title: 'New Service',
  icon: 'service-icon',
  routes: [
    { path: '/new-service', component: NewServiceModule }
  ],
  navItems: [
    { label: 'New Service', route: '/new-service' }
  ]
}
```

### Регистрация в роутере
```javascript
// router/index.js
import NewServiceModule from '@/modules/new-service/NewServiceModule.vue'

const routes = [
  // ... существующие routes
  {
    path: '/new-service',
    name: 'NewService',
    component: NewServiceModule,
    meta: { 
      title: 'New Service',
      icon: 'service-icon'
    }
  }
]
```

## 🔧 Конфигурация

### Переменные окружения
```bash
# Порт разработки
VITE_PORT=3100

# API endpoints
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_PLUGIN_HUB_URL=http://localhost:3000
VITE_MONITORING_URL=http://localhost:3900
```

### Docker конфигурация
```yaml
quark-ui:
  build: 
    context: ./services/quark-ui
  container_name: quark-ui
  ports:
    - "3100:3100"
  depends_on:
    - auth-service
    - plugin-hub
    - monitoring
```

## 📚 API интеграция

### Auth Service
```javascript
// Регистрация пользователя
POST /auth/register
{
  "email": "user@example.com",
  "password": "password",
  "firstName": "John",
  "lastName": "Doe"
}

// Авторизация
POST /auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Профиль (требует JWT)
GET /auth/profile
Authorization: Bearer <jwt_token>
```

### Plugin Hub
```javascript
// Список сервисов
GET /api/services

// Регистрация сервиса
POST /api/services/register
{
  "id": "service-id",
  "name": "Service Name",
  "url": "http://service:port"
}
```

## 🎯 Будущие возможности

### Phase 2: Service Integration
- Blog Service UI модуль
- User Management interface
- Media Gallery viewer
- Content moderation tools

### Phase 3: Advanced Features
- Real-time notifications
- Advanced analytics dashboard
- Custom widget builder
- Theme customization

### Phase 4: Plugin Ecosystem
- Third-party UI modules
- Widget marketplace
- Developer SDK
- Custom themes

## 🤝 Вклад в развитие

### Добавление нового UI модуля
1. Создайте компонент в `src/modules/your-service/`
2. Определите маршруты и навигацию
3. Добавьте в роутер
4. Обновите документацию

### Стандарты кода
- Используйте Composition API для новых компонентов
- Следуйте naming conventions
- Добавляйте TypeScript типы где возможно
- Пишите responsive дизайн

## 📝 Лицензия

MIT License - см. LICENSE файл для деталей.

---

**Quark Platform UI** - это не просто админка, а полноценная платформа для управления микросервисной экосистемой, которая растет и развивается вместе с вашими сервисами!
