# Tasks: [НАЗВАНИЕ СЕРВИСА]

**Входные данные**: Документы из `/specs/[###-название-сервиса]/`  
**Предусловия**: `plan.md` (обязательно), `spec.md` (для user stories), `research.md`, `data-model.md`, `contracts/`

**Организация**: Задачи сгруппированы по фазам для независимой реализации и тестирования.

---

## 📝 Формат: `[ID] [P?] [Phase] Описание`

- **[ID]**: Уникальный номер задачи (например, `001`, `002`)
- **[P]**: Маркер параллельности - задачи с `[P]` могут выполняться одновременно
- **[Phase]**: Фаза из `plan.md` (Phase 0, 1, 2, 3, 4, 5)
- **Описание**: Конкретная задача с указанием файлов

### Path Conventions:
- `services/[service-name]/src/` - Исходный код
- `services/[service-name]/tests/` - Тесты
- `specs/[###-service]/contracts/` - API контракты
- `specs/[###-service]/` - Документация

---

## Phase 0: Research & Foundation (Setup)

**Цель**: Подготовка инфраструктуры и окружения

### 0.1 Environment Setup
- `[P] 000-001`: Создать `services/[service-name]/` директорию
- `[P] 000-002`: Инициализировать [фреймворк] проект (nest new / express init)
- `[P] 000-003`: Настроить TypeScript конфигурацию (`tsconfig.json`)
- `[P] 000-004`: Настроить ESLint и Prettier

### 0.2 Docker Configuration
- `001`: Создать `Dockerfile` (multi-stage build)
- `002`: Создать `docker-compose.dev.yml` для локальной разработки
- `003`: Добавить сервис в корневой `docker-compose.yml`
- `004`: Обновить `quark-manager.sh` с новым сервисом

### 0.3 Research (если требуется)
- `005`: Заполнить `specs/[###-service]/research.md` с обоснованием tech stack
- `006`: Сравнить альтернативы и задокументировать выбор

---

## Phase 1: Contracts & Data Model (Спецификации)

**Цель**: Определить все контракты ДО написания кода (Article IX)

### 1.1 API Contracts
- `[P] 100-001`: Создать `contracts/openapi.yaml` - REST API спецификация
- `[P] 100-002`: Создать `contracts/asyncapi.yaml` - NATS события спецификация
- `[P] 100-003`: Создать `contracts/module-manifest.yaml` - UDI манифест

### 1.2 gRPC (если применимо)
- `[P] 100-004`: Создать `contracts/grpc/[service].proto` - gRPC спецификация
- `101`: Настроить `protoc` и `buf` для генерации кода

### 1.3 Data Model
- `102`: Создать `data-model.md` с детальными схемами
- `103`: Создать ER-диаграммы для визуализации
- `[P] 104`: Написать TypeORM entities из `data-model.md`
- `[P] 105`: Создать миграции для PostgreSQL

### 1.4 Type Generation
- `106`: Настроить `openapi-generator` для TypeScript типов
- `107`: Сгенерировать DTOs из OpenAPI спецификации
- `108`: Создать event types из AsyncAPI

### 1.5 Test Scenarios
- `109`: Создать `quickstart.md` с ключевыми тестовыми сценариями
- `110`: Определить happy paths и edge cases

---

## Phase 2: Test-First Development (Тесты ДО кода!)

**Цель**: Написать все тесты ПЕРЕД реализацией (Article IX - Test-First Imperative)

> ⚠️ **КРИТИЧНО**: Реализация начинается только после того, как тесты написаны и провалились (Red phase)

### 2.1 Contract Tests (ПЕРВЫМИ!)
- `[P] 200-001`: Написать `tests/contract/api.contract.spec.ts` - OpenAPI compliance
- `[P] 200-002`: Написать `tests/contract/events.contract.spec.ts` - AsyncAPI compliance
- `[P] 200-003`: Написать `tests/contract/udi.contract.spec.ts` - UDI compliance
- `201`: Убедиться, что все contract tests **FAIL** (Red phase) ✅

