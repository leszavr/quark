# Тестирование в Quark МКС Platform

**Стратегия тестирования** → [`strategy.md`](strategy.md) (полная документация)

---

## 🎯 Быстрый старт

### Для нового сервиса

```bash
# 1. Создать спецификацию
./quark-manager.sh spec:new my-service

# 2. Заполнить spec.md, plan.md, contracts/

# 3. Сгенерировать тесты
./quark-manager.sh spec:generate-tests 001

# 4. Перейти в директорию сервиса
cd services/my-service

# 5. Установить зависимости
npm install

# 6. Запустить тесты
npm run test:contract      # Contract validation
npm run test:integration   # NATS + DB integration
npm run test:chaos         # Minimal chaos (NATS disconnect)
npm run test:performance   # Baseline (10 RPS)
```

---

## 📋 Приоритизация тестов

### ✅ Must-have (не откладывать)

| Тип | Инструмент | Время | Команда |
|-----|-----------|-------|---------|
| **Contract Tests (REST)** | spectral, ajv | 5 мин | `npm run test:contract` |
| **Contract Tests (Events)** | @asyncapi/cli, Pact | 10 мин | `npm run test:contract` |
| **Integration Tests** | Testcontainers | 15 мин | `npm run test:integration` |
| **Minimal Chaos** | Toxiproxy | 30-60 мин | `npm run test:chaos` |
| **Minimal Performance** | k6 (10 RPS) | 10 мин | `npm run test:performance` |

**Итого**: ~1-2 часа на сервис (с AI генерацией)

### ⚠️ Should-have (после MVP)

- Unit tests для критичной бизнес-логики (auth, payment, RBAC)
- E2E tests для критичных user stories (Playwright)

### 🔵 Nice-to-have (после первых пользователей)

- Full Chaos Suite (network partition, cascading failures)
- Load Testing (100+ RPS, stress testing)

---

## 🧪 Уровни тестирования

### 1. Contract Tests

**Цель**: Валидация контрактов (OpenAPI + AsyncAPI)

**REST API**:
```bash
# Валидация OpenAPI
spectral lint specs/001-user-service/contracts/openapi.yaml

# Или через quark-manager
./quark-manager.sh spec:validate 001
```

**Events (NATS)**:
```bash
# Валидация AsyncAPI
asyncapi validate specs/001-user-service/contracts/asyncapi.yaml

# Pact message contracts
npm run test:contract
```

**Почему важно**: Quark — **event-driven платформа**. AsyncAPI так же критичен, как OpenAPI.

---

### 2. Integration Tests

**Цель**: Проверка взаимодействия с реальными сервисами

**Testcontainers vs docker-compose**:
- ✅ **Testcontainers** — изолированные тесты, работает в CI без Docker-in-Docker
- ❌ **docker-compose** — быстрее, но состояние "утекает" между тестами

**Пример** (NATS JetStream):
```typescript
// tests/integration/nats.integration.spec.ts
describe('NATS Events', () => {
  let container: StartedTestContainer;
  
  beforeAll(async () => {
    container = await new GenericContainer('nats:2.10-alpine')
      .withExposedPorts(4222)
      .withCommand(['-js'])
      .start();
  });
  
  it('должен публиковать и получать событие', async () => {
    // Publish → Subscribe → Assert
  });
});
```

---

### 3. Chaos Tests

**Цель**: Проверка отказоустойчивости

**Minimal must-have** (30-60 минут):
1. NATS disconnect → retry → reconnect → event delivered
2. Database latency → timeout → error handling

**Почему не откладывать**: Event-driven архитектура хрупкая без retry logic.

**Пример**:
```typescript
// tests/chaos/nats-disconnect.chaos.spec.ts
it('должен восстановить соединение через retry', async () => {
  // 1. Подключиться через Toxiproxy
  // 2. Отключить NATS на 5 секунд
  // 3. Проверить retry logic
  // 4. Убедиться, что событие доставлено
});
```

---

### 4. Performance Tests

**Цель**: Выявить грубые ошибки

**Minimal baseline** (10 RPS):
```javascript
// tests/performance/baseline.load.js
export let options = {
  vus: 10,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};
```

**Почему 10 RPS, а не 1000**?
- Выявляет N+1 queries, отсутствие индексов, memory leaks
- Если сервис не выдерживает 10 RPS, он не доберётся до 100 пользователей

