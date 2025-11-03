# План реализации: [НАЗВАНИЕ СЕРВИСА]

**Ветка**: `[###-название-сервиса]` | **Дата**: [ДАТА] | **Spec**: [ссылка]  
**Входные данные**: Спецификация из `/specs/[###-название-сервиса]/spec.md`

---

## 📝 Сводка

**Цель**: [Краткое описание того, что строим]

**Tech Stack**:
- **Backend**: [фреймворк] ([язык])
- **Database**: [тип БД]
- **Message Bus**: NATS JetStream
- **Secret Management**: HashiCorp Vault
- **Containerization**: Docker

**Ключевые решения**:
1. [Решение 1]: [обоснование]
2. [Решение 2]: [обоснование]

---

## 🏛️ Проверка соответствия Конституции

> **Constitution**: `.specify/memory/constitution.md`

### Article I: Event-Driven Architecture ✅
- [ ] Все межсервисные взаимодействия через NATS
- [ ] Durable consumers настроены
- [ ] Dead Letter Queue (DLQ) реализована
- [ ] НЕТ прямых HTTP-вызовов к другим сервисам
- **Обоснование**: [как соблюдается]

### Article II: Universal Docking Interface ✅
- [ ] `module-manifest.yaml` создан
- [ ] Стандартные endpoints: `/health`, `/status`, `/manifest`
- [ ] Автоматическая регистрация в Plugin Hub
- [ ] Heartbeat протокол реализован
- **Обоснование**: [детали реализации UDI]

### Article III: JWT Authentication ✅
- [ ] JWT токены валидируются через Vault
- [ ] Интеграция с Enterprise JWT Middleware (Plugin Hub)
- [ ] НЕТ прямых вызовов к auth-service
- [ ] Поддержка ротации секретов
- **Обоснование**: [как JWT интегрируется]

### Article IV: gRPC (если применимо) ⚠️
- [ ] gRPC используется для синхронных internal вызовов
- [ ] `.proto` файлы созданы
- [ ] REST остаётся для внешнего API
- **Обоснование**: [нужен ли gRPC в этом сервисе]

### Article VII: Simplicity Gate ✅
- [ ] Используется ≤3 основных компонента
- [ ] Отсутствует future-proofing
- [ ] Сложность обоснована в секции "Complexity Tracking"
- **Компоненты**: [перечислить все компоненты]

### Article VIII: Plugin Hub как Command Module ✅
- [ ] Все внешние вызовы идут через Plugin Hub
- [ ] Service Discovery через Plugin Hub
- [ ] НЕТ прямых peer-to-peer вызовов
- **Обоснование**: [архитектура взаимодействия]

### Article IX: Test-First Development ✅
- [ ] Contract tests создаются ДО реализации
- [ ] Integration tests используют реальные сервисы (не mocks)
- [ ] Последовательность: spec → contracts → tests → code
- **Обоснование**: [тестовая стратегия]

---

## 🏗️ Архитектура системы

### Компоненты (≤3 по Article VII)

#### 1. [Компонент 1]: [Название]
- **Роль**: [назначение компонента]
- **Технология**: [конкретная tech]
- **Обоснование**: [почему выбран]

#### 2. [Компонент 2]: [Название]
- **Роль**: [назначение]
- **Технология**: [tech]
- **Обоснование**: [обоснование выбора]

#### 3. [Компонент 3]: [Название]
- **Роль**: [назначение]
- **Технология**: [tech]
- **Обоснование**: [обоснование]

> ⚠️ **Если компонентов > 3**: Требуется обоснование в секции "Complexity Tracking"

### Диаграмма взаимодействия

```
┌─────────────┐
│   Frontend  │
└─────┬───────┘
      │ HTTP/REST
      ▼
┌─────────────────────────────────┐
│       Plugin Hub                │
│  (Enterprise JWT Middleware)    │
└─────┬───────────────────────────┘
      │ Internal gRPC/HTTP
      ▼
┌─────────────────────────────────┐
│   [Этот сервис]                 │
│   - module-manifest.yaml        │
│   - /health, /status, /manifest │
└─────┬───────────────────────────┘
      │
      ├─► PostgreSQL (Database)
      ├─► NATS (Events)
      └─► Vault (Secrets)
```

---

## 📦 Структура проекта

### Документация (этот feature)