### 2.2 Integration Tests
- `[P] 202-001`: Написать `tests/integration/database.integration.spec.ts`
- `[P] 202-002`: Написать `tests/integration/nats.integration.spec.ts`
- `[P] 202-003`: Написать `tests/integration/vault.integration.spec.ts`
- `[P] 202-004`: Написать `tests/integration/plugin-hub.integration.spec.ts`
- `203`: Настроить Docker окружение для интеграционных тестов
- `204`: Убедиться, что integration tests **FAIL** (Red phase) ✅

### 2.3 E2E Tests
- `[P] 205-001`: Написать E2E тест для User Story 1 из `spec.md`
- `[P] 205-002`: Написать E2E тест для User Story 2
- `206`: Убедиться, что E2E tests **FAIL** (Red phase) ✅

### 2.4 Unit Tests (последними из тестов)
- `[P] 207-001`: Написать unit tests для core бизнес-логики
- `[P] 207-002`: Написать unit tests для utilities
- `208`: Убедиться, что unit tests **FAIL** (Red phase) ✅

---

## Phase 3: Core Implementation (Реализация)

**Цель**: Написать код, чтобы тесты прошли (Green phase)

> 📌 **Порядок**: Database → Business Logic → API Layer → Event Handlers

### 3.1 Configuration & Core Modules
- `[P] 300-001`: Настроить `src/config/database.config.ts` (TypeORM)
- `[P] 300-002`: Настроить `src/config/vault.config.ts` (Vault integration)
- `[P] 300-003`: Настроить `src/config/nats.config.ts` (NATS JetStream)
- `301`: Создать `src/main.ts` - точка входа приложения

### 3.2 Database Layer
- `[P] 302-001`: Реализовать TypeORM repositories для [Entity1]
- `[P] 302-002`: Реализовать TypeORM repositories для [Entity2]
- `303`: Реализовать миграции
- `304`: Запустить integration tests для database → должны пройти ✅

### 3.3 Business Logic Services
- `[P] 305-001`: Реализовать `src/modules/[entity1]/[entity1].service.ts`
- `[P] 305-002`: Реализовать `src/modules/[entity2]/[entity2].service.ts`
- `306`: Добавить валидацию (class-validator)
- `307`: Реализовать бизнес-логику
- `308`: Запустить unit tests → должны пройти ✅

### 3.4 API Layer (Controllers)
- `[P] 309-001`: Реализовать `src/modules/[entity1]/[entity1].controller.ts`
- `[P] 309-002`: Реализовать DTOs для request/response
- `310`: Добавить OpenAPI decorators (@ApiTags, @ApiOperation)
- `311`: Реализовать middleware для JWT валидации
- `312`: Запустить contract tests → должны пройти ✅

### 3.5 Event Handlers (NATS)
- `[P] 313-001`: Реализовать NATS publishers в сервисах
- `[P] 313-002`: Реализовать NATS subscribers для входящих событий
- `314`: Настроить durable consumers
- `315`: Реализовать Dead Letter Queue обработку
- `316`: Запустить integration tests для NATS → должны пройти ✅

---

## Phase 4: UDI Integration (Plugin Hub)

**Цель**: Интеграция с Universal Docking Interface и Plugin Hub

### 4.1 Module Manifest
- `400`: Создать `module-manifest.yaml` в корне сервиса
- `401`: Реализовать `GET /manifest` endpoint
- `402`: Валидация манифеста против UDI спецификации
- `403`: Запустить UDI contract tests → должны пройти ✅

### 4.2 Health Checks
- `[P] 404-001`: Реализовать `GET /health` (liveness probe)
- `[P] 404-002`: Реализовать `GET /status` (readiness probe)
- `405`: Добавить проверки: database, NATS, Vault
- `406`: Тестировать health endpoints в docker-compose

### 4.3 Plugin Hub Registration
- `407`: Реализовать автоматическую регистрацию при старте
- `408`: Реализовать heartbeat протокол
- `409`: Реализовать graceful shutdown с уведомлением Hub
- `410`: Протестировать регистрацию через Plugin Hub API
- `411`: Запустить integration tests для Plugin Hub → должны пройти ✅

