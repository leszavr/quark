# 📋 API Endpoints Reference - Quark Platform

**Версия:** 1.0.0  
**Дата обновления:** 4 октября 2025  
**Базовый URL:** `http://api.quark.local` (через Traefik API Gateway)

## 🔗 Общие принципы

- Все API запросы проходят через **Traefik API Gateway** на домене `api.quark.local`
- Защищенные endpoints требуют **JWT токен** в заголовке `Authorization: Bearer <token>`
- Формат ответов: **JSON**
- Кодировка: **UTF-8**

---

## 🔐 Authentication Service (Port: 3001)

### Публичные endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Регистрация нового пользователя | ❌ |
| `POST` | `/auth/login` | Авторизация пользователя | ❌ |
| `GET` | `/auth/health` | Health check сервиса | ❌ |

#### Примеры запросов:

**Регистрация:**
```bash
curl -X POST -H "Host: api.quark.local" -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass123!", "firstName": "John", "lastName": "Doe"}' \
  http://localhost/auth/register
```

**Авторизация:**
```bash
curl -X POST -H "Host: api.quark.local" -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass123!"}' \
  http://localhost/auth/login
```

### Защищенные endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/auth/profile` | Получить профиль текущего пользователя | ✅ |
| `POST` | `/auth/validate` | Валидация JWT токена (для middleware) | ✅ |
| `POST` | `/auth/logout` | Выход из системы | ✅ |

---

## 📝 Blog Service (Port: 3004)

**Base Path:** `/blog` (через Traefik strip prefix)

### Публичные endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/blog/health` | Health check сервиса | ❌ |
| `GET` | `/blog/api/posts` | Получить все опубликованные посты | ❌* |
| `GET` | `/blog/api/posts/:id` | Получить конкретный пост | ❌* |

**\*Примечание:** В текущей конфигурации все endpoints требуют аутентификации из-за middleware

### Защищенные endpoints

| Method | Endpoint | Description | Auth Required | Permissions |
|--------|----------|-------------|---------------|-------------|
| `POST` | `/blog/api/posts` | Создать новый пост | ✅ | `blog.write` |
| `PUT` | `/blog/api/posts/:id` | Обновить существующий пост | ✅ | `blog.write` |
| `DELETE` | `/blog/api/posts/:id` | Удалить пост | ✅ | `blog.delete` |
| `GET` | `/blog/api/my-posts` | Получить посты текущего пользователя | ✅ | - |

#### Примеры запросов:

**Создание поста:**
```bash
curl -X POST -H "Host: api.quark.local" -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Мой пост", "content": "Содержание поста", "status": "published"}' \
  http://localhost/blog/api/posts
```

**Получение постов:**
```bash
curl -H "Host: api.quark.local" -H "Authorization: Bearer <JWT_TOKEN>" \
  http://localhost/blog/api/posts
```

---

## 🔌 Plugin Hub (Port: 3000)

**Base Path:** `/hub` (через Traefik strip prefix)

### Системные endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/hub/health` | Health check Plugin Hub | ❌ |
| `GET` | `/hub/api/services` | Список зарегистрированных сервисов | ✅ |
| `POST` | `/hub/api/services/register` | Регистрация нового сервиса | ✅ |
| `DELETE` | `/hub/api/services/:id` | Удаление сервиса | ✅ |

---

## 📊 Monitoring Dashboard (Port: 3900)

**Domain:** `monitor.quark.local`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/` | Панель мониторинга | ❌ |
| `GET` | `/api/metrics` | Метрики системы | ❌ |
| `GET` | `/health` | Health check | ❌ |

#### Пример:
```bash
curl -H "Host: monitor.quark.local" http://localhost/api/metrics
```

---

## 🖥️ Quark UI (Port: 3100)

**Domain:** `admin.quark.local` или `localhost`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/` | Административная панель | ❌ |
| `GET` | `/health` | Health check | ❌ |

---

## 🔧 Utility Endpoints

### Traefik Dashboard
- **URL:** `http://localhost:8080/dashboard/`
- **API:** `http://localhost:8080/api/http/routers`

### Health Checks для всех сервисов:
```bash
# Auth Service
curl -H "Host: api.quark.local" http://localhost/auth/health

# Blog Service  
curl -H "Host: api.quark.local" http://localhost/blog/health

# Plugin Hub
curl -H "Host: api.quark.local" http://localhost/hub/health

# Monitoring
curl -H "Host: monitor.quark.local" http://localhost/health

# Quark UI
curl -H "Host: admin.quark.local" http://localhost/health
```

---

## 🛠️ Типовые схемы данных

### User Registration/Login
```json
{
  "email": "string (required)",
  "password": "string (required, min 6 chars)",
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "phone": "string (optional)"
}
```

### Blog Post Creation
```json
{
  "title": "string (required, max 150 chars)",
  "content": "string (required)",
  "status": "draft|published (default: draft)",
  "authorId": "string (auto-filled from JWT)"
}
```

### JWT Token Response
```json
{
  "access_token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "roles": ["string"],
    "isEmailVerified": "boolean"
  }
}
```

---

## 🔍 Troubleshooting

### Частые проблемы:

1. **403 Forbidden на публичных endpoints**
   - Проблема: auth-jwt middleware блокирует все запросы
   - Решение: Проверить конфигурацию Traefik middleware

2. **401 Unauthorized с валидным токеном**
   - Проблема: ForwardAuth не настроен или auth-service недоступен
   - Решение: Проверить `/auth/validate` endpoint

3. **404 Not Found**
   - Проблема: Неправильный path или service не зарегистрирован в Traefik
   - Решение: Проверить `docker compose ps` и Traefik dashboard

### Полезные команды диагностики:
```bash
# Проверить статус всех сервисов
docker compose ps

# Посмотреть зарегистрированные роуты в Traefik
curl -s http://localhost:8080/api/http/routers | jq '.[].rule'

# Проверить JWT токен
echo "JWT_TOKEN" | base64 -d

# Логи конкретного сервиса
docker compose logs auth-service --tail=20
```

---

## �️ Swagger UI - Интерактивная документация

**URL:** `http://docs.quark.local` или `http://localhost:8081`

Swagger UI предоставляет интерактивную документацию для всех API endpoints платформы:

- ✅ **Тестирование API** прямо в браузере
- ✅ **JWT аутентификация** - вставьте токен в поле Authorization 
- ✅ **Примеры запросов** и схемы данных
- ✅ **Валидация ответов** в реальном времени

### Как использовать:

1. Откройте http://docs.quark.local
2. Нажмите **"Authorize"** в правом верхнем углу
3. Вставьте JWT токен в формате: `Bearer your-token-here`
4. Тестируйте любые endpoints через кнопку **"Try it out"**

---

## �📚 Дополнительные ресурсы

- **Swagger UI:** `http://docs.quark.local` - интерактивная документация API
- **OpenAPI спецификация:** `/var/www/quark/infra/swagger.yaml`
- **Архитектурная документация:** `/var/www/quark/docs/architecture/`
- **Примеры интеграции:** `/var/www/quark/docs/examples/`

---

**Последнее обновление:** 4 октября 2025  
**Статус:** ✅ Актуально для текущей версии платформы