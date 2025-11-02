# Обновление хуков для работы с бэкендом

## Обзор

В этом документе описано, как обновить существующие хуки `useBlogStorage` и `useChatStorage` для работы с бэкендом вместо localStorage.

## useBlogStorage Hook

### Текущая реализация
Хук использует localStorage для хранения постов и комментариев.

### Новая реализация
Хук будет использовать Blog API Service для всех операций.

### Изменения в методах

#### getPosts()
- Текущая реализация: читает из localStorage
- Новая реализация: вызывает `blogAPI.getPosts()`

#### createPost()
- Текущая реализация: сохраняет в localStorage
- Новая реализация: вызывает `blogAPI.createPost()`

#### updatePost()
- Текущая реализация: обновляет в localStorage
- Новая реализация: вызывает `blogAPI.updatePost()`

#### deletePost()
- Текущая реализация: удаляет из localStorage
- Новая реализация: вызывает `blogAPI.deletePost()`

#### getPostComments()
- Текущая реализация: читает из localStorage
- Новая реализация: вызывает `blogAPI.getComments()`

#### addComment()
- Текущая реализация: сохраняет в localStorage
- Новая реализация: вызывает `blogAPI.addComment()`

## useChatStorage Hook

### Текущая реализация
Хук использует localStorage для хранения чатов и сообщений.

### Новая реализация
Хук будет использовать Chat API Service для всех операций.

### Изменения в методах

#### getChats()
- Текущая реализация: читает из localStorage
- Новая реализация: вызывает `chatAPI.getChannels()`

#### sendMessage()
- Текущая реализация: сохраняет в localStorage
- Новая реализация: вызывает `chatAPI.sendMessage()`

#### getChatById()
- Текущая реализация: читает из localStorage
- Новая реализация: вызывает `chatAPI.getChannel()`

## Обработка состояний

### Loading State
Добавить состояние загрузки для всех асинхронных операций.

### Error State
Добавить состояние ошибки для обработки сетевых ошибок и ошибок API.

### Caching
Рассмотреть возможность добавления кэширования для улучшения UX.

## Аутентификация

Все API вызовы должны автоматически включать JWT токен через cookies.