```
specs/[###-название-сервиса]/
├── spec.md              # Этот файл (вход для /speckit.plan)
├── plan.md              # План (выход команды /speckit.plan)
├── research.md          # Phase 0 вывод (исследование tech stack)
├── data-model.md        # Phase 1 вывод (схема БД)
├── quickstart.md        # Phase 1 вывод (тестовые сценарии)
├── contracts/           # Phase 1 вывод (API контракты)
│   ├── openapi.yaml     # REST API спецификация
│   ├── asyncapi.yaml    # NATS события
│   ├── grpc/            # gRPC .proto файлы (если применимо)
│   └── module-manifest.yaml  # UDI манифест
└── tasks.md             # Phase 2 вывод (/speckit.tasks - НЕ создаётся /speckit.plan)
```

### Исходный код (repository root)

```
services/[название-сервиса]/
├── src/
│   ├── main.ts                 # Точка входа
│   ├── config/                 # Конфигурация
│   │   ├── database.config.ts
│   │   ├── vault.config.ts
│   │   └── nats.config.ts
│   ├── modules/                # Модули приложения
│   │   ├── [entity]/
│   │   │   ├── [entity].controller.ts
│   │   │   ├── [entity].service.ts
│   │   │   ├── [entity].entity.ts
│   │   │   └── [entity].module.ts
│   │   └── ...
│   ├── core/                   # Общие компоненты
│   │   ├── health/             # Health checks
│   │   ├── plugin-hub/         # Plugin Hub integration
│   │   ├── jwt/                # JWT middleware
│   │   └── events/             # NATS event handlers
│   └── shared/                 # Утилиты
│       ├── types/
│       ├── decorators/
│       └── utils/
├── tests/
│   ├── contract/               # Contract tests (создаются ПЕРВЫМИ)
│   ├── integration/            # Integration tests
│   ├── e2e/                    # E2E tests
│   └── unit/                   # Unit tests (последние)
├── module-manifest.yaml        # UDI манифест
├── Dockerfile                  # Multi-stage build
├── docker-compose.dev.yml      # Локальная разработка
└── package.json
```

---

## 🔧 Техническая конфигурация

### Environment Variables

```bash
# Application
SERVICE_NAME=[название-сервиса]
SERVICE_VERSION=1.0.0
NODE_ENV=production
PORT=3XXX

# Database
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=[db_name]
DATABASE_USER=[VAULT_PATH]
DATABASE_PASSWORD=[VAULT_PATH]

# NATS
NATS_URL=nats://nats:4222
NATS_STREAM=[STREAM_NAME]

# Vault
VAULT_ADDR=http://vault:8200
VAULT_TOKEN=[RUNTIME_INJECTED]
VAULT_PATH=secret/data/quark/[service]

# Plugin Hub
PLUGIN_HUB_URL=http://plugin-hub:3000
PLUGIN_HUB_REGISTER=/modules/register
PLUGIN_HUB_HEARTBEAT_INTERVAL=30000
```

### Dependencies (package.json)

```json
{
  "dependencies": {
    "@nestjs/core": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "typeorm": "^0.3.0",
    "pg": "^8.11.0",
    "nats": "^2.15.0",
    "node-vault": "^0.10.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0"
  }
}
```

---

## 📊 Data Model (Высокоуровнево)

> **Детальная схема**: `data-model.md`

### Основные сущности:
1. **[Entity1]**: [краткое описание]
2. **[Entity2]**: [краткое описание]

### Database Schema:
- **База данных**: `[db_name]`
- **Миграции**: TypeORM migrations
- **Backup стратегия**: Automated PostgreSQL backups

---

## 🌐 API Contracts

> **Детальные контракты**: `contracts/`

### REST API (OpenAPI)

**Base URL**: `/api/v1/[service]`

#### Endpoints:
- `POST /[resource]` - [описание]
- `GET /[resource]/:id` - [описание]
- `PUT /[resource]/:id` - [описание]
- `DELETE /[resource]/:id` - [описание]

### NATS Events (AsyncAPI)

#### Публикует:
- **Subject**: `[service].[entity].created`
  - **Payload**: `{ id, ...data }`
  - **Когда**: При создании [entity]

- **Subject**: `[service].[entity].updated`
  - **Payload**: `{ id, changes }`
  - **Когда**: При обновлении [entity]

#### Подписывается:
- **Subject**: `[other-service].[event]`
  - **Handler**: `handle[Event]`
  - **Действие**: [что делает]

### gRPC (если применимо)

**Proto file**: `contracts/grpc/[service].proto`

```protobuf
service [ServiceName] {
  rpc [Method](Request) returns (Response);
}
```

---

## 📋 Phase -1: Pre-Implementation Gates

> **ОБЯЗАТЕЛЬНАЯ ПРОВЕРКА** перед началом кодирования

### Simplicity Gate (Article VII) ✅
- [ ] Используется ≤3 основных компонентов?
- [ ] Нет future-proofing?
- [ ] Сложность обоснована?
- **Статус**: [PASS/FAIL/NEEDS_REVIEW]

