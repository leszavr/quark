# Стратегия тестирования Quark МКС Platform

**Версия**: 1.0 | **Дата**: 2025-11-03  
**Статус**: Утверждено Главным Архитектором

---

## 📋 Резюме

Quark — **модульная, ИИ-нативная платформа** с event-driven архитектурой на NATS JetStream. Стратегия тестирования учитывает:

1. **Event-driven природу** — тестирование асинхронных событий так же критично, как REST API
2. **Constitution compliance** — все тесты проверяют соответствие 9 Articles
3. **Solo developer + AI workflow** — приоритизация по рискам, автогенерация тестов
4. **Production-grade требования** — отказоустойчивость и производительность проверяются в MVP

---

## 🧭 Общие принципы

### 1. Модульность
Каждый микросервис и плагин тестируется **независимо**. Контракты (OpenAPI + AsyncAPI) — граница изоляции.

### 2. Человек в цикле
Тесты не только автоматизированы, но и **интерпретируются человеком** через метрики и отчёты.

### 3. ИИ-нативность
AI участвует в:
- Генерации тест-кейсов из спецификаций
- Анализе покрытия и предложении улучшений
- Самовосстанавливающихся UI-тестах (Playwright + AI)

### 4. Безопасность как часть тестирования
**Snyk** + **SAST/DAST** интегрированы в CI/CD пайплайн. Zero tolerance для high/critical уязвимостей.

### 5. Observability-driven testing
Метрики (Prometheus), трейсы (OpenTelemetry) и логи (Grafana Loki) используются для **валидации поведения** системы.

---

## 🧪 Уровни тестирования

### 🔵 Критичность тестов (Must-have vs Should-have vs Nice-to-have)

| Уровень | Критичность | Генерируется AI | Среда выполнения |
|---------|-------------|-----------------|------------------|
| **Contract Tests** | ✅ Must-have | Да | Локально + CI |
| **Integration Tests** | ✅ Must-have | Частично | Testcontainers |
| **Minimal Chaos** | ✅ Must-have | Да | Testcontainers |
| **Minimal Performance** | ✅ Must-have | Да | Локально + CI |
| **Unit Tests** (критичное) | ⚠️ Should-have | Да | Локально + CI |
| **E2E** (критичные сценарии) | ⚠️ Should-have | Шаблоны | docker-compose |
| **Full Chaos Suite** | 🔵 Nice-to-have | Нет | Staging/Production |
| **Load Testing** (100+ RPS) | 🔵 Nice-to-have | Нет | Staging |

---

## 1️⃣ Contract Testing

> **Цель**: Гарантировать совместимость между сервисами через контракты

### REST API Contracts

**Инструменты**: `spectral` (OpenAPI linter), `ajv` (JSON Schema validator)

**Процесс**:
1. Все API-клиенты генерируются из `specs/[###]/contracts/openapi.yaml`
2. Перед merge в `main` → валидация контрактов в CI
3. Mock API (Prism) используется Frontend'ом для параллельной разработки

**Команда**:
```bash
./quark-manager.sh spec:validate [###]
# ✅ OpenAPI валиден (spectral --ruleset .spectral.yaml)
# ✅ Примеры проходят валидацию
```

**Что проверяем**:
- ✅ Все endpoints соответствуют OpenAPI schema
- ✅ Response codes документированы (200, 400, 401, 404, 500)
- ✅ Security schemas определены (JWT Bearer)
- ✅ Примеры валидны (используются в mock API)

---

### Event Contracts (AsyncAPI)

**Инструменты**: `@asyncapi/cli`, `Pact` (для message contracts)

**КРИТИЧНО**: Quark — **event-driven платформа**. REST — только внешний API. Основная логика идёт через **NATS JetStream**.

**Процесс**:
1. Все published/subscribed события описаны в `specs/[###]/contracts/asyncapi.yaml`
2. Pact Message Contracts проверяют **consumer expectations**
3. Dead Letter Queue (DLQ) обязательна для всех subscribers

**Команда**:
```bash
./quark-manager.sh spec:validate [###]
# ✅ AsyncAPI валиден (@asyncapi/cli validate)
# ✅ Все события имеют JSON Schema для payload
# ✅ DLQ настроена (dead_letter_subject)
```

