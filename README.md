# 🚀 Платформа Quark - МКС-архитектура нового поколения

> **Модульная, ИИ-нативная платформа для блогов и мессенджера**  
> Спроектиро├── 🔌 services/
│   ├── 🎯 plugin-hub/                     # ⭐ Центральный стыковочный узел
│   │   ├── src/
│   │   │   ├── index.ts                   # Основной сервер
│   │   │   ├── quark-mks-sdk.ts          # TypeScript SDK
│   │   │   ├── ServiceRegistry.ts         # Реестр модулей
│   │   │   ├── HealthMonitor.ts          # Мониторинг здоровья
│   │   │   └── EventBus.ts               # NATS интеграция
│   │   ├── package.json                   # JWT deps: jsonwebtoken, bcryptjs
│   │   └── Dockerfile                     # Контейнеризация
│   ├── 🔐 auth-service/                   # ⭐ JWT Аутентификация ✅ ЗАВЕРШЕН
│   │   ├── src/
│   │   │   ├── main.ts                    # Bootstrap + Plugin Hub регистрация
│   │   │   ├── app.module.ts             # Основной модуль приложения
│   │   │   ├── auth/                      # Модуль аутентификации
│   │   │   └── users/                     # Модуль пользователей
│   │   ├── Dockerfile                     # Мультистадийная сборка Node.js 20
│   │   └── package.json                   # NestJS + TypeORM + JWT
│   ├── 📊 monitoring/                     # ⭐ Корпоративный мониторинг ✅ ЗАВЕРШЕН
│   │   ├── dashboard.html                 # Строгий корпоративный интерфейс
│   │   ├── server.js                      # Express API сервер
│   │   └── package.json                   # Minimal dependencies
│   ├── 📝 blog-service/                   # Блог-платформа (планируется)  
│   ├── 👤 user-service/                   # Управление пользователями
│   ├── 💬 messaging-service/              # WebSocket мессенджер
│   └── 🤖 ai-orchestrator/                # ИИ-агенты и LLMана с участием ИИ по принципу Международной Космической Станции

## 🎯 Быстрый старт

### Запуск всей платформы одной командой:
```bash
# Запустить все сервисы МКС Quark
./quark-manager.sh start

# Проверить статус
./quark-manager.sh status

# Health check API
./quark-manager.sh health
```

**Доступные endpoints:**
- 🌐 **Plugin Hub API**: http://localhost:3000/health
- � **Auth Service API**: http://localhost:3001/auth/health
- �📊 **Monitoring Dashboard**: http://localhost:3900  
- 🔧 **Traefik Dashboard**: http://localhost:8080

### Управление сервисами:
```bash
./quark-manager.sh restart plugin-hub  # Перезапуск модуля
./quark-manager.sh rebuild monitoring  # Пересборка + запуск
./quark-manager.sh logs plugin-hub     # Просмотр логов
./quark-manager.sh --help              # Полная справка
```

## ✅ Завершенные этапы

### 1. 📐 Архитектура и планирование
- [x] **Универсальный интерфейс стыковки (УИС)** - система обнаружения и инициализации модулей
- [x] **Полная документация** - 50+ документов в `/docs/` (ADR, API, Security, Testing)
- [x] **16-недельный план реализации** с анализом рисков и фазовой декомпозицией
- [x] **Межмодульная аутентификация** - JWT с трехуровневой системой токенов
- [x] **Критический анализ архитектуры** - выявлены ключевые компоненты и зависимости

### 2. 🏗️ Инфраструктура и безопасность  
- [x] **HashiCorp Vault** - централизованное управление секретами с ротацией JWT_SECRET
- [x] **Docker Compose** - полная инфраструктура (Traefik, NATS, PostgreSQL, Redis, MinIO)
- [x] **NATS JetStream** - Event Bus для асинхронной коммуникации между модулями
- [x] **Мультибазовая архитектура** - изолированные БД для каждого микросервиса
- [x] **OpenTelemetry мониторинг** - Grafana + Tempo + Loki для observability

### 3. 🔌 Plugin Hub - Центральный стыковочный узел
- [x] **Универсальный протокол регистрации** - совместимость с любыми технологиями
- [x] **Service Discovery** - автоматическое обнаружение и мониторинг модулей  
- [x] **Health Check автоматизация** - непрерывный мониторинг состояния модулей
- [x] **Event Bus интеграция** - публикация и подписка на события через NATS
- [x] **TypeScript SDK** - готовый к использованию SDK для Node.js модулей
- [x] **Identity Provider** - централизованная аутентификация с JWT токенами (в процессе)