### Anti-Abstraction Gate (Article VII) ✅
- [ ] Используются фреймворки напрямую (не custom wrappers)?
- [ ] Единое представление модели данных (не дублирование)?
- **Статус**: [PASS/FAIL]

### Integration-First Gate (Article IX) ✅
- [ ] Контракты (OpenAPI/AsyncAPI) определены?
- [ ] Contract tests написаны?
- [ ] Integration tests используют реальные сервисы?
- **Статус**: [PASS/FAIL]

### UDI Compliance Gate (Article II) ✅
- [ ] `module-manifest.yaml` создан и валиден?
- [ ] Стандартные endpoints реализованы?
- [ ] Автоматическая регистрация в Plugin Hub?
- **Статус**: [PASS/FAIL]

---

## 🎯 Phases of Implementation

### Phase 0: Research & Foundation (День 1)

#### Задачи:
1. Исследование tech stack (если нужно)
2. Создание `research.md` с обоснованием выбора технологий
3. Настройка Docker окружения для локальной разработки
4. Инициализация проекта ([фреймворк] CLI)

#### Deliverables:
- `research.md` - Сравнение альтернатив
- `docker-compose.dev.yml` - Локальное окружение
- Базовая структура проекта

---

### Phase 1: Contracts & Data Model (День 2)

> **КРИТИЧНО**: Контракты создаются ДО кода (Article IX)

#### Задачи:
1. Создать `contracts/openapi.yaml` - REST API спецификация
2. Создать `contracts/asyncapi.yaml` - NATS события
3. Создать `contracts/module-manifest.yaml` - UDI манифест
4. Создать `data-model.md` - Детальная схема БД
5. Создать `quickstart.md` - Ключевые тестовые сценарии
6. Сгенерировать TypeScript interfaces из OpenAPI

#### File Creation Order:
```
1. contracts/openapi.yaml
2. contracts/asyncapi.yaml
3. contracts/module-manifest.yaml
4. data-model.md
5. quickstart.md
6. Генерация кода: npm run generate:types
```

#### Deliverables:
- Все контракты в `contracts/`
- `data-model.md` с ER-диаграммами
- `quickstart.md` с тестовыми сценариями
- TypeScript types сгенерированы

---

### Phase 2: Test-First Implementation (Дни 3-4)

> **Следование TDD**: Red → Green → Refactor

#### 2.1 Contract Tests (ПЕРВЫМИ!)
```
tests/contract/
├── api.contract.spec.ts          # OpenAPI contract tests
├── events.contract.spec.ts       # AsyncAPI contract tests
└── udi.contract.spec.ts          # UDI compliance tests
```

**Цель**: Убедиться, что API соответствует контрактам

#### 2.2 Integration Tests
```
tests/integration/
├── database.integration.spec.ts  # Реальная PostgreSQL
├── nats.integration.spec.ts      # Реальный NATS
├── vault.integration.spec.ts     # Реальный Vault
└── plugin-hub.integration.spec.ts # Реальный Plugin Hub
```

**Цель**: Проверить взаимодействие с реальными сервисами

#### 2.3 E2E Tests
```
tests/e2e/
├── [scenario-1].e2e.spec.ts
└── [scenario-2].e2e.spec.ts
```

**Цель**: Проверить полные user journeys

#### 2.4 Unit Tests (ПОСЛЕДНИМИ)
```
tests/unit/
├── [entity].service.spec.ts
└── [utility].spec.ts
```

**Цель**: Изолированная бизнес-логика

---

### Phase 3: Core Implementation (Дни 5-7)

> **Принцип**: Реализация идёт ПОСЛЕ тестов

#### 3.1 Database Layer
- [ ] TypeORM entities
- [ ] Migrations
- [ ] Repositories

#### 3.2 Business Logic
- [ ] Services
- [ ] Domain logic
- [ ] Validation

#### 3.3 API Layer
- [ ] Controllers
- [ ] DTOs
- [ ] Middlewares

#### 3.4 Event Handlers
- [ ] NATS subscribers
- [ ] Event publishers
- [ ] Error handling

---

### Phase 4: UDI Integration (День 8)

#### 4.1 Module Manifest
- [ ] Реализовать `/manifest` endpoint
- [ ] Валидация против UDI спецификации

#### 4.2 Health Checks
- [ ] `/health` - Liveness probe
- [ ] `/status` - Readiness probe с детальными checks

#### 4.3 Plugin Hub Registration
- [ ] Автоматическая регистрация при старте
- [ ] Heartbeat протокол
- [ ] Graceful shutdown с уведомлением