### 4.4 JWT & Permissions
- `412`: Интегрировать Enterprise JWT Middleware
- `413`: Реализовать permission guards (@RequirePermissions)
- `414`: Реализовать обработку Vault secret rotation
- `415`: Протестировать JWT валидацию через Plugin Hub

---

## Phase 5: Deployment & Finalization

**Цель**: Подготовка к production deployment

### 5.1 Docker & Compose
- `500`: Оптимизировать Dockerfile (multi-stage, caching)
- `501`: Обновить корневой `docker-compose.yml`
- `502`: Добавить healthcheck в docker-compose
- `503`: Протестировать `./quark-manager.sh start [service]`

### 5.2 Documentation
- `[P] 504-001`: Создать `services/[service]/README.md`
- `[P] 504-002`: Документировать environment variables
- `[P] 504-003`: Создать troubleshooting guide
- `505`: Настроить Swagger UI для API documentation
- `506`: Обновить `docs/architecture/components-[service].md`

### 5.3 Observability
- `[P] 507-001`: Настроить structured logging (Winston/Pino)
- `[P] 507-002`: Добавить Prometheus metrics endpoints
- `[P] 507-003`: Интегрировать OpenTelemetry tracing
- `508`: Создать Grafana dashboard шаблон

### 5.4 Final Testing
- `509`: Запустить полный test suite (contract + integration + e2e + unit)
- `510`: Проверить test coverage ≥ 90%
- `511`: Запустить линтеры и форматтеры
- `512`: Выполнить security scan (npm audit)

### 5.5 Code Review & Approval
- `513`: Создать Pull Request с описанием изменений
- `514`: Code Review от Tech Lead
- `515`: Constitution Compliance проверка (все Articles)
- `516`: Утверждение от Chief Architect
- `517`: Merge в main branch

---

## Dependencies & Execution Order (Зависимости)

### Блокирующие зависимости:
```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
```

**Нельзя начинать Phase 3, пока не завершена Phase 2** (Test-First!)

### Внутри фаз - параллельное выполнение:

#### Phase 1 - Parallel Groups:
```
Group A (параллельно):
  ├─ 100-001: OpenAPI
  ├─ 100-002: AsyncAPI
  ├─ 100-003: Module Manifest
  └─ 100-004: gRPC (если нужен)

Group B (после Group A):
  ├─ 104: TypeORM entities
  └─ 105: Migrations
```

#### Phase 2 - Parallel Groups:
```
Group A (параллельно):
  ├─ 200-001: API contract tests
  ├─ 200-002: Events contract tests
  └─ 200-003: UDI contract tests

Group B (параллельно, после окружения настроено):
  ├─ 202-001: Database integration tests
  ├─ 202-002: NATS integration tests
  ├─ 202-003: Vault integration tests
  └─ 202-004: Plugin Hub integration tests
```

#### Phase 3 - Parallel Groups:
```
Group A (параллельно):
  ├─ 300-001: Database config
  ├─ 300-002: Vault config
  └─ 300-003: NATS config

Group B (после database ready):
  ├─ 302-001: Repository [Entity1]
  └─ 302-002: Repository [Entity2]

Group C (после repositories):
  ├─ 305-001: Service [Entity1]
  └─ 305-002: Service [Entity2]

Group D (после services):
  ├─ 309-001: Controller [Entity1]
  └─ 309-002: Controller [Entity2]
```

---

## Execution Example (Пример выполнения)

### Day 1: Phase 0 + Phase 1
```bash
# Morning (Phase 0)
- 000-001, 000-002, 000-003, 000-004 (параллельно)
- 001 → 002 → 003 → 004

# Afternoon (Phase 1)
- 100-001, 100-002, 100-003, 100-004 (параллельно)
- 102 → 103
- 104, 105 (параллельно)
- 106 → 107 → 108
- 109 → 110
```

### Day 2: Phase 2 (Test-First!)
```bash
# Morning
- 200-001, 200-002, 200-003 (параллельно)
- 201: Убедиться все FAIL ✅

# Afternoon
- 203: Docker для тестов
- 202-001, 202-002, 202-003, 202-004 (параллельно)
- 204: Убедиться все FAIL ✅
- 205-001, 205-002 (параллельно)
- 206: E2E FAIL ✅
```

