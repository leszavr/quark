# C4 Model: Component Diagram — Media Service

## Описание
Детализация внутренних компонентов `media-service`.

```mermaid
C4Component
    title Component Diagram: Media Service

    Container_Boundary(media_service, "Media Service") {
        Component(upload_controller, "UploadController", "HTTP", "POST /media/upload")
        Component(media_processor, "MediaProcessor", "Business Logic", "Валидация, конвертация")
        Component(thumbnail_generator, "ThumbnailGenerator", "FFmpeg", "Создание превью")
        Component(storage_client, "StorageClient", "S3 API", "Загрузка в MinIO")
        Component(event_publisher, "EventPublisher", "NATS", "Отправка media.uploaded")
        Component(auth_client, "AuthServiceClient", "HTTP", "Валидация JWT")
    }

    Container(gateway, "API Gateway", "Traefik")
    Container(auth_service, "Auth Service", "FastAPI")
    Container(nats, "NATS JetStream", "Event Bus")
    Container(minio, "MinIO", "Хранение медиа")

    Rel(gateway, upload_controller, "POST /media/upload")
    Rel(upload_controller, auth_client, "validateToken()")
    Rel(auth_client, auth_service, "HTTP /auth/validate")
    Rel(upload_controller, media_processor, "process()")
    Rel(media_processor, thumbnail_generator, "generateThumbnail()")
    Rel(media_processor, storage_client, "upload()")
    Rel(storage_client, minio, "S3 PutObject")
    Rel(media_processor, event_publisher, "publish(media.uploaded)")
    Rel(event_publisher, nats, "NATS publish")
```

## Компоненты
| Компонент | Ответственность |
|---------|-----------------|
| `UploadController` | Приём файлов |
| `MediaProcessor` | Валидация, обработка |
| `ThumbnailGenerator` | Создание превью |
| `StorageClient` | Загрузка в MinIO |
| `EventPublisher` | Публикация событий |
| `AuthServiceClient` | Проверка JWT |

## Цель
- Безопасная загрузка медиа
- Поддержка больших файлов
- Интеграция с `blog-service` и `ai-orchestrator`