# 🚀 Quark MKS Platform - Модульная платформа для блогов и мессенджера

```
├── 🔌 services/
│   ├── 🔐 auth-service/                   # ⭐ JWT Аутентификация ✅ ГОТОВ
│   │   ├── src/                           # NestJS приложение
│   │   ├── Dockerfile                     # Node.js 20 контейнер
│   │   └── package.json                   # NestJS + TypeORM + JWT
│   ├── 📝 blog-service/                   # ⭐ Blog API ✅ ГОТОВ
│   │   ├── src/                           # Express приложение
│   │   ├── Dockerfile                     # Node.js контейнер
│   │   └── package.json                   # Express + Sequelize
├── 🏗️ infra/
│   ├── 📊 monitoring/                     # ⭐ Система мониторинга ✅ ГОТОВ
│   │   ├── server.js                      # Express dashboard сервер
│   │   ├── dashboard.html                 # HTML интерфейс мониторинга
│   │   └── Dockerfile                     # Контейнер мониторинга
│   ├── 🌐 plugin-hub/                     # ⭐ Plugin Hub ✅ ГОТОВ
│   │   ├── src/                           # Центральный узел модулей
│   │   └── Dockerfile                     # Контейнер plugin системы
│   └── 🔐 vault/                          # HashiCorp Vault конфигурацияая full-stack пла## 🌐 Доступные сервисы и порты
```

### 🏛️ Frontend интерфейсы:
- 🎨 **Quark Landing**: http://localhost:3200 - главная страница платформы с WebGL
- 🖥️ **Quark UI (Admin)**: http://localhost:3101 - административная панель
- 📊 **Monitoring Dashboard**: http://localhost:3900 - система мониторинга
- 📚 **Swagger UI**: http://localhost:8081 - API документация
- 🔧 **Traefik Dashboard**: http://localhost:8080 - управление маршрутизацией

### Backend API сервисы:
- 🔐 **Auth Service**: http://localhost:3001
- 📝 **Blog Service**: http://localhost:3004
- 🔌 **Plugin Hub**: http://localhost:3000

### Инфраструктурные сервисы:
- 🗄️ **PostgreSQL**: localhost:5432
- 🗂️ **Redis**: localhost:6379
- 💬 **NATS**: localhost:4222 (client), :6222 (cluster), :8222 (monitoring)
- 🔐 **Vault**: http://localhost:8200
- 📦 **MinIO**: http://localhost:9000 (API), :9001 (Console)
- 🌐 **Traefik**: :80 (HTTP), :443 (HTTPS), :8080 (Dashboard)

### 🔧 Пул используемых портов:

**Frontend:**
3101 (quark-ui), 3200 (landing), 3900 (monitoring), 8080 (traefik), 8081 (swagger)

**Backend API:**
3000 (plugin-hub), 3001 (auth-service), 3004 (blog-service)

**Infrastructure:**
80/443 (traefik), 4222/6222/8222 (nats), 5432 (postgres), 6379 (redis), 
8200 (vault), 9000/9001 (minio)
с Next.js 15 + React 19**  
Backend API + Адаптивный UI с мессенджером и блогами

