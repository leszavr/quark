# 🚀 Платформа Quark - МКС-архитектура нового поколения

> **Модульная, ИИ-нативная платформа для блогов и мессенджера**  
> Спроектирована с участием ИИ по принципу Международной Космической Станции

[![Architecture: МКС](https://img.shields.io/badge/Architecture-МКС--модульная-blue.svg)](docs/architecture/)
[![Security: Vault+JWT](https://img.shields.io/badge/Security-Vault+JWT-green.svg)](docs/security/)
[![Infrastructure: Docker](https://img.shields.io/badge/Infrastructure-Docker-blue.svg)](docker-compose.yml)
[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)](#)

## 🔐 Основные возможности

### ⭐ Vault + JWT Security Stack
- **HashiCorp Vault** интеграция для безопасного хранения секретов
- **Трехуровневая система токенов**: User (24h), Service (24h), Hub (48h)
- **Автоматическая ротация JWT секретов** каждые 30 минут
- **Event-driven архитектура** для уведомлений о ротации
- **Graceful secret transition** без простоя сервисов

### 🛠️ Модульная архитектура МКС
- **Plugin Hub** - центральный стыковочный узел для всех модулей
- **Микросервисная архитектура** с независимыми модулями
- **Docker-based deployment** с оркестрацией через docker-compose
- **Service Discovery** и автоматическая регистрация модулей
- **Health Monitoring** с расширенной диагностикой

## 🏗️ Архитектура проекта

```
quark/
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
│   ├── 🔐 auth-service/                   # ⭐ JWT + Vault Аутентификация ✅ ЗАВЕРШЕН
│   │   ├── src/
│   │   │   ├── main.ts                    # Bootstrap + Plugin Hub регистрация
│   │   │   ├── app.module.ts             # Модуль с VaultModule и JwtConfigService
│   │   │   ├── auth/                      # Модуль аутентификации + DynamicJwtService
│   │   │   ├── vault/                     # VaultService с автоматической ротацией
│   │   │   ├── users/                     # Модуль пользователей
│   │   │   └── common/dto/               # DTO для трех типов токенов
│   │   ├── Dockerfile                     # Мультистадийная сборка Node.js 20
│   │   └── package.json                   # NestJS + TypeORM + JWT + Vault
│   ├── 📊 monitoring/                     # ⭐ Корпоративный мониторинг ✅ ЗАВЕРШЕН
│   │   ├── dashboard.html                 # Строгий корпоративный интерфейс
│   │   ├── server.js                      # Express API сервер
│   │   └── package.json                   # Minimal dependencies
│   ├── 📝 blog-service/                   # Блог-платформа (планируется)  
│   ├── 👤 user-service/                   # Управление пользователями
│   ├── 💬 messaging-service/              # WebSocket мессенджер
│   └── 🤖 ai-orchestrator/                # ИИ-агенты и LLM
├── 🏗️ infra/
│   ├── 🎨 quark-ui/                       # ⭐ Admin Console ✅ ЗАВЕРШЕН
│   │   ├── src/                           # Vue.js + Vite приложение
│   │   ├── Dockerfile                     # Nginx + Alpine
│   │   └── package.json                   # Vue.js ecosystem
│   ├── 📡 monitoring/                     # Grafana + Prometheus
│   ├── 🔑 vault/                          # HashiCorp Vault конфигурация
│   └── 🌐 plugin-hub/                     # Конфигурация центрального узла
├── 📋 docs/                               # Техническая документация
│   ├── architecture/                      # Архитектурные решения
│   ├── security/                          # Документация по безопасности
│   └── api/                              # API документация
├── 🚀 quark-manager.sh                    # ⭐ Единый скрипт управления ✅ ОБНОВЛЕН
├── 🐳 docker-compose.yml                  # Оркестрация сервисов
└── 📖 README.md                           # Этот файл
```

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
- 🔐 **Auth Service API**: http://localhost:3001/auth/health  
- 📊 **Monitoring Dashboard**: http://localhost:3900
- 🎨 **Admin Console**: http://localhost:3100
- 🔧 **Traefik Dashboard**: http://localhost:8080
- 🔑 **Vault UI**: http://localhost:8200

## 🔐 Security Architecture

### JWT + Vault Integration
- **HashiCorp Vault** в dev-режиме (токен: `myroot`)
- **Автоматическая ротация секретов** каждые 30 минут
- **Три типа токенов**:
  - `User Token`: 24 часа (для пользователей)
  - `Service Token`: 24 часа (для межсервисного взаимодействия)
  - `Hub Token`: 48 часов (для Plugin Hub)

### API Endpoints для аутентификации:
```bash
# Регистрация пользователя
POST http://localhost:3001/auth/register

# Логин
POST http://localhost:3001/auth/login

# Создание Service Token
POST http://localhost:3001/auth/tokens/service

# Создание Hub Token
POST http://localhost:3001/auth/tokens/hub

# Валидация токена
POST http://localhost:3001/auth/validate
```

## 🏛️ Инфраструктура

### Основные компоненты:
- **PostgreSQL** (port 5432) - основная база данных
- **Redis** (port 6379) - кэш и хранилище состояний
- **NATS JetStream** (port 4222) - событийная шина
- **HashiCorp Vault** (port 8200) - управление секретами
- **Traefik** (ports 80/443/8080) - API Gateway
- **MinIO** (ports 9000/9001) - объектное хранилище

## 🛠️ Управление сервисами

```bash
# Запуск отдельных сервисов
./quark-manager.sh start plugin-hub auth-service

# Остановка сервисов
./quark-manager.sh stop auth-service

# Перезапуск
./quark-manager.sh restart plugin-hub

# Пересборка образов
./quark-manager.sh rebuild auth-service

# Логи сервисов
./quark-manager.sh logs auth-service

# Интерактивное меню
./quark-manager.sh menu
```

## 📚 Документация

- [Архитектурные решения](docs/architecture/) - ADR документы
- [API Документация](docs/api/) - OpenAPI спецификации
- [Безопасность](docs/security/) - Security guidelines
- [Развертывание](docs/deployment-runbook.md) - Production deployment
- [Мониторинг](docs/monitoring-strategy.md) - Observability strategy

## 🤝 Участие в разработке

Проект использует МКС-подход к разработке:
1. Каждый модуль независим и может разрабатываться отдельно
2. Стандартизированные интерфейсы для интеграции
3. Event-driven взаимодействие через NATS
4. Comprehensive testing и CI/CD

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE) файл.

---

**Платформа Quark** - МКС-архитектура для создания модульных, масштабируемых и безопасных приложений. 🚀
