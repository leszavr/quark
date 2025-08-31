# C4 Model: Component Diagram — Blog Service (Level 3)

## Описание
Детализирует внутренние компоненты `blog-service`.

```mermaid
C4Component
    title Component Diagram: Blog Service

    Container_Boundary(blog_service, "Blog Service") {
        Component(blog_controller, "BlogController", "HTTP", "Обработка /posts, /blogs")
        Component(blog_service_logic, "BlogService", "Business Logic", "Создание, публикация, права")
        Component(blog_repository, "BlogRepository", "PostgreSQL", "CRUD операции с постами")
        Component(media_client, "MediaServiceClient", "gRPC", "Загрузка изображений")
        Component(event_publisher, "EventPublisher", "NATS", "Отправка post.published")
        Component(ai_client, "AIOrchestratorClient", "HTTP", "Запрос генерации/модерации")
    }

    Container(gateway, "API Gateway", "Traefik")
    Container(media_service, "Media Service", "FastAPI")
    Container(ai_orchestrator, "AI Orchestrator", "FastAPI")
    Container(event_bus, "Event Bus", "NATS")
    Container(postgres, "PostgreSQL", "БД постов")

    Rel(gateway, blog_controller, "HTTP POST /posts")
    Rel(blog_controller, blog_service_logic, "Вызов метода")
    Rel(blog_service_logic, blog_repository, "Сохранение/чтение")
    Rel(blog_repository, postgres, "SQL")
    Rel(blog_service_logic, media_client, "Загрузка медиа")
    Rel(media_client, media_service, "gRPC UploadImage")
    Rel(blog_service_logic, event_publisher, "publish(post.published)")
    Rel(event_publisher, event_bus, "NATS publish")
    Rel(blog_service_logic, ai_client, "moderate(content)")
    Rel(ai_client, ai_orchestrator, "HTTP /ai/moderate")
```

## Компоненты
| Компонент | Ответственность |
|---------|-----------------|
| `BlogController` | HTTP-интерфейс |
| `BlogService` | Бизнес-логика |
| `BlogRepository` | Работа с БД |
| `MediaServiceClient` | gRPC-вызов к `media-service` |
| `EventPublisher` | Публикация событий |
| `AIOrchestratorClient` | Взаимодействие с ИИ |

## Цель
- Показать внутреннюю структуру одного сервиса
- Помочь разработчикам понять, где вносить изменения
- Поддержать стандарты модульности и тестирования