**Что проверяем**:
- ✅ Publisher соблюдает payload schema
- ✅ Subscriber корректно обрабатывает события
- ✅ Ack policy = explicit (не auto)
- ✅ Max delivery attempts настроены (→ DLQ после 3 попыток)

**Пример Pact Message Contract**:
```typescript
// tests/contract/events.message.spec.ts
describe('user.created event', () => {
  it('должен соответствовать контракту', async () => {
    const message = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      email: 'test@example.com',
      created_at: '2025-11-03T10:00:00Z'
    };
    
    // Валидация против AsyncAPI schema
    const valid = await validateAgainstAsyncAPI('user.created', message);
    expect(valid).toBe(true);
  });
});
```

---

### UDI Compliance

**Инструменты**: Jest + Supertest

**Что проверяем**:
- ✅ `/manifest` возвращает валидный `module-manifest.yaml`
- ✅ `/health` отвечает за <1s (liveness probe)
- ✅ `/status` содержит детальные dependency checks (readiness probe)

**Пример**:
```typescript
describe('UDI Compliance', () => {
  it('/manifest должен быть валидным YAML', async () => {
    const response = await request(app).get('/manifest');
    expect(response.status).toBe(200);
    const manifest = yaml.parse(response.text);
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
```

---

## 2️⃣ Integration Testing

> **Цель**: Проверка взаимодействия с реальными сервисами

**Инструменты**: `Testcontainers` (Node.js/Python), Jest/pytest

### Почему Testcontainers, а не docker-compose?

| Критерий | Testcontainers | docker-compose |
|----------|----------------|----------------|
| Изоляция | ✅ Каждый тест = чистый контейнер | ❌ Состояние "утекает" между тестами |
| CI/CD | ✅ Работает в GitHub Actions без DinD | ⚠️ Требует Docker-in-Docker |
| Скорость | ⚠️ Медленнее (~10s overhead) | ✅ Быстрее |
| Надёжность | ✅ Повторяемость 100% | ❌ Flaky из-за shared state |

**Вердикт**: Для Quark (production-grade) → **Testcontainers**.

### Сценарии

#### NATS JetStream Integration
```typescript
// tests/integration/nats.integration.spec.ts
describe('NATS Events', () => {
  let container: StartedTestContainer;
  
  beforeAll(async () => {
    container = await new GenericContainer('nats:2.10-alpine')
      .withExposedPorts(4222)
      .withCommand(['-js']) // Enable JetStream
      .start();
  });
  
  it('должен публиковать и получать событие user.created', async () => {
    const nc = await connect({ servers: `localhost:${container.getMappedPort(4222)}` });
    const js = nc.jetstream();
    
    // Publish
    await js.publish('user.created', JSON.stringify({ id: '123', username: 'test' }));
    
    // Subscribe
    const consumer = await js.consumers.get('USER_STREAM', 'test-consumer');
    const messages = await consumer.fetch({ max_messages: 1 });
    
    expect(messages[0].subject).toBe('user.created');
    expect(JSON.parse(messages[0].data)).toMatchObject({ id: '123' });
  });
});
```

#### Database Integration
```typescript
// tests/integration/database.integration.spec.ts
describe('PostgreSQL', () => {
  let container: StartedPostgreSqlContainer;
  
  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();
  });
  
  it('должен сохранять пользователя с уникальным username', async () => {
    const repo = getRepository(User);
    await repo.save({ username: 'test', email: 'test@example.com' });
    
    // Duplicate username → должен упасть
    await expect(repo.save({ username: 'test', email: 'other@example.com' }))
      .rejects.toThrow('duplicate key value violates unique constraint');
  });
});
```

#### Vault Integration
```typescript
// tests/integration/vault.integration.spec.ts
describe('HashiCorp Vault', () => {
  it('должен ротировать JWT секреты', async () => {
    const client = new VaultClient({ endpoint: container.getEndpoint() });
    
    const secret1 = await client.read('secret/data/quark/user-service/jwt');
    await client.write('secret/data/quark/user-service/jwt', { key: 'new-secret' });
    const secret2 = await client.read('secret/data/quark/user-service/jwt');
    
    expect(secret1.data.key).not.toBe(secret2.data.key);
  });
});
```

---

## 3️⃣ Unit Testing

> **Цель**: Изолированная проверка бизнес-логики

**Инструменты**:
- Backend (Python): `pytest` + `unittest.mock`
- Backend (TypeScript): `Jest` + `ts-mockito`
- Frontend: `Vitest` + `React Testing Library`

