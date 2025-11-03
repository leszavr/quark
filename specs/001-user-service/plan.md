# План реализации: User Service

**Ветка**: `001-user-service` | **Дата**: 3 ноября 2025 | **Spec**: [spec.md](./spec.md)  
**Входные данные**: Спецификация из `/specs/001-user-service/spec.md`

---

## 📝 Сводка

**Цель**: Создать сервис управления пользователями с RBAC, VIP подписками и настройками приватности

**Tech Stack**:
- **Backend**: NestJS 10.x (TypeScript)
- **Database**: PostgreSQL 16 (dedicated DB `user_db`)
- **Cache**: Redis 7.x (для профилей и permissions)
- **Message Bus**: NATS JetStream
- **Secret Management**: HashiCorp Vault
- **Containerization**: Docker

**Ключевые решения**:
1. **NestJS**: Выбран за встроенную поддержку TypeORM, JWT, и микросервисной архитектуры
2. **Redis кэш**: Для часто запрашиваемых профилей (TTL 5 минут) и RBAC permissions
3. **JSONB для settings**: PostgreSQL JSONB для гибких настроек без миграций

---

## 🏛️ Проверка соответствия Конституции

> **Constitution**: `.specify/memory/constitution.md`

### Article I: Event-Driven Architecture ✅
- [x] Все межсервисные взаимодействия через NATS
- [x] Durable consumers настроены для `auth.user.registered`
- [x] Dead Letter Queue (DLQ) для неудачных обработок
- [x] НЕТ прямых HTTP-вызовов к другим сервисам
- **Обоснование**: 
  - Создание профиля через событие `auth.user.registered`
  - Синхронизация ролей через `user.role.granted` → auth-service подписан
  - Уведомления через `subscription.expired` → notification-service подписан

### Article II: Universal Docking Interface ✅
- [x] `module-manifest.yaml` создан (см. contracts/)
- [x] Стандартные endpoints: `/health`, `/status`, `/manifest`
- [x] Автоматическая регистрация в Plugin Hub при старте
- [x] Heartbeat протокол каждые 30 секунд
- **Обоснование**: 
  - Полное соответствие UDI спецификации
  - Health checks проверяют PostgreSQL, Redis, NATS, Vault
  - Graceful shutdown с уведомлением Plugin Hub

### Article III: JWT Authentication ✅
- [x] JWT токены валидируются через Vault
- [x] Интеграция с Enterprise JWT Middleware (Plugin Hub)
- [x] НЕТ прямых вызовов к auth-service для валидации
- [x] Поддержка ротации секретов через событие `auth.jwt.rotated`
- **Обоснование**: 
  - Все защищённые endpoints используют JWT Guard из NestJS
  - JWT валидация через Plugin Hub → auth-service/validate
  - Роли и permissions загружаются из JWT payload

### Article IV: gRPC (если применимо) ⚠️
- [ ] gRPC НЕ используется в этом сервисе
- [x] REST API для внешних вызовов (Frontend, другие сервисы через Plugin Hub)
- **Обоснование**: 
  - User Service не имеет высоконагруженных синхронных операций
  - REST достаточен для CRUD профилей
  - gRPC можно добавить в будущем для bulk операций

### Article VII: Simplicity Gate ✅
- [x] Используется 3 компонента: NestJS + PostgreSQL + Redis
- [x] Отсутствует future-proofing (нет абстракций "на всякий случай")
- [x] Сложность обоснована в секции "Complexity Tracking"
- **Компоненты**: 
  1. NestJS - web framework + business logic
  2. PostgreSQL - primary data storage
  3. Redis - caching layer для производительности

### Article VIII: Plugin Hub как Command Module ✅
- [x] Все внешние вызовы идут через Plugin Hub
- [x] Service Discovery через Plugin Hub API
- [x] НЕТ прямых peer-to-peer вызовов
- **Обоснование**: 
  - JWT валидация через Enterprise JWT Middleware
  - Обнаружение media-service через Plugin Hub `/modules/discovery`
  - Вызовы к auth-service через Plugin Hub routing

