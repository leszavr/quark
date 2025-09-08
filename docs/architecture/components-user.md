# C4 Model: Component Diagram — User Service

## Описание
Детализация внутренних компонентов `user-service`.

```mermaid
C4Component
    title Component Diagram: User Service

    Container_Boundary(user_service, "User Service") {
        Component(profile_controller, "ProfileController", "HTTP", "GET /users/{id}, PUT /profile")
        Component(subscription_controller, "SubscriptionController", "HTTP", "Управление подписками")
        Component(user_service_logic, "UserService", "Business Logic", "Профили, отношения")
        Component(user_repository, "UserRepository", "PostgreSQL", "CRUD пользователей")
        Component(event_publisher, "EventPublisher", "NATS", "Публикация user.updated")
        Component(auth_client, "AuthServiceClient", "HTTP", "Валидация JWT")
    }

    Container(gateway, "API Gateway", "Traefik")
    Container(auth_service, "Auth Service", "FastAPI")
    Container(nats, "NATS JetStream", "Event Bus")
    Container(postgres, "PostgreSQL", "БД пользователей")

    Rel(gateway, profile_controller, "GET /users/{id}")
    Rel(gateway, subscription_controller, "POST /subscribe")
    Rel(profile_controller, user_service_logic, "updateProfile()")
    Rel(subscription_controller, user_service_logic, "subscribe()")
    Rel(user_service_logic, user_repository, "Сохранение/чтение")
    Rel(user_repository, postgres, "SQL")
    Rel(user_service_logic, event_publisher, "publish(user.updated)")
    Rel(event_publisher, nats, "NATS publish")
    Rel(profile_controller, auth_client, "validateToken()")
    Rel(auth_client, auth_service, "HTTP /auth/validate")
```

## Компоненты
| Компонент | Ответственность |
|---------|-----------------|
| `ProfileController` | Управление профилем |
| `SubscriptionController` | Подписки между пользователями |
| `UserService` | Бизнес-логика (друзья, подписки) |
| `UserRepository` | Работа с БД |
| `EventPublisher` | Публикация событий |
| `AuthServiceClient` | Проверка JWT |

## Цель
- Поддержка социальных функций (подписки)
- Интеграция с `auth-service` и `nats`
- Готовность к мультисайтовости