### Приоритизация (для solo dev + AI)

**Must-test** (≥90% coverage):
1. **Auth логика** — JWT validation, role checks, permission guards
2. **Payment/Subscription логика** — billing, trial periods, VIP upgrades
3. **Валидаторы** — email, phone, content moderation (AI safety)

**Should-test** (≥70% coverage):
4. Domain services (CreatePostUseCase, SendMessageUseCase)
5. Custom validators (class-validator)

**Nice-to-test** (≥50% coverage):
6. Utilities, helpers, formatters

### AI-Generated Unit Tests

**Команда**:
```bash
./quark-manager.sh spec:generate-tests [###] --type=unit
# Генерирует тесты из OpenAPI schemas + spec.md (Functional Requirements)
```

**Пример сгенерированного теста**:
```typescript
// tests/unit/subscription.service.spec.ts
describe('SubscriptionService', () => {
  it('должен активировать VIP подписку на 30 дней', async () => {
    const service = new SubscriptionService(mockRepo);
    const result = await service.activateVIP(userId, 'monthly');
    
    expect(result.type).toBe('VIP');
    expect(result.expires_at).toBeCloseTo(Date.now() + 30*24*60*60*1000, -3);
  });
  
  it('должен запретить создание второй активной подписки', async () => {
    const service = new SubscriptionService(mockRepo);
    await service.activateVIP(userId, 'monthly');
    
    await expect(service.activateVIP(userId, 'yearly'))
      .rejects.toThrow('User already has an active subscription');
  });
});
```

---

## 4️⃣ Chaos Testing

> **Цель**: Проверка отказоустойчивости event-driven архитектуры

**Инструменты**: `Toxiproxy`, `Chaos Mesh` (для k8s)

### Почему не откладывать до production?

Event-driven архитектура **хрупкая без retry logic**. Простые сценарии типа "NATS disconnect → retry → reconnect" можно протестировать **на этапе разработки первого сервиса**.

**Цена**: 30-60 минут на базовый chaos тест.  
**Выгода**: Предотвращение катастрофы в production (MTTR снижается с часов до минут).

### Minimal Must-Have Chaos Tests

#### 1. NATS Disconnect
```typescript
// tests/chaos/nats-disconnect.chaos.spec.ts
describe('NATS Disconnect', () => {
  it('должен восстановить соединение через retry', async () => {
    const proxy = new Toxiproxy({ host: 'localhost', port: 8474 });
    const natsProxy = await proxy.create({
      name: 'nats',
      listen: '127.0.0.1:4223',
      upstream: 'nats:4222'
    });
    
    // Сервис подключается через proxy
    const service = new UserService({ natsUrl: 'nats://localhost:4223' });
    
    // Отключаем NATS на 5 секунд
    await natsProxy.toxic({ type: 'timeout', attributes: { timeout: 5000 } });
    
    // Публикуем событие → должно попасть в retry queue
    await service.createUser({ username: 'test' });
    
    // Ждём 6 секунд → соединение восстановлено
    await sleep(6000);
    
    // Событие должно быть доставлено
    const messages = await consumeMessages('user.created', 1);
    expect(messages[0].data.username).toBe('test');
  });
});
```

#### 2. Database Latency
```typescript
// tests/chaos/db-latency.chaos.spec.ts
describe('Database Latency', () => {
  it('должен вернуть timeout error при задержке >5s', async () => {
    const proxy = new Toxiproxy({ host: 'localhost', port: 8474 });
    const dbProxy = await proxy.create({
      name: 'postgres',
      listen: '127.0.0.1:5433',
      upstream: 'postgres:5432'
    });
    
    // Добавляем задержку 6 секунд
    await dbProxy.toxic({ type: 'latency', attributes: { latency: 6000 } });
    
    // Запрос должен упасть с timeout
    await expect(service.getUser('123'))
      .rejects.toThrow('Query timeout');
  });
});
```

#### 3. Vault Unavailable
```typescript
// tests/chaos/vault-unavailable.chaos.spec.ts
describe('Vault Unavailable', () => {
  it('должен использовать кэшированный JWT секрет', async () => {
    // Получаем секрет один раз (кэшируется на 5 минут)
    const token = await service.validateJWT('valid-token');
    
    // Отключаем Vault
    await vaultProxy.disable();
    
    // Валидация всё ещё должна работать (из кэша)
    const token2 = await service.validateJWT('valid-token');
    expect(token2).toEqual(token);
  });
});
```