### 4. � Auth Service - JWT Аутентификация ✅ ЗАВЕРШЕН
- [x] **NestJS + TypeScript** - современный фреймворк с декораторами и DI
- [x] **PostgreSQL интеграция** - TypeORM для работы с пользователями
- [x] **JWT аутентификация** - генерация и валидация токенов
- [x] **Plugin Hub регистрация** - автоматическая регистрация в Service Registry
- [x] **Периодический heartbeat** - поддержание актуального статуса каждые 30 секунд
- [x] **Health checks** - `/auth/health` endpoint для мониторинга
- [x] **Docker контейнеризация** - мультистадийная сборка с оптимизацией
- [x] **Безопасность** - non-root пользователь, минимальные привилегии

### 5. 📊 Monitoring Dashboard - Корпоративный мониторинг ✅ ЗАВЕРШЕН
- [x] **Корпоративный дизайн** - строгий интерфейс без ярких цветов и анимаций
- [x] **Real-time статус** - автоматическое обновление каждые 10 секунд
- [x] **Plugin Hub интеграция** - мониторинг зарегистрированных сервисов
- [x] **Системные метрики** - время работы в формате HH:MM:SS, использование памяти
- [x] **Статус индикаторы** - зеленый/желтый/красный на основе heartbeat
- [x] **REST API** - полнофункциональное API для интеграции с другими системами

### 6. �🛠️ DevOps и инструменты управления
- [x] **Quark МКС Service Manager** - профессиональный скрипт управления (`quark-manager.sh`)
- [x] **Цветной интерфейс управления** - красивый вывод статусов и операций
- [x] **Селективные операции** - управление отдельными сервисами и группами
- [x] **Health monitoring** - автоматическая проверка API endpoints
- [x] **Автоматическое логирование** - запись всех операций в `logs/quark-manager.log`
- [x] **Smart deployment** - учет зависимостей и правильный порядок запуска
- [x] **Docker окружение** - автоматическое создание networks и управление контейнерами

## 🔄 В активной разработке

### 7. 🛠️ Микросервисы экосистемы
- [x] **Auth Service** (NestJS) - ✅ ЗАВЕРШЕН: JWT аутентификация, регистрация, heartbeat
- [ ] **Blog Service** (NestJS) - создание постов, медиа, события 
- [ ] **User Service** (NestJS) - профили, подписки, социальные функции
- [ ] **Messaging Service** (NestJS + WebSocket) - реалтайм чат
- [ ] **AI Orchestrator** (FastAPI + LangChain) - управление ИИ-агентами

## 📋 Roadmap: Следующие 16 недель

### Фаза 1: Базовая экосистема (Недели 1-4) ✅ ЗАВЕРШЕНА
1. **✅ Завершение Plugin Hub Identity Provider**
2. **✅ Auth Service с Plugin Hub интеграцией** 
3. **✅ Monitoring Dashboard с корпоративным дизайном**
4. **✅ Тестирование межмодульной регистрации и heartbeat**

### Фаза 2: Расширение экосистемы (Недели 5-8)  
1. **Blog Service с универсальной стыковкой**
2. **User Service с социальными функциями**
3. **Messaging Service с WebSocket**
4. **Тестирование полной экосистемы микросервисов**

### Фаза 3: Мультитехнологичные SDK (Недели 9-12)
1. **Python SDK** для FastAPI сервисов
2. **PHP SDK** для существующих систем
3. **Go SDK** для высокопроизводительных модулей
4. **Java SDK** для корпоративной интеграции

### Фаза 4: ИИ-интеграция (Недели 13-16)
1. **AI Orchestrator** - управление LLM агентами
2. **AI Ops Agent** - самооптимизация системы
3. **Модерация контента** с ИИ
4. **Генерация постов** с human-in-the-loop

## 📁 Структура проекта

