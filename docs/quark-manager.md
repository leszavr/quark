# Quark МКС Service Manager

## Обзор

**Quark МКС Service Manager** (`quark-manager.sh`) - это универсальный инструмент управления всеми микросервисами платформы Quark. Скрипт обеспечивает удобное управление Docker-контейнерами с цветным интерфейсом, автоматическим логированием и учетом зависимостей.

## Установка и настройка

### Требования
- Docker (версия 20.0+)
- Docker Compose (версия 1.25+)
- bash (версия 4.0+)
- curl (для health checks)

### Первый запуск
```bash
# Сделать скрипт исполняемым
chmod +x quark-manager.sh

# Показать справку
./quark-manager.sh --help

# Запустить все сервисы
./quark-manager.sh start
```

## Команды

### 🚀 Управление жизненным циклом

#### `start` - Запуск сервисов
```bash
# Запустить все сервисы в правильном порядке
./quark-manager.sh start

# Запустить только указанные сервисы
./quark-manager.sh start redis plugin-hub

# Запустить инфраструктурные сервисы
./quark-manager.sh start postgres redis nats vault
```

#### `stop` - Остановка сервисов
```bash
# Остановить все сервисы
./quark-manager.sh stop

# Остановить только указанные сервисы
./quark-manager.sh stop monitoring plugin-hub
```

#### `restart` - Перезапуск сервисов
```bash
# Перезапустить все сервисы
./quark-manager.sh restart

# Перезапустить только мониторинг
./quark-manager.sh restart monitoring
```

### 🔨 Сборка и развертывание

#### `build` - Пересборка образов
```bash
# Пересобрать все микросервисы
./quark-manager.sh build

# Пересобрать только Plugin Hub
./quark-manager.sh build plugin-hub
```

#### `rebuild` - Пересборка с перезапуском
```bash
# Пересобрать и запустить все микросервисы
./quark-manager.sh rebuild

# Пересобрать и запустить мониторинг
./quark-manager.sh rebuild monitoring
```

### 📊 Мониторинг и диагностика

#### `status` - Статус сервисов
```bash
# Показать статус всех сервисов с цветами
./quark-manager.sh status
```

Вывод:
```
✅ postgres - РАБОТАЕТ (PostgreSQL Database (port 5432))
✅ redis - РАБОТАЕТ (Redis Cache & State Store (port 6379))
✅ plugin-hub - РАБОТАЕТ (Plugin Hub - МКС Command Module (port 3000))
❌ auth - НЕ СОЗДАН (Auth Service (port 3001))
```

#### `health` - Health check API
```bash
# Проверить health всех API сервисов
./quark-manager.sh health
```