### Advanced Chaos (Nice-to-have для Production)

- **Network partition** — split brain scenarios
- **CPU throttling** — процессор на 100%
- **Memory pressure** — OOM killer
- **Cascading failures** — один сервис падает → все зависимые тоже

---

## 5️⃣ Performance Testing

> **Цель**: Выявить грубые ошибки до production

**Инструменты**: `k6`, `Locust`

### Почему не откладывать?

Если сервис **не выдерживает 10 RPS** (из-за N+1 queries, отсутствия индексов, memory leaks), он **никогда не доберётся до 100 пользователей**.

### Minimal Must-Have Performance Tests

**Target**: 10 RPS (не 1000!) → baseline для выявления грубых ошибок.

#### k6 Baseline Script
```javascript
// tests/performance/baseline.load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10,           // 10 виртуальных пользователей
  duration: '1m',    // 1 минута
  thresholds: {
    http_req_duration: ['p(95)<500'],  // p95 < 500ms
    http_req_failed: ['rate<0.01'],    // error rate < 1%
  },
};

export default function () {
  // Критичные endpoints
  let res1 = http.post('http://localhost:3000/api/v1/users', JSON.stringify({
    username: 'testuser',
    email: 'test@example.com'
  }), { headers: { 'Content-Type': 'application/json' } });
  
  check(res1, { 'status 201': (r) => r.status === 201 });
  
  let res2 = http.get(`http://localhost:3000/api/v1/users/${res1.json('id')}`);
  check(res2, { 'status 200': (r) => r.status === 200 });
  
  sleep(1);
}
```

**Запуск**:
```bash
k6 run tests/performance/baseline.load.js
```

**Что проверяем**:
- ✅ p95 latency < 500ms
- ✅ Error rate < 1%
- ✅ CPU < 80%
- ✅ Memory < 1GB
- ✅ Database connection pool не истощается

### Advanced Performance (Nice-to-have)

- **Spike testing** — резкий скачок с 10 до 100 RPS
- **Soak testing** — длительная нагрузка (8 часов) для выявления memory leaks
- **Stress testing** — увеличение нагрузки до точки отказа

---

## 6️⃣ End-to-End (E2E) Testing

> **Цель**: Проверка сквозных пользовательских сценариев

**Инструменты**: `Playwright` (поддержка Chromium, Firefox, WebKit + мобильные эмуляции)

### Приоритизация (для solo dev + AI)

**Критичные сценарии** (Must-test):
1. **Auth flow** — регистрация → вход → JWT → защищённый endpoint
2. **Core business flow** — создание ресурса → event → обновление UI
3. **Real-time flow** — WebSocket → NATS event → notification

**Важные сценарии** (Should-test):
4. VIP subscription → role change → access granted
5. Blog post → AI moderation → publish/reject
6. Message send → online status check → delivery

### Умные триггеры (не "всё или ничего")

**Проблема**: E2E тесты медленные (5-10 минут).

**Решение**: Запускать только при изменении UI или API contracts:
```bash
# .gitlab-ci.yml
test:e2e:
  rules:
    - changes:
        - contracts/**/*
        - infra/quark-ui/src/**/*
  script:
    - docker-compose -f docker-compose.e2e.yml up -d
    - npm run test:e2e