[![Frontend: Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015-black.svg)](infra/quark-ui/)
[![Backend: Docker](https://img.shields.io/badge/Backend-Docker%20Services-blue.svg)](docker-compose.yml)
[![UI: Radix UI](https://img.shields.io/badge/UI-Radix%20UI%20%2B%20Tailwind-blue.svg)](infra/quark-ui/)
[![Package Manager: pnpm](https://img.shields.io/badge/Package%20Manager-pnpm%20workspace-orange.svg)](pnpm-workspace.yaml)
[![Status: 13 Services Ready](https://img.shields.io/badge/Status-13%20Services%20Ready-green.svg)](#)

## ⚡ Последние обновления (02.11.2025)

### 🔄 Технологическая миграция:
- ✅ **npm → pnpm workspace** - переход на monorepo архитектуру
- ✅ **Chakra UI → Radix UI + Tailwind** - миграция UI библиотеки (в процессе)
- ✅ **Quark Landing** - добавлена landing page с WebGL анимацией
- ✅ **Production Docker** - все сервисы работают в production режиме

## ✨ Основные возможности

### 🎨 Современный Frontend интерфейс
- **Next.js 15** + **React 19** с Turbopack
- **Radix UI** + **Tailwind CSS 4** для современного UI
- **pnpm workspace** monorepo структура
- **Адаптивный дизайн** - автоматическое переключение mobile/desktop
- **ResizableSplitter** - перетаскиваемые панели для desktop
- **6 цветовых тем** + темная/светлая темы
- **Полноценный мессенджер** с статусами и онлайн индикаторами
- **Landing page** с WebGL фоновой анимацией

### 🛠️ Backend API сервисы
- **Auth Service** (NestJS) - JWT аутентификация и регистрация
- **Blog Service** (Express) - управление блогами и постами
- **PostgreSQL** база данных с миграциями
- **Docker Compose** оркестрация всех сервисов
- **Traefik** reverse proxy и load balancer

## 🏗️ Архитектура проекта

```
quark/
├── 🏗️ infra/
│   ├── 🎨 quark-ui/                       # ⭐ Административный интерфейс ✅ ГОТОВ
│   │   ├── src/
│   │   │   ├── app/                       # Next.js 15 App Router
│   │   │   ├── components/                # React 19 компоненты (Radix UI)
│   │   │   │   ├── layout/                # Header, MainLayout, ResizableLayout
│   │   │   │   ├── admin/                 # Админ панель
│   │   │   │   ├── profile/               # Профиль пользователя
│   │   │   │   ├── BlogFeed.tsx          # Система блогов
│   │   │   │   ├── ChatWindow.tsx        # Мессенджер
│   │   │   │   └── ResizableSplitter.tsx # Перетаскиваемые панели
│   │   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── stores/                    # Zustand state management
│   │   │   └── styles/                    # Tailwind CSS конфигурация
│   │   └── package.json                   # Next.js 15 + React 19 + Radix UI
│   ├── 🌟 quark-landing/                  # ⭐ Landing page ✅ ГОТОВ
│   │   ├── app/                           # Next.js 16 приложение
│   │   ├── components/                    # React компоненты с WebGL
│   │   ├── public/                        # Статические ресурсы
│   │   └── Dockerfile                     # Production build
│   ├── 📊 monitoring/                     # ⭐ Система мониторинга ✅ ГОТОВ
│   │   ├── server.js                      # Express dashboard сервер
│   │   └── Dockerfile                     # Контейнер мониторинга
│   ├── 🌐 plugin-hub/                     # ⭐ Plugin Hub ✅ ГОТОВ
│   │   ├── src/                           # Центральный узел модулей
│   │   └── Dockerfile                     # Контейнер plugin системы
│   └── 🔐 vault/                          # HashiCorp Vault конфигурация
├── 🔌 services/
│   ├── 🔐 auth-service/                   # ⭐ JWT Аутентификация ✅ ГОТОВ
│   │   ├── src/                           # NestJS приложение
│   │   ├── Dockerfile                     # Node.js 20 контейнер
│   │   └── package.json                   # NestJS + TypeORM + JWT
│   ├── 📝 blog-service/                   # ⭐ Blog API ✅ ГОТОВ
│   │   ├── src/                           # Express приложение
│   │   ├── Dockerfile                     # Node.js контейнер
│   │   └── package.json                   # Express + Sequelize
│   ├── 📊 monitoring/                     # Система мониторинга
│   │   └── server.js                      # Express сервер
│   └── 🌐 plugin-hub/                     # Plugin система
├── 📋 docs/                               # Документация проекта
├── 🚀 quark-manager.sh                    # Управление сервисами
├── 🐳 docker-compose.yml                  # Оркестрация всех сервисов
└── 📖 README.md                           # Этот файл
```

## 🎯 Быстрый старт

### 🚀 Запуск всей платформы одной командой:
```bash
# Запустить все сервисы Quark
./quark-manager.sh start

# Проверить статус
./quark-manager.sh status

# Health check всех API
./quark-manager.sh health
```

### 🛠️ Ручной запуск (для разработки):

**1️⃣ Backend сервисы:**
```bash
# Запустить все backend сервисы
docker-compose up -d

# Проверить статус сервисов
docker-compose ps
```

**2️⃣ UI интерфейс:**
```bash
# Перейти в папку UI
cd infra/quark-ui

# Установить зависимости
npm install

# Запустить dev сервер
npm run dev
```

**Доступные сервисы:**
- � **UI-end интерфейс**: http://localhost:3000 (или :3002)
- 🔐 **Auth Service API**: http://localhost:3001
- � **Blog Service API**: http://localhost:3004  
- 📊 **Monitoring**: http://localhost:3900
- 🔧 **Traefik Dashboard**: http://localhost:8080
- �️ **PostgreSQL**: localhost:5432

## 🔐 API Endpoints

### Auth Service (порт 3001):
```bash
# Регистрация нового пользователя
POST http://localhost:3001/auth/register
{
  "name": "Иван Петров",
  "email": "ivan@example.com", 
  "password": "securePassword"
}

# Авторизация пользователя
POST http://localhost:3001/auth/login
{
  "email": "ivan@example.com",
  "password": "securePassword"
}

# Получение профиля пользователя
GET http://localhost:3001/auth/me
Authorization: Bearer <jwt_token>
```

### Blog Service (порт 3004):
```bash
# Получить все посты
GET http://localhost:3004/api/posts

# Создать новый пост
POST http://localhost:3004/api/posts
Authorization: Bearer <jwt_token>

# Получить пост по ID
GET http://localhost:3004/api/posts/:id
```

### Monitoring Dashboard (порт 3900):
```bash
# Статус всех сервисов
GET http://localhost:3900/api/status

# Health check всех компонентов
GET http://localhost:3900/api/health

# Информация о Plugin Hub
GET http://localhost:3900/api/plugin-hub/info

# Мониторинг dashboard
GET http://localhost:3900/
```

### Plugin Hub (порт 3000):
```bash
# Информация о системе
GET http://localhost:3000/api/system/info

# Список активных модулей
GET http://localhost:3000/api/modules

# Статус модуля
GET http://localhost:3000/api/modules/:id/status
```

## 🏛️ Технологический стек

### Frontend (UI-end):
- **Next.js 15** с App Router и Turbopack
- **React 19** с новейшими возможностями
- **TypeScript 5.6** для типизации
- **Chakra UI 2.8** + **Tailwind CSS** для стилизации
- **Zustand 4.5** для управления состоянием
- **Framer Motion 11** для анимаций
- **TipTap** редактор для Markdown

### Backend Services:
- **NestJS** (Auth Service) - JWT аутентификация
- **Express.js** (Blog Service) - REST API
- **PostgreSQL 16** - основная база данных
- **TypeORM** + **Sequelize** ORM
- **Docker** + **Docker Compose** для оркестрации

### Инфраструктура:
- **Traefik** (порты 80/443/8080) - reverse proxy & load balancer
- **PostgreSQL** (порт 5432) - основная база данных
- **Redis** (порт 6379) - кэширование и сессии  
- **NATS** (порты 4222/6222/8222) - event bus и message broker
- **MinIO** (порты 9000/9001) - объектное файловое хранилище
- **HashiCorp Vault** (порт 8200) - управление секретами
- **Plugin Hub** (порт 3000) - центральная система модулей
- **Monitoring Dashboard** (порт 3900) - система мониторинга сервисов

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
