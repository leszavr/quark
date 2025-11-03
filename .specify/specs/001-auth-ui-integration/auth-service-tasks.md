# Auth Service - Доработки для Spec 001

## 📋 Что нужно добавить/изменить

### 1. Добавить поле `username` в User entity и DTOs

**Текущее состояние**: 
- RegisterDto имеет firstName/lastName, но нет username
- LoginDto использует только email

**Требуется**:
- Добавить `username` в User entity (unique constraint)
- Добавить `username` в RegisterDto (required, validation 3-30 chars)
- Валидация: только alphanumeric + underscore
- Проверка уникальности username при регистрации

**Файлы**:
- `src/users/user.entity.ts` - добавить поле username
- `src/common/dto/auth.dto.ts` - добавить username в RegisterDto
- `src/users/users.service.ts` - добавить проверку unique username

---

### 2. Добавить поддержку `redirectUri` в Auth endpoints

**Текущее состояние**:
- AuthResponse не содержит redirectUri
- Нет whitelist проверки для безопасности

**Требуется**:
- Добавить `redirectUri?: string` в RegisterDto и LoginDto
- Добавить `redirectUri?: string` в AuthResponseDto
- Создать whitelist разрешённых доменов (env variable `REDIRECT_URI_WHITELIST`)
- Валидация redirect_uri по whitelist перед возвратом
- Возвращать redirectUri в ответе если он был передан

**Whitelist** (для начала):
```
Разрешённые домены:
- http://localhost:3000/* (quark-landing dev)
- http://localhost:3101/* (quark-ui dev)
- https://quark-ai.ru/*
- https://*.quark-ai.ru/*
```
```

**Файлы**:
- `src/common/dto/auth.dto.ts` - добавить redirectUri в DTO
- `src/auth/auth.service.ts` - добавить валидацию redirectUri
- `src/config/config.service.ts` - добавить REDIRECT_URI_WHITELIST
- `.env.example` - добавить пример whitelist

---

### 3. Добавить поддержку `rememberMe`

**Текущее состояние**:
- JWT всегда генерируется с одним сроком действия

**Требуется**:
- Добавить `rememberMe?: boolean` в LoginDto
- При rememberMe=true: token expiration = 7 дней (604800 секунд)
- По умолчанию: token expiration = 24 часа (86400 секунд)
- Обновить `generateAuthResponse()` для поддержки разных expiresIn

**Файлы**:
- `src/common/dto/auth.dto.ts` - добавить rememberMe в LoginDto
- `src/auth/auth.service.ts` - использовать rememberMe для расчёта expiration
- `src/auth/dynamic-jwt.service.ts` - поддержка custom expiresIn

---

### 4. Добавить публикацию NATS событий

**Текущее состояние**:
- События не публикуются

**Требуется**:
- Установить `@nestjs/microservices` и `nats` пакеты
- Создать NatsModule для интеграции с NATS JetStream
- Публиковать события:
  - `auth.user.registered` - после успешной регистрации
  - `auth.user.logged_in` - после успешного входа
  
**Payload структура**:
```typescript
// auth.user.registered
{
  user_id: string;
  email: string;
  username: string;
  timestamp: string; // ISO 8601
}

// auth.user.logged_in
{
  user_id: string;
  email: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}
```

**Файлы**:
- `src/nats/nats.module.ts` - новый модуль для NATS
- `src/nats/nats.service.ts` - сервис для публикации событий
- `src/auth/auth.service.ts` - вызовы natsService.publish()
- `docker-compose.yml` - убедиться что NATS доступен для auth-service

---

### 5. Улучшить валидацию пароля

**Текущее состояние**:
- MinLength(6) - слишком слабо

**Требуется**:
- MinLength(8)
- Добавить custom validator: минимум 1 цифра и 1 спецсимвол
- Добавить clear error messages для пользователя

**Файлы**:
- `src/common/validators/password.validator.ts` - новый custom validator
- `src/common/dto/auth.dto.ts` - применить validator к password полю

---

### 6. Добавить `expiresIn` в AuthResponseDto

**Текущее состояние**:
- AuthResponseDto не содержит информацию о времени действия токена

**Требуется**:
- Добавить `expires_in: number` (в секундах) в AuthResponseDto
- Добавить `token_type: string` (всегда "Bearer")

**Файлы**:
- `src/common/dto/auth.dto.ts` - обновить AuthResponseDto

---

## 🔧 Приоритезация

### P0 (Must have для MVP):
1. ✅ Добавить username field
2. ✅ Добавить redirectUri support с whitelist
3. ✅ Добавить rememberMe support
4. ✅ Добавить expiresIn в response

### P1 (Should have):
5. ✅ NATS events публикация
6. ✅ Улучшенная валидация пароля

### P2 (Nice to have, можно отложить):
- Rate limiting middleware (уже частично есть через NestJS throttler?)
- CAPTCHA после 3 неудачных попыток
- Audit logging для всех auth операций

---

## 📝 Шаги реализации

1. **Обновить User entity** - добавить username, миграция БД
2. **Обновить DTOs** - добавить все новые поля
3. **Добавить валидацию** - password validator, redirectUri whitelist
4. **Обновить AuthService** - логика rememberMe, redirectUri
5. **Интегрировать NATS** - установить пакеты, создать модуль
6. **Тестирование** - проверить все новые endpoints
7. **Обновить Swagger/OpenAPI** - добавить новые поля в документацию

---

## 🧪 Проверка текущего состояния

Нужно проверить:
- [ ] Какие пакеты уже установлены (package.json)
- [ ] Есть ли уже NATS интеграция?
- [ ] Есть ли уже rate limiting?
- [ ] Какая версия TypeORM/миграции используется?
- [ ] Есть ли уже валидаторы?

---

**Следующий шаг**: Проверить package.json и текущую структуру проекта перед началом доработок.