```

### AI-Generated E2E Tests

**Команда**:
```bash
./quark-manager.sh spec:generate-tests [###] --type=e2e
# Генерирует Playwright тесты из user stories (spec.md)
```

**Пример**:
```typescript
// tests/e2e/user-registration.e2e.spec.ts
test('пользователь может зарегистрироваться и создать пост', async ({ page }) => {
  // 1. Регистрация
  await page.goto('http://localhost:8080/register');
  await page.fill('input[name="username"]', 'testuser');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');
  
  // 2. Проверка JWT в localStorage
  const token = await page.evaluate(() => localStorage.getItem('jwt'));
  expect(token).toBeTruthy();
  
  // 3. Создание поста
  await page.goto('http://localhost:8080/posts/new');
  await page.fill('textarea[name="content"]', 'Мой первый пост!');
  await page.click('button:has-text("Опубликовать")');
  
  // 4. Проверка в ленте
  await page.waitForSelector('text=Мой первый пост!');
  expect(await page.locator('text=testuser').count()).toBeGreaterThan(0);
});
```

### Self-Healing Tests (AI-powered)

Playwright + AI может **автоматически адаптировать селекторы** при изменениях UI:
```typescript
// Вместо жёстких селекторов:
await page.click('button.submit-btn');

// AI находит кнопку по смыслу:
await page.click('button:has-text("Опубликовать")');
```

---

## 7️⃣ AI-Specific Testing

> **Цель**: Валидация поведения ИИ-агентов

### Проблема: LLM — недетерминированные

**Решение**: Deterministic mocks + golden datasets + bias checks

### 7.1 Deterministic Mocks

**Подход**: Зафиксировать ответы LLM для повторяемости тестов.

```typescript
// tests/ai/llm.mock.spec.ts
describe('AI Blog Post Generator', () => {
  it('должен генерировать пост на основе промпта', async () => {
    // Mock LLM response
    const mockLLM = jest.fn().mockResolvedValue({
      text: 'Это сгенерированный AI пост о технологиях...',
      tokens: 150
    });
    
    const service = new AIBlogService({ llm: mockLLM });
    const result = await service.generatePost('технологии будущего');
    
    expect(result.text).toContain('технологи');
    expect(mockLLM).toHaveBeenCalledWith(expect.objectContaining({
      prompt: expect.stringContaining('технологии будущего')
    }));
  });
});
```

### 7.2 Golden Datasets

**Подход**: Эталонные входы/выходы для `ai-orchestrator`.

```typescript
// tests/ai/golden.spec.ts
const GOLDEN_CASES = [
  {
    input: 'Напиши короткий пост о Python',
    expected: { length: [100, 500], mentions: ['Python'] }
  },
  {
    input: 'Промодерируй этот текст: "Я тебя ненавижу!"',
    expected: { toxic: true, action: 'reject' }
  }
];

describe('Golden Dataset Tests', () => {
  GOLDEN_CASES.forEach(({ input, expected }) => {
    it(`должен корректно обработать: "${input}"`, async () => {
      const result = await aiService.process(input);
      
      if (expected.length) {
        expect(result.text.length).toBeGreaterThanOrEqual(expected.length[0]);
        expect(result.text.length).toBeLessThanOrEqual(expected.length[1]);
      }
      
      if (expected.toxic) {
        expect(result.moderation.toxic).toBe(true);
      }
    });
  });
});
```

### 7.3 Bias & Safety Checks

**Инструменты**: `Guardrails`, кастомные метрики

```typescript
// tests/ai/safety.spec.ts
describe('AI Safety', () => {
  it('должен блокировать токсичный контент', async () => {
    const toxic = 'Я тебя ненавижу, идиот!';
    const result = await aiService.moderate(toxic);
    
    expect(result.is_safe).toBe(false);
    expect(result.categories).toContain('toxicity');
  });
  
  it('должен НЕ блокировать безопасный контент', async () => {
    const safe = 'Отличная статья, спасибо!';
    const result = await aiService.moderate(safe);
    
    expect(result.is_safe).toBe(true);
  });
});
```

### 7.4 Latency/Accuracy SLA

**Метрики** (через OpenTelemetry):
- AI generation latency < 2s
- Moderation accuracy ≥95%
- Toxicity detection recall ≥98%

```typescript
// tests/ai/sla.spec.ts
describe('AI SLA', () => {
  it('генерация должна занимать <2s', async () => {
    const start = Date.now();
    await aiService.generatePost('тема');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(2000);
  });
});
```

---

## 8️⃣ Security Testing

> **Цель**: Zero tolerance для high/critical уязвимостей

### Snyk Integration

**Что проверяем**:
- Зависимости (npm, pip)
- Docker образы
- Infrastructure as Code (docker-compose, terraform)

**Команды**:
```bash
snyk test                      # Dependencies
snyk container test [image]    # Docker images
snyk iac test                  # docker-compose.yml
```

**CI/CD Integration**:
```yaml
# .gitlab-ci.yml
snyk:scan:
  stage: security
  script:
    - snyk test --severity-threshold=high
    - snyk container test quark-user-service:latest
  allow_failure: false  # Hard fail на high/critical
```

### SAST (Static Application Security Testing)

**Инструменты**:
- Python: `Bandit`
- JavaScript/TypeScript: `ESLint` + security plugins

**Пример**:
```bash
bandit -r services/user-service/ -ll  # Only high/medium
eslint --ext .ts --plugin security services/user-service/src/
```

### DAST (Dynamic Application Security Testing)

**Инструменты**: `OWASP ZAP`

**Сценарий**:
```bash
# Запуск ZAP против running app
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3000 \
  -r zap-report.html
```

### JWT Security Checks

**Что проверяем**:
- ❌ JWT не хранится в localStorage без `httpOnly`
- ❌ Секреты не захардкожены в коде
- ✅ Ротация секретов через Vault
- ✅ Expiration time ≤15 минут

---

## 🔄 CI/CD Pipeline

### Pipeline Stages

```yaml
stages:
  - lint
  - unit
  - contract
  - security
  - integration
  - chaos          # Minimal must-have
  - performance    # Minimal baseline
  - e2e            # Только при изменении UI/contracts
  - deploy

# Пример: GitLab CI
lint:
  stage: lint
  script: npm run lint

test:unit:
  stage: unit
  script: npm run test:unit
  coverage: '/Lines\s*:\s*(\d+\.?\d*)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

test:contract:
  stage: contract
  script:
    - npm run validate:openapi
    - npm run validate:asyncapi
    - npm run test:contract

snyk:scan:
  stage: security
  script:
    - snyk test --severity-threshold=high
    - snyk container test $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

test:integration:
  stage: integration
  services:
    - docker:dind
  script: npm run test:integration  # Testcontainers

test:chaos:
  stage: chaos
  script:
    - docker-compose -f docker-compose.chaos.yml up -d toxiproxy
    - npm run test:chaos

test:performance:
  stage: performance
  script:
    - docker-compose -f docker-compose.e2e.yml up -d
    - k6 run tests/performance/baseline.load.js

test:e2e:
  stage: e2e
  rules:
    - changes:
        - contracts/**/*
        - infra/quark-ui/**/*
  script:
    - docker-compose -f docker-compose.e2e.yml up -d
    - npm run test:e2e
  artifacts:
    when: on_failure
    paths:
      - tests/e2e/screenshots/
      - tests/e2e/videos/
```

---

## 📊 Метрики качества

### Цели (Definition of Done)

| Метрика | Цель | Инструмент |
|---------|------|-----------|
| **Contract tests pass rate** | 100% | spectral, AsyncAPI CLI, Pact |
| **Integration tests pass rate** | 100% | Jest + Testcontainers |
| **Unit coverage (критичное)** | ≥90% | Jest --coverage |
| **Chaos tests pass rate** | 100% | Toxiproxy + Jest |
| **Performance baseline** | p95 <500ms @10 RPS | k6 |
| **E2E flakiness** | <2% | Playwright |
| **Security vulns (high/critical)** | 0 | Snyk |
| **MTTR (Mean Time To Recover)** | <10 мин | Grafana + OpenTelemetry |
| **MTTD (Mean Time To Detect)** | <5 мин | Prometheus alerts |

### Dashboards

**Grafana Dashboard** для метрик тестов:
- Test success rate (по уровням)
- Test execution time (тренды)
- Coverage (по сервисам)
- Security vulnerabilities (Snyk feed)

---

## 🤖 Роль ИИ в тестировании

### 1. AI Test Generator

**Вход**: OpenAPI + AsyncAPI + spec.md (user stories)  
**Выход**: Contract, Integration, Unit, E2E тесты

**Команда**:
```bash
./quark-manager.sh spec:generate-tests [###] --type=all
```

**Что генерируется**:
- Contract tests из OpenAPI schemas
- Integration test stubs из AsyncAPI events
- Unit tests из Functional Requirements (spec.md)
- E2E scenarios из user stories

### 2. AI Flakiness Analyzer

**Проблема**: E2E тесты нестабильны (flaky).

**Решение**: AI анализирует логи провалов и предлагает фиксы:
```
❌ Test failed: 'element not found: button[type="submit"]'

💡 AI suggestion:
  - Add `await page.waitForSelector('button[type="submit"]')` before click
  - Or use: `await page.click('button:has-text("Submit")')` (semantic selector)
```

### 3. AI Ops Agent

**Интеграция**: Связывает провалы тестов с метриками из Grafana/Sentry.

**Пример**:
```
❌ Integration test failed: NATS connection timeout

🤖 AI Ops Agent analysis:
  - Grafana: NATS CPU = 95% (threshold = 80%)
  - Sentry: 15 errors "connection refused" (last 5 min)
  - Suggestion: Increase NATS memory limit in docker-compose.yml
```

### 4. Self-Healing Tests

**Playwright + AI**: Автоматическая адаптация селекторов при изменениях UI.

**До**:
```typescript
await page.click('button.submit-form-btn-primary');  // Breaks if CSS class changes
```

**После**:
```typescript
await page.click('button:has-text("Submit")');  // Works even if CSS changes
```

---

## 📁 Структура репозитория

```
/quark
├── services/
│   ├── auth-service/
│   │   ├── src/
│   │   └── tests/
│   │       ├── unit/
│   │       ├── integration/
│   │       ├── contract/
│   │       ├── chaos/
│   │       └── performance/
│   ├── blog-service/
│   │   └── tests/
│   └── user-service/
│       └── tests/
├── infra/
│   └── quark-ui/
│       └── tests/
│           ├── unit/
│           └── e2e/
├── tests/
│   ├── contract/       # Pact contracts (cross-service)
│   ├── e2e/            # Full-stack E2E scenarios
│   ├── performance/    # k6 scripts
│   └── chaos/          # Toxiproxy scenarios
├── specs/              # Specifications (source of truth)
│   ├── 001-user-service/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── contracts/
│   │       ├── openapi.yaml
│   │       ├── asyncapi.yaml
│   │       └── module-manifest.yaml
├── docs/
│   └── testing/
│       ├── strategy.md          # Этот документ
│       ├── ci-cd-pipeline.yml   # Детальный CI/CD
│       └── test-data/           # Golden datasets для AI
├── docker-compose.e2e.yml        # E2E test environment
├── docker-compose.chaos.yml      # Chaos test environment (Toxiproxy)
└── .gitlab-ci.yml                # CI/CD pipeline
```

---

## 🎯 Roadmap для Quark

### Phase 1: MVP (Текущий этап)
- ✅ Contract tests (REST + Events)
- ✅ Integration tests с Testcontainers
- ✅ Minimal chaos tests (NATS disconnect)
- ✅ Minimal performance baseline (10 RPS)
- ✅ Unit tests для критичной логики
- ✅ E2E для core scenarios

### Phase 2: Beta (100 пользователей)
- ⬜ Full chaos suite (network partition, cascading failures)
- ⬜ Load testing (100 RPS)
- ⬜ Soak testing (8 часов)
- ⬜ Advanced E2E (все user stories)

### Phase 3: Production (1000+ пользователей)
- ⬜ Chaos engineering в production (Chaos Mesh)
- ⬜ Stress testing (до точки отказа)
- ⬜ Shadow traffic testing
- ⬜ Canary deployments с automated rollback

---

## 💡 Итоговые рекомендации

### Для Solo Developer + AI:

**Must-have** (не откладывать):
1. ✅ **Contract tests** — автоматически из OpenAPI/AsyncAPI
2. ✅ **Integration tests** — Testcontainers для NATS + PostgreSQL
3. ✅ **Minimal chaos** — NATS disconnect (30 минут)
4. ✅ **Minimal perf** — 10 RPS baseline (10 минут)
5. ✅ **Security** — Snyk в CI (5 минут setup)

**Should-have** (после MVP):
6. ⚠️ **Unit tests** — AI генерирует из spec.md
7. ⚠️ **E2E** — Playwright для критичных сценариев

**Nice-to-have** (после первых пользователей):
8. 🔵 **Full chaos suite**
9. 🔵 **Load testing** (100+ RPS)

---

## 📚 Дополнительные ресурсы

- [OpenAPI Specification](https://swagger.io/specification/)
- [AsyncAPI Specification](https://www.asyncapi.com/docs/reference)
- [Testcontainers Documentation](https://testcontainers.com/)
- [Pact Documentation](https://docs.pact.io/)
- [k6 Documentation](https://k6.io/docs/)
- [Playwright Documentation](https://playwright.dev/)
- [Toxiproxy GitHub](https://github.com/Shopify/toxiproxy)
- [Chaos Mesh Documentation](https://chaos-mesh.org/docs/)

---

**Утверждено Главным Архитектором: 2025-11-03**