Проверяет доступность:
- Plugin Hub API (http://localhost:3000/health)
- Monitoring Dashboard (http://localhost:3900)
- Будущие микросервисы...

#### `logs` - Просмотр логов
```bash
# Логи всех сервисов
./quark-manager.sh logs

# Логи конкретного сервиса
./quark-manager.sh logs plugin-hub

# Логи нескольких сервисов
./quark-manager.sh logs plugin-hub monitoring
```

### 🧹 Обслуживание

#### `clean` - Полная очистка
```bash
# ⚠️ ОСТОРОЖНО: Удаляет все контейнеры, образы и volumes
./quark-manager.sh clean
```

#### `list` - Список сервисов
```bash
# Показать все доступные сервисы
./quark-manager.sh list
```

## Архитектура сервисов

### 🏗 Инфраструктурные сервисы

| Сервис | Порт | Описание |
|--------|------|----------|
| `postgres` | 5432 | PostgreSQL Database |
| `redis` | 6379 | Redis Cache & State Store |
| `nats` | 4222 | NATS JetStream Event Bus |
| `vault` | 8200 | HashiCorp Vault Secrets Manager |
| `traefik` | 80/443/8080 | Traefik API Gateway |
| `minio` | 9000/9001 | MinIO Object Storage |

### 🚀 Микросервисы (порты 3000-3020)

| Сервис | Порт | Статус | Описание |
|--------|------|--------|----------|
| `plugin-hub` | 3000 | ✅ Готов | Plugin Hub - МКС Command Module |
| `monitoring` | 3900 | ✅ Готов | Monitoring Dashboard |
| `auth` | 3001 | 📋 Планируется | Auth Service |
| `user` | 3002 | 📋 Планируется | User Service |
| `media` | 3003 | 📋 Планируется | Media Service |
| `blog` | 3004 | 📋 Планируется | Blog Service |
| `messaging` | 3005 | 📋 Планируется | Messaging Service |

## Логирование

Все операции скрипта автоматически логируются в файл `logs/quark-manager.log` с timestamp:

```
[2025-09-15 12:30:45] [INFO] 🚀 Запуск выбранных сервисов: plugin-hub
[2025-09-15 12:30:46] [SUCCESS] ✅ Запуск завершен!
[2025-09-15 12:31:15] [INFO] 📊 Статус сервисов МКС Quark
```

## Порядок запуска

Скрипт автоматически соблюдает правильный порядок запуска с учетом зависимостей:

1. **postgres** - База данных (фундамент)
2. **redis** - Кеш и состояние  
3. **nats** - Event Bus
4. **vault** - Управление секретами
5. **traefik** - API Gateway
6. **minio** - Object Storage
7. **plugin-hub** - Командный модуль МКС
8. **monitoring** - Панель мониторинга

## Примеры использования

### Типичные сценарии разработки

```bash
# Утренний запуск: включить всю инфраструктуру
./quark-manager.sh start

# Проверить что все работает
./quark-manager.sh status
./quark-manager.sh health

# Разработка Plugin Hub: пересборка + перезапуск
./quark-manager.sh rebuild plugin-hub

# Отладка проблем: смотрим логи
./quark-manager.sh logs plugin-hub

# Вечерняя остановка: выключить все
./quark-manager.sh stop
```

### Добавление нового микросервиса

1. **Добавить в docker-compose.yml:**
```yaml
auth-service:
  build: ./services/auth-service
  container_name: quark-auth
  environment:
    - PORT=3001
  ports:
    - "3001:3001"
  networks:
    - quark-network
```

2. **Обновить quark-manager.sh:**
```bash
# Добавить в массив SERVICES
["auth"]="Auth Service (port 3001)"

# Добавить в порядок запуска STARTUP_ORDER
"auth"
```

3. **Использовать:**
```bash
./quark-manager.sh build auth
./quark-manager.sh start auth
```

## Опции командной строки

- `-f, --force` - Принудительная операция
- `-q, --quiet` - Тихий режим (только критические сообщения)
- `-v, --verbose` - Подробный вывод
- `-h, --help` - Показать справку

## Интеграция с Docker

Скрипт работает поверх Docker Compose и автоматически:

- Создает Docker-сеть `quark-network`
- Проверяет наличие Docker и Docker Compose
- Валидирует существование docker-compose.yml
- Учитывает зависимости между сервисами
- Обеспечивает graceful shutdown

## Безопасность

- ✅ Валидация всех входных параметров
- ✅ Проверка существования сервисов
- ✅ Логирование всех операций
- ✅ Безопасная остановка контейнеров
- ⚠️ Команда `clean` требует осторожности

## Troubleshooting

### Проблема: Сервис не запускается
```bash
# Проверить статус
./quark-manager.sh status

# Посмотреть логи
./quark-manager.sh logs <service-name>

# Пересобрать образ
./quark-manager.sh rebuild <service-name>
```

### Проблема: Docker network не найдена
```bash
# Скрипт автоматически создаст сеть при запуске
./quark-manager.sh start
```

### Проблема: Конфликт портов
```bash
# Проверить какие порты заняты
sudo netstat -tulpn | grep :3000

# Остановить конфликтующие сервисы
sudo systemctl stop <conflicting-service>
```

## Будущие улучшения

- [ ] Интерактивное меню (команда `menu`)
- [ ] Поддержка Docker Swarm
- [ ] Интеграция с Kubernetes
- [ ] Автоматическое создание backups
- [ ] Monitoring через Prometheus
- [ ] CI/CD интеграция

---

> **Quark МКС Service Manager** - ваш надежный помощник в управлении микросервисной архитектурой! 🚀
