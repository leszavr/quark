# C4 Model: Container Diagram (Level 2)

## Описание
Показывает **основные контейнеры (сервисы)** внутри системы Quark и их взаимодействие.

```mermaid
C4Container
    title Container Diagram for Quark

    Person(user, "Пользователь", "Конечный пользователь")
    Person(admin, "Администратор", "Управление системой")

    System_Boundary(quark, "Quark Platform") {
        Container(web_app, "Web App", "Next.js", "Веб-интерфейс")
        Container(mobile_app, "Mobile App", "React Native", "Мобильные клиенты")
        Container(gateway, "API Gateway", "Traefik", "Маршрутизация, аутентификация")
        Container(auth_service, "Auth Service", "FastAPI", "Регистрация, JWT")
        Container(user_service, "User Service", "NestJS", "Профили, подписки")
        Container(blog_service, "Blog Service", "NestJS", "CRUD постов, мультисайтовость")
        Container(messaging_service, "Messaging Service", "NestJS + WebSocket", "Диалоги, статусы")
        Container(ai_orchestrator, "AI Orchestrator", "FastAPI + LangChain", "Управление ИИ-агентами")
        Container(plugin_hub, "Plugin Hub", "FastAPI", "Управление сторонними модулями")
        Container(notification_service, "Notification Service", "FastAPI", "Push, email, in-app")
        Container(search_service, "Search Service", "FastAPI + Elasticsearch", "Поиск по контенту")
        Container(monitoring, "OpenTelemetry Collector", "OTel", "Сбор метрик, трейсов, логов")
        Container(event_bus, "Event Bus", "NATS JetStream", "Асинхронная коммуникация")

        Rel(gateway, auth_service, "HTTP")
        Rel(gateway, blog_service, "HTTP")
        Rel(gateway, messaging_service, "WebSocket")
        Rel(gateway, ai_orchestrator, "HTTP")
        Rel(auth_service, user_service, "JWT validation")
        Rel(blog_service, event_bus, "post.published")
        Rel(messaging_service, event_bus, "message.sent")
        Rel(ai_orchestrator, event_bus, "ai.response.generated")
        Rel(event_bus, search_service, "index.update")
        Rel(event_bus, notification_service, "notification.create")
        Rel(plugin_hub, event_bus, "module.loaded")
        Rel(monitoring, event_bus, "telemetry")
    }

    Rel(user, web_app, "HTTPS")
    Rel(user, mobile_app, "HTTPS")
    Rel(admin, gateway, "Admin API")
    Rel(web_app, gateway, "API calls")
    Rel(mobile_app, gateway, "API calls")
```

## Контейнеры
Каждый контейнер — это **автономный сервис** с собственной технологией и ответственностью.

## Взаимодействие
- Все запросы идут через **API Gateway**
- Сервисы общаются через **Event Bus (NATS)**
- **OpenTelemetry** собирает данные со всех сервисов

## Цель
- Показать внутреннюю структуру системы
- Обозначить границы сервисов
- Подготовить почву для Component Diagrams