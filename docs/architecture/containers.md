# Container Diagram

## Контейнеры

| Контейнер         | Технология           | Описание                      |
|-------------------|----------------------|-------------------------------|
| Web App           | Next.js              | Веб-интерфейс                 |
| Mobile App        | React Native         | Мобильные клиенты 			   |
| API Gateway       | Traefik              | Маршрутизация, аутентификация |
| Auth Service      | FastAPI              | Регистрация, JWT 			   |
| Blog Service      | NestJS               | CRUD постов, профили		   |
| Messaging Service | NestJS + WebSocket   | Диалоги, статусы 			   |
| AI Orchestrator   | FastAPI + LangChain  | Управление ИИ-агентами 	   |
| Plugin Hub        | FastAPI              | Управление модулями 		   |
| NATS | JetStream  | Event Bus            |                               |
| PostgreSQL        | 15                   | Основная БД 				   |
| Redis             | 7                    | Кэш, сессии, онлайн-статус    |
| MinIO             | S3-compatible        | Хранение медиа 			   |
| Grafana           | + OTel               | Мониторинг					   |

## Взаимодействие
- Все запросы → API Gateway → нужный сервис
- Сервисы общаются через NATS
- Данные хранятся в изолированных БД