# C4 Model: Component Diagram — Messaging Service

## Описание
Детализация внутренних компонентов `messaging-service`.

```mermaid
C4Component
    title Component Diagram: Messaging Service

    Container_Boundary(messaging_service, "Messaging Service") {
        Component(ws_gateway, "WebSocketGateway", "WS", "Подключение клиентов")
        Component(message_controller, "MessageController", "HTTP", "Отправка сообщений")
        Component(message_service, "MessageService", "Business Logic", "Валидация, маршрутизация")
        Component(message_repository, "MessageRepository", "PostgreSQL", "Хранение сообщений")
        Component(conversation_service, "ConversationService", "Business Logic", "Управление диалогами")
        Component(event_publisher, "EventPublisher", "NATS", "Отправка message.sent")
        Component(auth_client, "AuthServiceClient", "HTTP", "Валидация JWT")
        Component(rate_limiter, "RateLimiter", "Redis", "Ограничение сообщений")
    }

    Container(gateway, "API Gateway", "Traefik")
    Container(auth_service, "Auth Service", "FastAPI")
    Container(nats, "NATS JetStream", "Event Bus")
    Container(postgres, "PostgreSQL", "БД сообщений")
    Container(redis, "Redis", "Rate limiting, сессии")

    Rel(gateway, ws_gateway, "WS /ws?token=...")
    Rel(gateway, message_controller, "POST /messages")
    Rel(ws_gateway, message_service, "onMessage()")
    Rel(message_controller, message_service, "sendMessage()")
    Rel(message_service, message_repository, "Сохранение")
    Rel(message_repository, postgres, "SQL")
    Rel(message_service, conversation_service, "updateConversation()")
    Rel(message_service, event_publisher, "publish(message.sent)")
    Rel(event_publisher, nats, "NATS publish")
    Rel(message_service, rate_limiter, "checkLimit()")
    Rel(rate_limiter, redis, "INCR / EXPIRE")
    Rel(ws_gateway, auth_client, "validateToken()")
    Rel(auth_client, auth_service, "HTTP /auth/validate")
```

## Компоненты
| Компонент | Ответственность |
|---------|-----------------|
| `WebSocketGateway` | Подключение клиентов |
| `MessageController` | HTTP-отправка |
| `MessageService` | Логика отправки |
| `MessageRepository` | Хранение сообщений |
| `ConversationService` | Управление диалогами |
| `EventPublisher` | Публикация событий |
| `AuthServiceClient` | Проверка JWT |
| `RateLimiter` | Ограничение сообщений |

## Цель
- Поддержка E2E-шифрования (в будущем)
- Высокая производительность при нагрузке
- Готовность к голосовым звонкам