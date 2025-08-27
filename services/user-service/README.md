# User Service

Управление профилями, подписками и настройками пользователей.

## Функции
- Публичные и приватные профили
- Подписки (following/followers)
- Аватары, био, настройки
- Интеграция с auth-service (JWT)

## API
Swagger: `/docs`

## Зависимости
- PostgreSQL
- auth-service (JWT)
- media-service (аватары)

## Порты
- Сервис запускается на порту 3002

## Запуск

### Локальная разработка
```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 3002
```

### Docker
```bash
docker build -t user-service .
docker run -p 3002:3002 user-service
```