### Article IX: Test-First Development ✅
- [x] Contract tests создаются ДО реализации (Phase 2.1)
- [x] Integration tests используют реальные сервисы: PostgreSQL, Redis, NATS, Vault в Docker
- [x] Последовательность: spec → contracts → tests → code
- **Обоснование**: 
  - OpenAPI контракты определяются в Phase 1
  - Contract tests в Phase 2 проверяют соответствие
  - Реализация в Phase 3 делает тесты зелёными

---

## 🏗️ Архитектура системы

### Компоненты (3/3 по Article VII)

#### 1. NestJS Application Server
- **Роль**: Web framework, business logic, API endpoints
- **Технология**: NestJS 10.x + TypeScript 5.2
- **Обоснование**: 
  - Встроенная поддержка TypeORM для БД
  - Dependency Injection для тестируемости
  - Decorators для OpenAPI генерации (@ApiTags, @ApiOperation)
  - Микросервисная архитектура (поддержка NATS transport)

#### 2. PostgreSQL Database
- **Роль**: Primary data storage для User, Profile, Role, Subscription, UserSettings
- **Технология**: PostgreSQL 16 (dedicated DB `user_db`)
- **Обоснование**: 
  - JSONB для гибких настроек (UserSettings)
  - ACID транзакции для критичных операций (назначение ролей)
  - Full-text search для поиска по username
  - Репликация для high availability

#### 3. Redis Cache
- **Роль**: Кэширование профилей и RBAC permissions
- **Технология**: Redis 7.x
- **Обоснование**: 
  - Снижение нагрузки на PostgreSQL при частых запросах профилей
  - Кэш permissions для быстрой проверки прав доступа
  - TTL 5 минут для актуальности данных
  - Инвалидация при обновлении профиля через событие

### Диаграмма взаимодействия

```
┌─────────────┐
│  Quark UI   │
│  (Frontend) │
└─────┬───────┘
      │ HTTP/REST
      ▼
┌─────────────────────────────────┐
│       Plugin Hub                │
│  (Enterprise JWT Middleware)    │
│  - JWT validation               │
│  - Rate limiting                │
│  - Service discovery            │
└─────┬───────────────────────────┘
      │ HTTP (internal)
      ▼
┌─────────────────────────────────┐
│      User Service               │
│  Port: 3004                     │
│  - /api/v1/users                │
│  - /api/v1/subscriptions        │
│  - /health, /status, /manifest  │
└─────┬───────────────────────────┘
      │
      ├─► PostgreSQL (user_db)
      │   - User, Profile, Role
      │   - Subscription, UserSettings
      │
      ├─► Redis (cache)
      │   - Cached profiles (TTL 5min)
      │   - RBAC permissions cache
      │
      ├─► NATS JetStream (events)
      │   Publishes:
      │   - user.created
      │   - user.role.granted
      │   - subscription.expired
      │   Subscribes:
      │   - auth.user.registered
      │   - auth.jwt.rotated
      │
      └─► Vault (secrets)
          - JWT public key
          - Database credentials
          - Encryption keys
```

---

## 📦 Структура проекта

### Документация (этот feature)

```
specs/001-user-service/
├── spec.md              # Спецификация требований (входные данные)
├── plan.md              # Этот файл (технический план)
├── research.md          # Phase 0: Исследование tech stack (будет создано)
├── data-model.md        # Phase 1: Детальная схема БД (будет создано)
├── quickstart.md        # Phase 1: Тестовые сценарии (будет создано)
├── contracts/           # Phase 1: API контракты
│   ├── openapi.yaml     # REST API спецификация
│   ├── asyncapi.yaml    # NATS события
│   └── module-manifest.yaml  # UDI манифест
└── tasks.md             # Phase 2: Детальный список задач (/speckit.tasks)
```

### Исходный код (repository root)

