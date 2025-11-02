# Клиентские сервисы для взаимодействия с API

## Обзор

В этом документе описаны клиентские сервисы для взаимодействия с бэкендом Quark Platform.

## Базовая конфигурация

Базовый URL для API: `/api` (через Traefik gateway)

## Сервисы

### 1. Blog API Service

#### Эндпоинты:
- `GET /api/posts` - получение списка постов
- `GET /api/posts/:id` - получение конкретного поста
- `POST /api/posts` - создание поста
- `PUT /api/posts/:id` - обновление поста
- `DELETE /api/posts/:id` - удаление поста
- `GET /api/posts/:postId/comments` - получение комментариев
- `POST /api/posts/:postId/comments` - добавление комментария

#### Методы:
```typescript
interface BlogAPIService {
  getPosts(): Promise<BlogPost[]>;
  getPost(id: string): Promise<BlogPost>;
  createPost(post: Partial<BlogPost>): Promise<BlogPost>;
  updatePost(id: string, post: Partial<BlogPost>): Promise<BlogPost>;
  deletePost(id: string): Promise<void>;
  getComments(postId: string): Promise<Comment[]>;
  addComment(postId: string, content: string): Promise<Comment>;
}
```

### 2. Chat API Service

#### Эндпоинты:
- `GET /api/channels` - получение каналов
- `GET /api/channels/:id` - получение конкретного канала
- `GET /api/channels/:channelId/messages` - получение сообщений канала
- `POST /api/channels/:channelId/messages` - отправка сообщения в канал

#### Методы:
```typescript
interface ChatAPIService {
  getChannels(): Promise<Channel[]>;
  getChannel(id: string): Promise<Channel>;
  getMessages(channelId: string): Promise<Message[]>;
  sendMessage(channelId: string, content: string): Promise<Message>;
}
```

### 3. Auth API Service

#### Эндпоинты:
- `POST /api/auth/register` - регистрация пользователя
- `POST /api/auth/login` - вход пользователя
- `POST /api/auth/logout` - выход пользователя
- `GET /api/auth/profile` - получение профиля пользователя

#### Методы:
```typescript
interface AuthAPIService {
  register(credentials: RegisterCredentials): Promise<AuthResponse>;
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  logout(): Promise<void>;
  getProfile(): Promise<UserProfile>;
}
```

## Обработка ошибок

Все API вызовы должны обрабатывать следующие типы ошибок:
- Сетевые ошибки
- Ошибки аутентификации (401, 403)
- Ошибки валидации данных (400)
- Серверные ошибки (500+)

## Аутентификация

Аутентификация осуществляется через JWT токены, которые устанавливаются в cookies при логине.