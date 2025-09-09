# 🚀 Quark-Light — легковесная модульная платформа для самовыражения

> **Quark-Light** — это минимальная, но полнофункциональная версия платформы Quark, созданная для быстрого прототипирования, обучения и экспериментов.  
> Сохраняет **ядро концепции**: блог + мессенджер + модульность + человек в цикле.  
> Реализована на **Python (FastAPI)**, с поддержкой **HTMX/React**, **SQLite**, и **динамических модулей**.  
> Запускается одной командой: `python main.py`

---

## 🎯 Цель проекта

Создать **действующий прототип Quark**, который:
- ✅ Полностью соответствует архитектурной концепции Quark
- ✅ Поддерживает модульность по принципу "МКС" (Международная космическая станция)
- ✅ Позволяет сторонним разработчикам легко создавать и подключать модули
- ✅ Легко развивается в enterprise-версию
- ❌ Без избыточной сложности: Kubernetes, NATS, gRPC, Vault — пока не нужны

> 💡 **Quark-Light — это не упрощение, а ускорение.**  
> Это путь от идеи к работающей системе за **7 дней**.

---

## 🧩 Функционал

| Модуль | Описание |
|-------|--------|
| **`core`** | Ядро: аутентификация, событийная шина, загрузка модулей, маршрутизация |
| **`user-management`** | Регистрация, вход, профиль, аватар, восстановление пароля |
| **`blog`** | Персональный блог (`/user/username/blog`), визуальный редактор, медиа, комментарии |
| **`messaging`** | Веб-мессенджер (аналог Telegram), WebSocket, уведомления |
| **`admin-panel`** | Управление пользователями, контентом, настройками, безопасностью |
| **`module-hub`** | Центр управления модулями: установка, удаление, обновление |

---

## 📦 Архитектура (упрощённая)

```
quark-light/
├── main.py                 # Запуск приложения (FastAPI + ASGI)
├── core/                   # Ядро: auth, events, plugin_loader
├── modules/                # Папка для модулей (автозагрузка)
│   ├── user_management/    # Управление пользователями
│   ├── blog/               # Сервис блогов
│   ├── messaging/          # Мессенджер
│   └── admin_panel/        # Админ-панель
├── db/                     # SQLite + миграции (Aerich)
├── templates/              # Jinja2 + HTMX (или React)
├── static/                 # CSS, JS, изображения
├── cli.py                  # CLI: `quark install blog`, `quark run`
└── config.py               # Настройки
```

---

## 🔗 Ключевые принципы

- **Человек в цикле**: ИИ может предлагать, но решение всегда за пользователем.
- **Модульность по МКС**: каждый модуль — автономный блок, стыкуемый через события.
- **Event-Driven**: все взаимодействия — через события (`post.published`, `user.created`).
- **Легковесность**: один процесс, одна БД, одна команда для запуска.
- **Эволюционируемость**: архитектура позволяет плавно перейти к enterprise-версии.

---

## 🚀 Быстрый старт

### 1. Установка
```bash
git clone https://github.com/quark/quark-light.git
cd quark-light
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Запуск
```bash
python main.py
```

> ✅ Сервер запущен: [http://localhost:8000](http://localhost:8000)

### 3. Регистрация
- Перейдите на `http://localhost:8000/auth/register`
- Создайте аккаунт
- После регистрации: личная страница, блог, доступ к мессенджеру

---

## 🔌 Модульность

### Как работает?
- Модули — это папки в `modules/`
- Каждый модуль имеет `__init__.py` с функцией `register(app)`
- Ядро автоматически загружает и регистрирует модули

### Пример модуля
```python
# modules/seo_analyzer/__init__.py
def register(app):
    @app.on_event("post.published")
    async def analyze_seo(data):
        score = seo_score(data["content"])
        await app.event_bus.publish("seo.analysis.completed", {"post_id": data["id"], "score": score})
```

### Установка модуля
```bash
quark module:install seo-analyzer
# или вручную: скопировать папку в modules/
```

---

## 🛠️ CLI

```bash
quark run                 # Запустить сервер
quark create blog         # Создать шаблон модуля
quark module:list         # Показать подключённые модули
quark module:install      # Установить модуль из локальной папки
quark db:migrate          # Применить миграции
```

---

## 🧪 Тестирование

### Юнит-тесты
```bash
pytest
```

### E2E-тесты (Playwright)
```bash
npx playwright install
npx playwright test
```

### Нагрузочные тесты
```bash
k6 run load-tests/read-posts.js
```

---

## 📊 Мониторинг (базовый)

- Логи: консоль + файл
- Health-check: `GET /health`
- Позже: интеграция с OpenTelemetry (в enterprise-версии)

---

## 🔄 Эволюция в Quark (Enterprise)

Quark-Light — это **первый шаг** к full-scale Quark.  
Когда потребуется масштаб:

| Компонент | Quark-Light | Quark (Enterprise) |
|---------|-------------|--------------------|
| **Язык** | Python | Python + TypeScript |
| **Event Bus** | `asyncio.Queue` | NATS JetStream |
| **Модули** | Python-плагины | Docker + WASM |
| **БД** | SQLite | PostgreSQL + Redis + MinIO |
| **API** | REST (FastAPI) | REST + gRPC |
| **Развёртывание** | `python main.py` | Docker + Kubernetes |
| **Фронтенд** | HTMX / React | React + Next.js |

> ✅ Все события, DTO, манифесты и интерфейсы совместимы.

---

## 📄 Документация

Полная документация находится в каталоге `docs/`:
- [`docs/onboarding.md`](docs/onboarding.md) — как начать
- [`docs/architecture/`](docs/architecture/) — диаграммы C4, ADR
- [`docs/modules/`](docs/modules/) — руководство по созданию модулей
- [`docs/testing/`](docs/testing/) — стратегия тестирования
- [`docs/security/`](docs/security/) — безопасность и соответствие

---

## 🛡️ Безопасность

- Пароли: хеширование через `bcrypt`
- Сессии: защищённые JWT-токены
- Валидация: Pydantic
- Rate limiting: `slowapi`
- Загрузка файлов: проверка MIME-типов, размер < 5 МБ
- Готовность к GDPR и ФЗ-152

---

## 🤝 Участие

- **Архитектор/Постановщик задач**: Человек
- **Разработчик**: Qwen, Claude, Grok (с участием ИИ)
- **Цель**: эксперимент, обучение, демонстрация возможностей

> ✅ Все решения документируются.  
> ✅ ИИ предлагает — человек одобряет.

---

## 📚 Лицензия

MIT License — свободное использование, модификация, распространение.

---

> 💡 **Quark-Light — это не просто прототип. Это семя будущей платформы.**  
> Посади его сегодня — собери урожай завтра.