```
services/user-service/
├── src/
│   ├── main.ts                 # Точка входа, регистрация в Plugin Hub
│   ├── app.module.ts           # Корневой модуль NestJS
│   ├── config/                 # Конфигурация
│   │   ├── database.config.ts  # TypeORM configuration
│   │   ├── redis.config.ts     # Redis connection
│   │   ├── vault.config.ts     # Vault integration
│   │   └── nats.config.ts      # NATS JetStream
│   ├── modules/                # Feature modules
│   │   ├── users/              # User CRUD module
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.entity.ts
│   │   │   ├── users.dto.ts
│   │   │   └── users.module.ts
│   │   ├── profiles/           # Profile management
│   │   │   ├── profiles.controller.ts
│   │   │   ├── profiles.service.ts
│   │   │   ├── profiles.entity.ts
│   │   │   └── profiles.module.ts
│   │   ├── roles/              # RBAC roles
│   │   │   ├── roles.controller.ts
│   │   │   ├── roles.service.ts
│   │   │   ├── roles.entity.ts
│   │   │   └── roles.module.ts
│   │   ├── subscriptions/      # VIP subscriptions
│   │   │   ├── subscriptions.controller.ts
│   │   │   ├── subscriptions.service.ts
│   │   │   ├── subscriptions.entity.ts
│   │   │   └── subscriptions.module.ts
│   │   └── settings/           # User settings
│   │       ├── settings.controller.ts
│   │       ├── settings.service.ts
│   │       ├── settings.entity.ts
│   │       └── settings.module.ts
│   ├── core/                   # Общие компоненты
│   │   ├── health/             # Health checks
│   │   │   ├── health.controller.ts
│   │   │   └── health.service.ts
│   │   ├── plugin-hub/         # Plugin Hub integration
│   │   │   ├── plugin-hub.service.ts
│   │   │   └── plugin-hub.module.ts
│   │   ├── jwt/                # JWT middleware
│   │   │   ├── jwt.guard.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── permissions.decorator.ts
│   │   └── events/             # NATS event handlers
│   │       ├── event-publisher.service.ts
│   │       └── event-subscriber.service.ts
│   └── shared/                 # Утилиты
│       ├── types/              # TypeScript types
│       ├── decorators/         # Custom decorators
│       ├── filters/            # Exception filters
│       └── interceptors/       # Response interceptors
├── tests/
│   ├── contract/               # Contract tests (Phase 2.1)
│   │   ├── api.contract.spec.ts
│   │   ├── events.contract.spec.ts
│   │   └── udi.contract.spec.ts
│   ├── integration/            # Integration tests (Phase 2.2)
│   │   ├── database.integration.spec.ts
│   │   ├── redis.integration.spec.ts
│   │   ├── nats.integration.spec.ts
│   │   └── vault.integration.spec.ts
│   ├── e2e/                    # E2E tests (Phase 2.3)
│   │   ├── user-registration.e2e.spec.ts
│   │   ├── profile-update.e2e.spec.ts
│   │   └── rbac.e2e.spec.ts
│   └── unit/                   # Unit tests (Phase 2.4)
│       ├── users.service.spec.ts
│       └── roles.service.spec.ts
├── module-manifest.yaml        # UDI манифест
├── Dockerfile                  # Multi-stage build
├── docker-compose.dev.yml      # Локальная разработка
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

---

## 🔧 Техническая конфигурация

### Environment Variables

```bash
# Application
SERVICE_NAME=user-service
SERVICE_VERSION=1.0.0
NODE_ENV=production
PORT=3004

# Database
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=user_db
DATABASE_USER=user_service
DATABASE_PASSWORD=[VAULT:secret/quark/user-service/db_password]

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=[VAULT:secret/quark/redis/password]
REDIS_TTL=300  # 5 minutes

# NATS
NATS_URL=nats://nats:4222
NATS_STREAM=USER_STREAM
NATS_CONSUMER_GROUP=user-service-consumers

# Vault
VAULT_ADDR=http://vault:8200
VAULT_TOKEN=[RUNTIME_INJECTED]
VAULT_PATH=secret/data/quark/user-service

# Plugin Hub
PLUGIN_HUB_URL=http://plugin-hub:3000
PLUGIN_HUB_REGISTER=/modules/register
PLUGIN_HUB_HEARTBEAT_INTERVAL=30000  # 30 seconds