---

### 5. E2E Tests

**Цель**: Критичные user scenarios

**Умные триггеры** (не "всё или ничего"):
```yaml
# .gitlab-ci.yml
test:e2e:
  rules:
    - changes:
        - contracts/**/*
        - infra/quark-ui/**/*
  script:
    - npm run test:e2e
```

**Playwright + AI**:
```typescript
// Self-healing selectors
await page.click('button:has-text("Опубликовать")');
// Работает даже если CSS классы изменились
```

---

## 🤖 AI в тестировании

### Генерация тестов

```bash
# Все типы
./quark-manager.sh spec:generate-tests 001

# Только contract tests
./quark-manager.sh spec:generate-tests 001 --type=contract-rest
./quark-manager.sh spec:generate-tests 001 --type=contract-events

# Integration + Chaos
./quark-manager.sh spec:generate-tests 001 --type=integration
./quark-manager.sh spec:generate-tests 001 --type=chaos
```

**Что генерируется**:
- Contract tests из OpenAPI/AsyncAPI
- Integration test stubs (Testcontainers)
- Chaos test templates (Toxiproxy)
- Performance baselines (k6)
- package.json с зависимостями

---

## 📊 Метрики качества

| Метрика | Цель | Инструмент |
|---------|------|-----------|
| Contract tests pass rate | 100% | spectral, AsyncAPI CLI, Pact |
| Integration tests pass rate | 100% | Jest + Testcontainers |
| Unit coverage (критичное) | ≥90% | Jest --coverage |
| Chaos tests pass rate | 100% | Toxiproxy + Jest |
| Performance baseline | p95 <500ms @10 RPS | k6 |
| E2E flakiness | <2% | Playwright |
| Security vulns (high/critical) | 0 | Snyk |

---

## 🔄 CI/CD Pipeline

```yaml
stages:
  - lint
  - unit
  - contract      # ✅ Must-have
  - security      # ✅ Snyk
  - integration   # ✅ Testcontainers
  - chaos         # ✅ Minimal must-have
  - performance   # ✅ Minimal baseline
  - e2e           # ⚠️ Умные триггеры
  - deploy

test:contract:
  script:
    - npm run validate:openapi
    - npm run validate:asyncapi
    - npm run test:contract

test:integration:
  services:
    - docker:dind
  script:
    - npm run test:integration

test:chaos:
  script:
    - docker-compose -f docker-compose.chaos.yml up -d
    - npm run test:chaos

test:performance:
  script:
    - k6 run tests/performance/baseline.load.js

test:e2e:
  rules:
    - changes: [contracts/**/* , infra/quark-ui/**/*]
  script:
    - npm run test:e2e
```

---

## 📚 Дополнительная документация

- [`strategy.md`](strategy.md) — Полная стратегия (16,000 строк)
- [`../spec-driven-practical-guide.md`](../spec-driven-practical-guide.md) — Практические сценарии
- [`../../.specify/templates/plan-template.md`](../../.specify/templates/plan-template.md) — Template с секцией Testing

---

## 💡 Примеры

### user-service (001)

```bash
# Сгенерировать тесты
./quark-manager.sh spec:generate-tests 001

# Установить зависимости
cd services/user-service
npm install

# Запустить contract tests
npm run test:contract

# Запустить integration tests (Testcontainers)
npm run test:integration

# Запустить minimal chaos test (NATS disconnect)
npm run test:chaos

# Запустить performance baseline (10 RPS)
npm run test:performance
```

---

## 🎯 Timeline для solo developer + AI

| День | Активность | Время |
|------|-----------|-------|
| **День 1-2** | Spec + Plan + Contracts | 4-6 часов |
| **День 3** | Contract tests (AI генерирует) | 1 час |
| **День 3** | Unit tests (критичная логика) | 2-3 часа |
| **День 4** | Integration tests (Testcontainers) | 2 часа |
| **День 4** | Minimal chaos test (NATS) | 1 час |
| **День 4** | Minimal perf baseline (k6) | 30 минут |
| **День 5-7** | Реализация (TDD: Red → Green → Refactor) | 3 дня |

**Итого тестирования**: ~7-8 часов (включая автогенерацию)

---

**Утверждено Главным Архитектором**: 2025-11-03
