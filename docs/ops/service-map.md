# Service Map: Зависимости сервисов

## Описание
Визуализация взаимодействия между сервисами.

```mermaid
graph TD
    A[Web App] --> B[API Gateway]
    C[Mobile App] --> B
    D[Admin Panel] --> B

    B --> E[Auth Service]
    B --> F[BFF]
    F --> G[Blog Service]
    F --> H[Messaging Service]
    F --> I[AI Orchestrator]

    G --> J[NATS]
    H --> J
    I --> J

    J --> K[Search Service]
    J --> L[Notification Service]
    J --> M[AI Ops Agent]

    L --> N[Email Service]
    L --> O[WebSocket]

    style E fill:#FF9800
    style G fill:#3F51B5
    style I fill:#E91E63
    style J fill:#00BCD4
```

## Типы зависимостей
| Тип | Пример |
|-----|-------|
| HTTP | BFF → Blog Service |
| WebSocket | Messaging → Пользователь |
| NATS | Blog → Search |
| gRPC | AI Orchestrator → AI Writer |