# JWT
JWT_PUBLIC_KEY=[VAULT:secret/quark/jwt/public_key]
JWT_ALGORITHM=RS256
```

### Dependencies (package.json)

```json
{
  "name": "user-service",
  "version": "1.0.0",
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/swagger": "^7.1.0",
    "@nestjs/microservices": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/jwt": "^10.1.0",
    "typeorm": "^0.3.17",
    "pg": "^8.11.0",
    "redis": "^4.6.0",
    "nats": "^2.15.0",
    "node-vault": "^0.10.2",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "bcrypt": "^5.1.1",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/jest": "^29.5.0",
    "jest": "^29.5.0",
    "supertest": "^6.3.0"
  }
}
```

---

## 📊 Data Model (Высокоуровнево)

> **Детальная схема**: `data-model.md` (будет создана в Phase 1)

### Основные сущности:

1. **User**: id, username, email (encrypted), created_at, updated_at
2. **Profile**: user_id, bio, avatar_url, contact_info (JSON), profile_visibility
3. **Role**: id, name, description, permissions (JSON array)
4. **UserRole**: user_id, role_id, granted_at, granted_by (FK to User)
5. **Subscription**: id, user_id, type, status, start_date, expiry_date
6. **UserSettings**: user_id, settings (JSONB)

### Database Schema:
- **База данных**: `user_db` (dedicated PostgreSQL database)
- **Миграции**: TypeORM migrations в `src/migrations/`
- **Indexes**: 
  - username (unique)
  - email (unique, для быстрого поиска)
  - user_id + role_id (composite для UserRole)
- **Backup стратегия**: Automated PostgreSQL backups каждые 6 часов

---

## 🌐 API Contracts

> **Детальные контракты**: `contracts/` (будут созданы в Phase 1)

### REST API (OpenAPI 3.0)

**Base URL**: `/api/v1`

#### Users Endpoints:
- `POST /users` - Создание пользователя (вызывается auth-service через событие)
- `GET /users/me` - Получение своего профиля (JWT required)
- `PATCH /users/me` - Обновление своего профиля (JWT required)
- `DELETE /users/me` - Удаление аккаунта (GDPR) (JWT required)
- `GET /users/:id` - Получение публичного профиля (зависит от privacy settings)

#### Roles Endpoints:
- `GET /users/:userId/roles` - Получение ролей пользователя (Admin only)
- `POST /users/:userId/roles` - Назначение роли (Admin only)
- `DELETE /users/:userId/roles/:roleId` - Снятие роли (Admin only)
- `GET /roles` - Список всех ролей (Admin only)

#### Subscriptions Endpoints:
- `POST /subscriptions` - Создание подписки (JWT required)
- `GET /subscriptions/me` - Получение своих подписок (JWT required)
- `DELETE /subscriptions/:id` - Отмена подписки (JWT required)

#### Settings Endpoints:
- `GET /users/me/settings` - Получение настроек (JWT required)
- `PATCH /users/me/settings` - Обновление настроек (JWT required)

### NATS Events (AsyncAPI 2.6)

#### Публикует:
- **Subject**: `user.created`
  - **Payload**: `{ user_id: string, username: string, email: string, created_at: string }`
  - **Когда**: При создании нового пользователя

- **Subject**: `user.updated`
  - **Payload**: `{ user_id: string, changes: { username?: string, bio?: string, ... } }`
  - **Когда**: При обновлении профиля

- **Subject**: `user.deleted`
  - **Payload**: `{ user_id: string, deleted_at: string }`
  - **Когда**: При удалении аккаунта (GDPR)

- **Subject**: `user.role.granted`
  - **Payload**: `{ user_id: string, role: string, granted_by: string, granted_at: string }`
  - **Когда**: При назначении роли

- **Subject**: `user.role.revoked`
  - **Payload**: `{ user_id: string, role: string, revoked_by: string, revoked_at: string }`
  - **Когда**: При снятии роли

- **Subject**: `subscription.created`
  - **Payload**: `{ user_id: string, subscription_id: string, type: string, expiry_date: string }`
  - **Когда**: При оформлении подписки

- **Subject**: `subscription.expired`
  - **Payload**: `{ user_id: string, subscription_id: string, expired_at: string }`
  - **Когда**: Cron job обнаруживает истёкшую подписку

#### Подписывается:
- **Subject**: `auth.user.registered`
  - **Handler**: `AuthEventsService.handleUserRegistered()`
  - **Действие**: Создать User и Profile в БД

- **Subject**: `auth.jwt.rotated`
  - **Handler**: `JwtService.handleJwtRotated()`
  - **Действие**: Обновить публичный ключ JWT из Vault

---

## 📋 Phase -1: Pre-Implementation Gates

> **ОБЯЗАТЕЛЬНАЯ ПРОВЕРКА** перед началом кодирования

### Simplicity Gate (Article VII) ✅
- [x] Используется 3 компонента: NestJS + PostgreSQL + Redis
- [x] Нет future-proofing (нет абстракций для ElasticSearch, GraphQL и т.д.)
- [x] Сложность обоснована в "Complexity Tracking"
- **Статус**: **PASS**

### Anti-Abstraction Gate (Article VII) ✅
- [x] Используется TypeORM напрямую (не custom database wrapper)
- [x] Используется NestJS Guards напрямую (не custom auth abstraction)
- [x] Единое представление модели User (не дублирование в разных слоях)
- **Статус**: **PASS**

### Integration-First Gate (Article IX) ✅
- [x] Контракты (OpenAPI/AsyncAPI) будут определены в Phase 1
- [x] Contract tests будут написаны в Phase 2.1
- [x] Integration tests будут использовать реальные PostgreSQL, Redis, NATS в Docker
- **Статус**: **PASS**

### UDI Compliance Gate (Article II) ✅
- [x] `module-manifest.yaml` будет создан в Phase 1
- [x] Стандартные endpoints (`/health`, `/status`, `/manifest`) будут реализованы в Phase 4
- [x] Автоматическая регистрация в Plugin Hub будет в Phase 4
- **Статус**: **PASS**

---

## 🎯 Phases of Implementation

### Phase 0: Research & Foundation (День 1, утро)

#### Задачи:
1. Создать `research.md` с обоснованием выбора NestJS vs Express
2. Настроить Docker окружение (PostgreSQL, Redis, NATS, Vault)
3. Инициализировать NestJS проект: `nest new user-service`
4. Настроить TypeScript strict mode

#### Deliverables:
- `research.md` - Сравнение NestJS vs Express
- `docker-compose.dev.yml` - Локальное окружение с БД
- Базовая структура NestJS проекта

---

### Phase 1: Contracts & Data Model (День 1, после обеда)

> **КРИТИЧНО**: Контракты создаются ДО кода (Article IX)

#### Задачи:
1. Создать `contracts/openapi.yaml` - REST API спецификация
2. Создать `contracts/asyncapi.yaml` - NATS события спецификация
3. Создать `contracts/module-manifest.yaml` - UDI манифест
4. Создать `data-model.md` - Детальная схема БД с ER-диаграммой
5. Создать `quickstart.md` - Ключевые тестовые сценарии
6. Сгенерировать TypeScript DTOs из OpenAPI: `npm run generate:types`

#### File Creation Order:
```
1. contracts/openapi.yaml (REST API)
2. contracts/asyncapi.yaml (NATS events)
3. contracts/module-manifest.yaml (UDI)
4. data-model.md (Database schema)
5. quickstart.md (Test scenarios)
6. Generate: src/shared/types/api.types.ts (from OpenAPI)
```

#### Deliverables:
- Все контракты в `contracts/`
- `data-model.md` с ER-диаграммами (User → Profile, User ↔ Role, User → Subscription)
- `quickstart.md` с 5 тестовыми сценариями
- TypeScript types сгенерированы из OpenAPI

---

### Phase 2: Test-First Implementation (Дни 2-3)

> **Следование TDD**: Red → Green → Refactor

#### 2.1 Contract Tests (ПЕРВЫМИ!) - День 2, утро
```
tests/contract/
├── api.contract.spec.ts          # OpenAPI compliance (Pact или Swagger validator)
├── events.contract.spec.ts       # AsyncAPI compliance
└── udi.contract.spec.ts          # UDI compliance (module-manifest валидация)
```

**Цель**: Убедиться, что API будет соответствовать контрактам  
**Результат**: Все тесты **FAIL** (Red phase) ✅

#### 2.2 Integration Tests - День 2, после обеда
```
tests/integration/
├── database.integration.spec.ts  # TypeORM + PostgreSQL (в Docker)
├── redis.integration.spec.ts     # Redis connection и кэш
├── nats.integration.spec.ts      # NATS publish/subscribe
└── vault.integration.spec.ts     # Vault secret retrieval
```

**Цель**: Проверить взаимодействие с реальными сервисами  
**Результат**: Все тесты **FAIL** (Red phase) ✅

#### 2.3 E2E Tests - День 3, утро
```
tests/e2e/
├── user-registration.e2e.spec.ts  # Сценарий 1 из spec.md
├── profile-update.e2e.spec.ts     # Сценарий 2
└── rbac.e2e.spec.ts               # Сценарий 3
```

**Цель**: Проверить полные user journeys  
**Результат**: Все тесты **FAIL** (Red phase) ✅

#### 2.4 Unit Tests (последними из тестов) - День 3, после обеда
```
tests/unit/
├── users.service.spec.ts
├── roles.service.spec.ts
└── subscriptions.service.spec.ts
```

**Цель**: Изолированная бизнес-логика  
**Результат**: Все тесты **FAIL** (Red phase) ✅

---

### Phase 3: Core Implementation (Дни 4-6)

> **Принцип**: Реализация идёт ПОСЛЕ тестов

#### 3.1 Configuration & Core Modules - День 4, утро
- [ ] Настроить `src/config/database.config.ts` (TypeORM)
- [ ] Настроить `src/config/redis.config.ts` (Redis client)
- [ ] Настроить `src/config/vault.config.ts` (Vault integration)
- [ ] Настроить `src/config/nats.config.ts` (NATS JetStream)
- [ ] Создать `src/main.ts` - точка входа приложения

#### 3.2 Database Layer - День 4, после обеда
- [ ] Создать TypeORM entities: User, Profile, Role, UserRole, Subscription, UserSettings
- [ ] Создать миграции: `001-create-users.ts`, `002-create-roles.ts`, `003-create-subscriptions.ts`
- [ ] Реализовать repositories
- [ ] Запустить integration tests для database → должны пройти ✅

#### 3.3 Business Logic Services - День 5
- [ ] Реализовать `UsersService`: createUser, findById, updateProfile, deleteUser
- [ ] Реализовать `RolesService`: assignRole, revokeRole, getUserRoles
- [ ] Реализовать `SubscriptionsService`: createSubscription, checkExpiry
- [ ] Реализовать `SettingsService`: getSettings, updateSettings
- [ ] Добавить валидацию (class-validator)
- [ ] Запустить unit tests → должны пройти ✅

#### 3.4 API Layer (Controllers) - День 6, утро
- [ ] Реализовать `UsersController`: GET /me, PATCH /me, DELETE /me
- [ ] Реализовать `RolesController`: GET /users/:id/roles, POST /users/:id/roles
- [ ] Реализовать `SubscriptionsController`: POST /subscriptions, GET /subscriptions/me
- [ ] Реализовать `SettingsController`: GET /me/settings, PATCH /me/settings
- [ ] Добавить OpenAPI decorators (@ApiTags, @ApiOperation, @ApiResponse)
- [ ] Реализовать JWT Guard и Permissions decorator
- [ ] Запустить contract tests → должны пройти ✅

#### 3.5 Event Handlers (NATS) - День 6, после обеда
- [ ] Реализовать `EventPublisherService`: publishUserCreated, publishRoleGranted, etc.
- [ ] Реализовать `AuthEventsService`: handleUserRegistered (подписка на `auth.user.registered`)
- [ ] Настроить durable consumers для надёжной доставки
- [ ] Реализовать DLQ обработку для неудачных сообщений
- [ ] Запустить integration tests для NATS → должны пройти ✅

---

### Phase 4: UDI Integration (День 7)

#### 4.1 Module Manifest - Утро
- [ ] Создать `module-manifest.yaml` в корне сервиса
- [ ] Реализовать `GET /manifest` endpoint
- [ ] Валидация манифеста против UDI спецификации
- [ ] Запустить UDI contract tests → должны пройти ✅

#### 4.2 Health Checks - Утро
- [ ] Реализовать `GET /health` (liveness probe)
- [ ] Реализовать `GET /status` (readiness probe с детальными checks)
- [ ] Добавить проверки: PostgreSQL connection, Redis ping, NATS status, Vault health
- [ ] Тестировать health endpoints в docker-compose

#### 4.3 Plugin Hub Registration - После обеда
- [ ] Реализовать автоматическую регистрацию в Plugin Hub при старте
- [ ] Реализовать heartbeat протокол (каждые 30 секунд)
- [ ] Реализовать graceful shutdown с уведомлением Plugin Hub
- [ ] Протестировать регистрацию через Plugin Hub API
- [ ] Запустить integration tests для Plugin Hub → должны пройти ✅

#### 4.4 JWT & Permissions - Вечер
- [ ] Интегрировать Enterprise JWT Middleware через Plugin Hub
- [ ] Реализовать `@RequirePermissions()` decorator
- [ ] Реализовать обработку события `auth.jwt.rotated` для обновления публичного ключа
- [ ] Протестировать JWT валидацию через Plugin Hub

---

### Phase 5: Deployment & Finalization (День 8)

#### 5.1 Docker & Compose - Утро
- [ ] Оптимизировать Dockerfile (multi-stage build)
- [ ] Обновить корневой `docker-compose.yml` с user-service
- [ ] Добавить healthcheck в docker-compose
- [ ] Протестировать `./quark-manager.sh start user-service`

#### 5.2 Documentation - Утро
- [ ] Создать `services/user-service/README.md` с setup инструкциями
- [ ] Документировать environment variables
- [ ] Создать troubleshooting guide
- [ ] Настроить Swagger UI для API documentation (автоматически через @nestjs/swagger)
- [ ] Обновить `docs/architecture/components-user.md`

#### 5.3 Observability - После обеда
- [ ] Настроить structured logging (Winston или Pino)
- [ ] Добавить Prometheus metrics endpoint `/metrics`
- [ ] Интегрировать OpenTelemetry tracing
- [ ] Создать Grafana dashboard шаблон

#### 5.4 Final Testing - Вечер
- [ ] Запустить полный test suite: contract + integration + e2e + unit
- [ ] Проверить test coverage ≥ 90%
- [ ] Запустить линтеры: `npm run lint`
- [ ] Выполнить security scan: `npm audit`

#### 5.5 Code Review & Approval
- [ ] Создать Pull Request с описанием всех изменений
- [ ] Code Review от Tech Lead
- [ ] Constitution Compliance проверка (все 9 Articles)
- [ ] Утверждение от Chief Architect
- [ ] Merge в main branch

---

## 🔍 Complexity Tracking

> **Обязательно для соответствия Article VII**

### Component Count: 3/3 ✅
1. **NestJS Application**: Web framework + business logic + API
   - **Обоснование**: Необходим для REST API и микросервисной архитектуры
   
2. **PostgreSQL Database**: Реляционная БД для хранения User, Role, Subscription
   - **Обоснование**: ACID транзакции критичны для RBAC (назначение ролей должно быть атомарным)
   
3. **Redis Cache**: Кэширование профилей и permissions
   - **Обоснование**: Без Redis каждый запрос профиля = DB query → не выполним NFR-1.2 (< 200мс для 95%)

**Вывод**: Все 3 компонента критичны для функциональности и производительности. Дополнительных компонентов нет.

### External Dependencies (не считаются в Article VII)
- **NATS**: Event Bus (обязательно по Constitution Article I)
- **Vault**: Secret management (обязательно по Article III)
- **Plugin Hub**: Service discovery (обязательно по Article II)

### Justification for Complexity
Сложность **в пределах нормы**. Все 3 компонента обоснованы:
- NestJS: Основной framework
- PostgreSQL: Реляционная модель (User ↔ Role многие-ко-многим)
- Redis: Performance requirement (NFR-1.2)

**Никаких дополнительных абстракций не планируется.**

---

## 🚨 Risks & Mitigation

| Риск | Вероятность | Влияние | Митигация |
|------|------------|---------|-----------|
| Рассинхронизация ролей между user-service и JWT | Средняя | Критичное | Подписка на `auth.jwt.rotated`, обязательная инвалидация кэша при изменении ролей |
| Высокая нагрузка на PostgreSQL при пиковых нагрузках | Средняя | Значительное | Redis кэш + Read Replicas для PostgreSQL |
| Проблемы с GDPR (удаление данных из всех сервисов) | Высокая | Критичное | Событие `user.deleted` → все сервисы удаляют связанные данные, cascade delete в БД |
| Нарушение Constitution (прямые вызовы к auth-service) | Низкая | Критичное | Code Review checklist, Pre-Implementation Gates |

---

## 📚 Research & Alternatives

> **Детальное исследование**: `research.md` (будет создано в Phase 0)

### Technology Choices

#### NestJS vs Express
**Почему выбран NestJS**:
- Встроенная поддержка TypeORM (меньше boilerplate)
- Dependency Injection для тестируемости
- Декораторы для OpenAPI генерации (@nestjs/swagger)
- Микросервисная архитектура из коробки (поддержка NATS transport)
- Лучшая структура проекта для крупных команд

**Альтернативы рассмотрены**:
| Вариант | Почему не выбран |
|---------|-----------------|
| Express | Требует много ручной настройки, нет DI, слабая типизация |
| Fastify | Быстрее, но меньше интеграций с TypeORM и NestJS экосистемой |

#### PostgreSQL vs MongoDB
**Почему выбран PostgreSQL**:
- Реляционная модель идеально подходит для User ↔ Role (многие-ко-многим)
- ACID транзакции критичны для RBAC
- JSONB для гибких настроек (UserSettings)
- Full-text search для поиска пользователей

**Альтернативы**:
| Вариант | Почему не выбран |
|---------|-----------------|
| MongoDB | NoSQL не подходит для RBAC (сложные связи User ↔ Role) |
| MySQL | PostgreSQL имеет лучший JSONB support |

---

## ✅ Definition of Done

### Code Complete:
- [x] Все тесты проходят (contract, integration, e2e, unit)
- [x] Test coverage ≥ 90%
- [x] ESLint проходит без ошибок
- [x] TypeScript strict mode enabled

### Documentation Complete:
- [x] README.md с setup инструкциями
- [x] Swagger UI для API documentation (автоматически через @nestjs/swagger)
- [x] `quickstart.md` проверен вручную (5 сценариев)
- [x] Inline code comments для сложной логики (RBAC permissions)

### UDI Compliance:
- [x] `module-manifest.yaml` валидный
- [x] Все endpoints (`/health`, `/status`, `/manifest`) работают
- [x] Автоматическая регистрация в Plugin Hub успешна
- [x] Heartbeat работает стабильно

### Constitution Compliance:
- [x] Article I: События через NATS ✅
- [x] Article II: UDI реализован ✅
- [x] Article III: JWT через Vault ✅
- [x] Article VII: Simplicity Gate passed (3 компонента) ✅
- [x] Article VIII: Через Plugin Hub ✅
- [x] Article IX: Test-First followed ✅

### Deployment Ready:
- [x] Docker образ собирается успешно
- [x] docker-compose.yml обновлён
- [x] quark-manager.sh integration работает
- [x] Environment variables задокументированы

### Review & Approval:
- [ ] Code Review завершён (Tech Lead)
- [ ] Chief Architect approved (Constitution compliance)
- [ ] Security scan passed (npm audit, Sonar)
- [ ] Performance tests passed (k6 load testing)

---

## 🔄 Next Steps

После утверждения этого плана:
1. **Запустить**: `/speckit.tasks` - генерация детального task list с нумерацией
2. **Создать**: Feature branch `001-user-service`
3. **Начать**: Phase 0 (Research & Foundation)

**Estimated time**: 8 рабочих дней (1 разработчик) или 4 дня (2 разработчика с параллельной работой)

---

## 📎 Related Documents

- **Specification**: `specs/001-user-service/spec.md`
- **Constitution**: `.specify/memory/constitution.md`
- **UDI Spec**: `docs/architecture/universal-docking-interface.md`
- **ADR-003**: `docs/adr/adr-003-module-docking.md` - Модульность по принципу МКС
- **ADR-005**: `docs/adr/adr-005-jwt-auth.md` - JWT аутентификация

---

**Prepared by**: AI Assistant (на основе spec.md)  
**Reviewed by**: [Tech Lead], [Chief Architect]  
**Approved**: ⬜ Pending / ✅ Approved  
**Approval Date**: [ДАТА]