```
/var/www/quark/
├── 📚 docs/                               # Полная техническая документация
│   ├── 🏗️ architecture/                   # ADR, C4 диаграммы, tech matrix
│   │   ├── universal-docking-interface.md # ⭐ Спецификация УИС
│   │   └── adr-*.md                       # Архитектурные решения
│   ├── 🔐 security/                       # Безопасность, угрозы, Vault
│   │   ├── inter-module-auth.md           # ⭐ Межмодульная аутентификация  
│   │   ├── vault.md                       # HashiCorp Vault конфигурация
│   │   └── threat-model-report.md         # STRIDE анализ угроз
│   ├── 🔬 analysis/                       # Критический анализ архитектуры
│   │   └── universal-docking-critical-analysis.md # ⭐ 16-недельный план
│   ├── 🌐 api/                            # OpenAPI, AsyncAPI спецификации
│   ├── 🧪 quality/                        # Тестирование, код-ревью
│   └── 📊 monitoring/                     # Observability, метрики
├── 🔌 services/
│   ├── 🎯 plugin-hub/                     # ⭐ Центральный стыковочный узел
│   │   ├── src/
│   │   │   ├── index.ts                   # Основной сервер
│   │   │   ├── quark-mks-sdk.ts          # TypeScript SDK
│   │   │   ├── ServiceRegistry.ts         # Реестр модулей
│   │   │   ├── HealthMonitor.ts          # Мониторинг здоровья
│   │   │   └── EventBus.ts               # NATS интеграция
│   │   ├── package.json                   # JWT deps: jsonwebtoken, bcryptjs
│   │   └── Dockerfile                     # Контейнеризация
│   ├── 🔐 auth-service/                   # Аутентификация (планируется)
│   ├── 📝 blog-service/                   # Блог-платформа (планируется)  
│   ├── � user-service/                   # Управление пользователями
│   ├── 💬 messaging-service/              # WebSocket мессенджер
│   └── 🤖 ai-orchestrator/                # ИИ-агенты и LLM
├── 🐳 docker-compose.yml                  # ⭐ Полная инфраструктура
├── 🗄️ init-databases.sql                  # Мультибазовая инициализация
└── 📋 README.md                          # Этот файл
```

## 🌟 Ключевые особенности МКС-архитектуры

### 🔌 Универсальный интерфейс стыковки (УИС)
- **Технологическая агностичность** - совместимость с Node.js, Python, PHP, Go, Java
- **Автоматическое обнаружение** - модули самостоятельно регистрируются в системе
- **Горячая замена** - добавление/удаление модулей без перезапуска системы
- **Стандартизированные контракты** - единый формат манифестов и API

### 🔐 Трехуровневая аутентификация
- **User Tokens** - для клиентских приложений (15 мин + refresh 7 дней)
- **Service Tokens** - для межсервисной коммуникации с ограниченными правами  
- **Hub Tokens** - для доверенных операций Plugin Hub как Identity Provider
- **Vault интеграция** - ротация JWT_SECRET каждые 30 минут

### 📡 Event-Driven коммуникация
- **NATS JetStream** - персистентная очередь событий с replay capability
- **Асинхронная обработка** - слабая связанность между модулями
- **Типизированные события** - AsyncAPI контракты для всех событий
- **Guaranteed delivery** - надежная доставка критичных сообщений

## 🚀 Быстрый старт

```bash
# Клонирование проекта
git clone http://192.168.1.109/root/quark.git
cd quark

# Запуск полной инфраструктуры через Quark Manager
./quark-manager.sh start

# Проверка статуса всех сервисов
./quark-manager.sh status

# Health check API endpoints
./quark-manager.sh health

# Проверка Plugin Hub
curl http://localhost:3000/health

# Monitoring Dashboard
open http://localhost:3900

# Traefik Dashboard  
open http://localhost:8080
```

### 📚 Подробная документация

- **[Quark МКС Service Manager](docs/quark-manager.md)** - Полное руководство по управлению сервисами
- **[Development Plan](docs/development-plan.md)** - План разработки и текущий статус
- **[Architecture Overview](docs/architecture/)** - Документация архитектуры МКС

## 🎯 Текущий фокус

**Blog Service разработка** - следующий этап развития экосистемы после успешного завершения Auth Service. Создание блог-платформы с полной интеграцией в МКС архитектуру, включая Universal Docking Interface и Event-Driven коммуникацию.

---

> 💡 **Quark - это не просто платформа. Это новая парадигма модульных, самоорганизующихся систем с ИИ в качестве первоклассного гражданина архитектуры.**