#### 4.4 JWT Integration
- [ ] Enterprise JWT Middleware integration
- [ ] Vault secret rotation handling
- [ ] Permissions validation

---

### Phase 5: Deployment & Documentation (День 9)

#### 5.1 Docker
- [ ] Multi-stage Dockerfile
- [ ] Docker Compose интеграция
- [ ] Оптимизация образа

#### 5.2 Documentation
- [ ] README.md с setup инструкциями
- [ ] API documentation (Swagger UI)
- [ ] Troubleshooting guide

#### 5.3 Observability
- [ ] Structured logging
- [ ] Metrics (Prometheus)
- [ ] Distributed tracing (OpenTelemetry)

---

## 🔍 Complexity Tracking

> **Обязательно для соответствия Article VII**

### Component Count: [N]/3
1. **[Компонент 1]**: [обоснование необходимости]
2. **[Компонент 2]**: [обоснование]
3. **[Компонент 3]**: [обоснование]

> ⚠️ **Если > 3 компонентов**:  
> **Обоснование**: [Детальное объяснение почему необходима дополнительная сложность]  
> **Альтернативы рассмотрены**: [Почему более простые решения не подходят]  
> **Утверждено**: [Chief Architect signature]

### External Dependencies
- **NATS**: Event Bus (обязательно по Constitution)
- **PostgreSQL**: Primary database
- **Vault**: Secret management (обязательно по Article III)
- **Plugin Hub**: Service discovery (обязательно по Article II)

### Justification for Complexity (если применимо)
[Детальное обоснование почему сервис сложнее стандартного]

---

## 🚨 Risks & Mitigation (Риски и митигация)

| Риск | Вероятность | Влияние | Митигация |
|------|------------|---------|-----------|
| [Технический риск] | Высокая/Средняя/Низкая | Критичное/Значительное/Низкое | [Стратегия снижения] |
| Нарушение Constitution | Средняя | Критичное | Pre-Implementation Gates + Code Review |
| Performance bottleneck | [вероятность] | [влияние] | [митигация] |

---

## 📚 Research & Alternatives (Исследование)

> **Детальное исследование**: `research.md`

### Technology Choices

#### [Компонент 1]: [Технология]
**Почему выбрано**:
- [Преимущество 1]
- [Преимущество 2]

**Альтернативы рассмотрены**:
| Вариант | Почему не выбран |
|---------|-----------------|
| [Alt 1] | [причина] |
| [Alt 2] | [причина] |

---

## ✅ Definition of Done (Критерии завершения)

### Code Complete:
- [ ] Все тесты проходят (contract, integration, e2e, unit)
- [ ] Test coverage ≥ 90%
- [ ] Линтеры проходят без ошибок
- [ ] TypeScript strict mode enabled

### Documentation Complete:
- [ ] README.md с setup инструкциями
- [ ] API documentation (Swagger/OpenAPI)
- [ ] `quickstart.md` проверен вручную
- [ ] Inline code comments для сложной логики

### UDI Compliance:
- [ ] `module-manifest.yaml` валидный
- [ ] Все endpoints (`/health`, `/status`, `/manifest`) работают
- [ ] Автоматическая регистрация в Plugin Hub успешна
- [ ] Heartbeat работает стабильно

### Constitution Compliance:
- [ ] Article I: События через NATS ✅
- [ ] Article II: UDI реализован ✅
- [ ] Article III: JWT через Vault ✅
- [ ] Article VII: Simplicity Gate passed ✅
- [ ] Article VIII: Через Plugin Hub ✅
- [ ] Article IX: Test-First followed ✅

### Deployment Ready:
- [ ] Docker образ собирается успешно
- [ ] docker-compose.yml обновлён
- [ ] quark-manager.sh интеграция
- [ ] Environment variables задокументированы

### Review & Approval:
- [ ] Code Review завершён
- [ ] Chief Architect approved
- [ ] Security scan passed
- [ ] Performance tests passed

---

## 🔄 Next Steps

После утверждения этого плана:
1. **Запустить**: `/speckit.tasks` - генерация детального task list
2. **Создать**: Feature branch `[###-название-сервиса]`
3. **Начать**: Phase 0 (Research & Foundation)

---

## 📎 Related Documents

- **Specification**: `specs/[###-название-сервиса]/spec.md`
- **Constitution**: `.specify/memory/constitution.md`
- **UDI Spec**: `docs/architecture/universal-docking-interface.md`
- **ADR**: `docs/adr/` - Релевантные архитектурные решения

---

**Prepared by**: [Команда/Разработчик]  
**Reviewed by**: [Tech Lead], [Chief Architect]  
**Approved**: ⬜ Pending / ✅ Approved  
**Approval Date**: [ДАТА]
