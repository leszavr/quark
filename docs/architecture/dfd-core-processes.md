# DFD-1: Core Processes (Level 1)

## Описание
Детализирует внутренние процессы системы при ключевых сценариях.

```mermaid
graph TD
    subgraph "Внешние сущности"
        A[Пользователь]
        C[Admin Panel]
        D[AI Ops Agent]
    end

    subgraph "Quark Platform"
        B[API Gateway]
        B --> E[Auth Service]
        B --> F[BFF]
        F --> G[Blog Service]
        F --> H[Messaging Service]
        F --> I[AI Orchestrator]

        E --> J[(PostgreSQL - Users)]
        G --> K[(PostgreSQL - Posts)]
        G --> L[(MinIO - Media)]
        I --> M[(Redis - Context)]
        N[NATS JetStream] --> G
        N --> O[Search Service]
        N --> P[Notification Service]

        P --> Q[Email Service]
        P --> R[WebSocket → Пользователь]

        D -->|PR, рекомендации| B
        C -->|Управление| F
    end

    A -->|1. Логин| B
    B -->|2. JWT| A
    A -->|3. POST /posts| B
    F -->|4. Валидация| G
    G -->|5. Сохранение| K
    G -->|6. media.upload| L
    G -->|7. post.published → NATS| N
    N -->|8. index.post| O
    N -->|9. notification.create| P
    P -->|10. Отправка| Q
    P -->|11. WebSocket| A

    style K fill:#FFEB3B,stroke:#FFC107
    style L fill:#FFEB3B,stroke:#FFC107
    style J fill:#FFEB3B,stroke:#FFC107
    style M fill:#FFEB3B,stroke:#FFC107
```

## Ключевой сценарий: Публикация поста
1. Пользователь отправляет пост
2. BFF валидирует и передаёт `blog-service`
3. Блог-сервис:
   - Сохраняет текст в PostgreSQL
   - Загружает изображение в MinIO
   - Генерирует событие `post.published`
4. Событие рассылается:
   - `search-service` — индексирует
   - `notification-service` — отправляет уведомления
   - `ai-orchestrator` — может сгенерировать рекомендации

## Потоки данных
| Процесс | Данные | Направление |
|--------|--------|------------|
| Аутентификация | JWT | Пользователь ↔ Auth Service |
| Публикация поста | PostCreate DTO | BFF → Blog Service |
| Хранение медиа | Binary data | Blog → MinIO |
| Событие | post.published | Blog → NATS |
| Индексация | Post ID + text | NATS → Search Service |
| Уведомление | notification DTO | NATS → Notification Service |
| Отправка email | Тема, текст | Notification → Email Service |
| WebSocket | message.sent | Messaging → Пользователь |