### Day 3-4: Phase 3 (Implementation)
```bash
# Day 3 Morning
- 300-001, 300-002, 300-003 (параллельно)
- 301: Main.ts
- 302-001, 302-002 (параллельно)
- 304: Database tests PASS ✅

# Day 3 Afternoon
- 305-001, 305-002 (параллельно)
- 306 → 307
- 308: Unit tests PASS ✅

# Day 4
- 309-001, 309-002 (параллельно)
- 310 → 311
- 312: Contract tests PASS ✅
- 313-001, 313-002 (параллельно)
- 314 → 315
- 316: NATS tests PASS ✅
```

### Day 5: Phase 4 (UDI Integration)
```bash
# Morning
- 400 → 401 → 402
- 403: UDI tests PASS ✅
- 404-001, 404-002 (параллельно)
- 405 → 406

# Afternoon
- 407 → 408 → 409 → 410
- 411: Plugin Hub tests PASS ✅
- 412 → 413 → 414 → 415
```

### Day 6: Phase 5 (Finalization)
```bash
# Morning
- 500 → 501 → 502 → 503
- 504-001, 504-002, 504-003 (параллельно)
- 505 → 506

# Afternoon
- 507-001, 507-002, 507-003 (параллельно)
- 508
- 509 → 510 → 511 → 512
- 513 → 514 → 515 → 516 → 517
```

---

## Constitution Compliance Checklist

> **Финальная проверка перед Code Review**

### Article I: Event-Driven Architecture
- [ ] Все межсервисные взаимодействия через NATS
- [ ] Durable consumers настроены (task 314)
- [ ] DLQ реализована (task 315)
- [ ] НЕТ прямых HTTP вызовов

### Article II: Universal Docking Interface
- [ ] `module-manifest.yaml` создан и валиден (task 400-402)
- [ ] `/health`, `/status`, `/manifest` endpoints (task 404-406)
- [ ] Автоматическая регистрация в Plugin Hub (task 407-410)

### Article III: JWT Authentication
- [ ] JWT через Vault (task 412)
- [ ] Enterprise JWT Middleware (task 412-415)
- [ ] Поддержка ротации секретов (task 414)

### Article VII: Simplicity Gate
- [ ] ≤3 компонентов (проверить в plan.md)
- [ ] Нет future-proofing
- [ ] Сложность обоснована

### Article IX: Test-First Development
- [ ] Contract tests написаны ДО реализации (Phase 2 перед Phase 3)
- [ ] Integration tests используют реальные сервисы (task 202-001..004)
- [ ] Последовательность: spec → contracts → tests → code

---

## Metrics & Progress Tracking

### Test Coverage Target: ≥90%
- Contract tests: 100%
- Integration tests: 100%
- E2E tests: 80%+
- Unit tests: 90%+

### Time Estimates:
- Phase 0: 0.5 дня
- Phase 1: 1 день
- Phase 2: 1 день
- Phase 3: 2 дня
- Phase 4: 1 день
- Phase 5: 1 день

**Total: ~6 рабочих дней**

---

## Notes & Best Practices

### Параллельная разработка:
- Задачи с маркером `[P]` можно выполнять одновременно
- Рекомендуется 2-3 разработчика для оптимальной скорости
- Git branches: `[###-service]/phase-[N]/task-[ID]`

### Test-First принудительно:
- **RED**: Тесты провалились → ПРАВИЛЬНО
- **GREEN**: Реализация заставляет тесты пройти
- **REFACTOR**: Оптимизация без изменения поведения

### Code Review фокус:
- Constitution compliance (все 9 Articles)
- Test coverage ≥90%
- Performance (нет N+1 queries)
- Security (SQL injection, XSS prevention)
- Documentation (inline comments для сложной логики)

---

**Generated by**: `/speckit.tasks`  
**Input**: `plan.md`, `spec.md`, `contracts/`, `data-model.md`  
**Ready for**: Implementation Team  
**Estimated completion**: 6 дней (при 2-3 разработчиках)
