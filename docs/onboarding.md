# 🚀 Onboarding: Как начать работать с Quark

## Цель
Помочь новому разработчику:
- Запустить Quark локально за 5 минут
- Понять архитектуру
- Создать и подключить модуль
- Написать и запустить тесты

---

## 1. Установка (локальное окружение)

```bash
# Клонируем репозиторий
git clone https://github.com/quark/platform.git
cd platform

# Устанавливаем зависимости
npm install -g @quark/cli  # CLI для управления модулями

# Запускаем всю систему
docker-compose -f docs/examples/docker-compose.dev.yml up --build
```

> ✅ После запуска проверь:
> - `http://localhost:3001/health` — auth-service
> - `http://localhost:3004/api/v1/posts` — blog-service
> - `http://localhost:3005/ws` — messaging-service (WebSocket)

---

## 2. Структура проекта

```
quark/
├── services/               # Микросервисы
│   ├── auth-service/       # Авторизация (FastAPI)
│   ├── blog-service/       # Блог (NestJS)
│   ├── messaging-service/  # Мессенджер (NestJS + WebSocket)
│   └── ...                 # Остальные сервисы
├── docs/                   # Вся документация
├── modules/                # Сторонние модули (после подключения)
├── docker-compose.dev.yml  # Локальный запуск
└── quark-cli/              # CLI для разработчиков
```

---

## 3. Как создать и подключить модуль

### Шаг 1: Создай модуль с помощью CLI
```bash
quark module:create my-seo-analyzer --type wasm
```

### Шаг 2: Изучи структуру
```
my-seo-analyzer/
├── module-manifest.yaml    # Метаданные модуля
├── main.rs                 # Код на Rust (WASM)
└── src/                    # Логика
```

### Шаг 3: Определи, на что подписываться
В `module-manifest.yaml`:
```yaml
name: my-seo-analyzer
version: 1.0.0
type: wasm
runtime: wasmedge
requires:
  - event_bus: nats
  - auth: jwt
exposes:
  - events: seo.analysis.completed
subscribes_to:
  - post.published
```

### Шаг 4: Реализуй логику (пример на Rust)
```rust
#[no_mangle]
pub extern "C" fn on_post_published(post_json: *const u8, len: usize) {
    let post: Post = parse_json(post_json, len);
    let score = analyze_seo(&post.content);
    
    publish_event("seo.analysis.completed", &json!({
        "post_id": post.id,
        "seo_score": score,
        "recommendations": ["add meta description", "improve headings"]
    }));
}
```

### Шаг 5: Подключи к системе
```bash
quark module:deploy ./my-seo-analyzer --env dev
```

> ✅ Модуль появится в `Plugin Hub`, начнёт получать события `post.published`

---

## 4. Как запустить тесты

### Unit-тесты
```bash
# Для auth-service (Python)
cd services/auth-service
pytest tests/unit/

# Для blog-service (TypeScript)
cd services/blog-service
npm test
```

### Интеграционные тесты
```bash
# Запуск всех интеграционных тестов
pytest tests/integration/ --env local
```

### E2E-тесты
```bash
npx playwright test
```

### Нагрузочные тесты
```bash
k6 run docs/testing/load-test-scenarios/read-posts.js
```

---

## 5. Как запустить мониторинг

После запуска `docker-compose`:
- Открой **Grafana**: `http://localhost:3000` (логин: `admin`, пароль: `quark`)
- Перейди в дашборды:
  - `Service Health`
  - `AI Ops Agent`
  - `Event Bus (NATS)`
- Проверь, что все сервисы в статусе `UP`

---

## 6. Как внести изменения и создать PR

1. Создай ветку:
   ```bash
   git checkout -b feature/seo-improvement
   ```

2. Внеси изменения

3. Протестируй:
   ```bash
   pytest && npm test
   ```

4. Зафиксируй:
   ```bash
   git add .
   git commit -m "feat: add SEO analysis"
   ```

5. Создай PR в GitHub

6. Ожидай:
   - Автоматические тесты
   - Ревью от человека
   - Предложение от **AI Ops Agent** (если есть оптимизации)

---

## 7. Полезные ссылки

| Документ | Назначение |
|--------|-----------|
| [`adr-003-module-docking.md`](/docs/adr/adr-003-module-docking.md) | Как работают модули |
| [`api-governance.md`](/docs/api/api-governance.md) | Правила API |
| [`threat-model-report.md`](/docs/security/threat-model-report.md) | Безопасность |
| [`test-plan.md`](/docs/quality/test-plan.md) | Тестирование |
| [`tech-matrix.md`](/docs/architecture/tech-matrix.md) | Почему выбраны эти технологии |

---

## ✅ Готов к старту?
Если ты прошёл все шаги — ты официально **участник экосистемы Quark**.

> 🌟 Добро пожаловать в будущее модульных, ИИ-нативных систем.

## Пример скрипта onboarding.sh

```bash
# scripts/onboarding.sh
#!/bin/bash
echo "🚀 Запуск Quark MVP..."

# Проверка зависимостей
command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose не установлен"; exit 1; }

# Запуск
docker-compose -f docker-compose.dev.yml up --build -d

echo "✅ Система запущена:"
echo "   - Auth: http://localhost:3001/health"
echo "   - Blog: http://localhost:3004/api/v1/posts"
echo "   - Grafana: http://localhost:3000"

# Проверка готовности
sleep 10
curl -f http://localhost:3001/health || echo "⚠️ auth-service не запущен"
```