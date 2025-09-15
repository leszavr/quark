# Добро пожаловать в проект Quark!

## Обзор

Quark - это проект по созданию микросервисной архитектуры с полным циклом разработки, развертывания и мониторинга. В проекте реализованы различные сервисы, инфраструктурные компоненты и инструменты для управления ими.

## Структура проекта

```
quark/
├── docs/                    # Документация проекта
├── infra/                   # Инфраструктурные компоненты
│   ├── monitoring/          # Система мониторинга
│   ├── plugin-hub/          # Центральный узел управления модулями
│   ├── quark-ui/           # Административный интерфейс платформы
│   └── vault/              # Управление секретами (будет реализовано)
├── services/                # Бизнес-сервисы
│   └── auth-service/        # Сервис аутентификации
└── test-metrics/            # Тестовый генератор метрик
```

## Начало работы

### Предварительные требования

- Docker
- Docker Compose
- Git

### Быстрый старт

1. Клонируйте репозиторий:
   ```bash
   git clone <repository-url>
   cd quark
   ```

2. Запустите всю систему через quark-manager:
   ```bash
   ./quark-manager.sh up
   ```

3. Или запустите отдельные компоненты:
   ```bash
   # Запуск инфраструктуры
   ./quark-manager.sh infra:up
   
   # Запуск UI для разработки
   ./quark-manager.sh ui:dev
   
   # Запуск конкретного сервиса
   ./quark-manager.sh service:auth:up
   ```

## Система мониторинга

### Компоненты

Система мониторинга включает следующие компоненты:

- **Prometheus** - сбор и хранение метрик
- **Loki** - сбор и хранение логов
- **Tempo** - сбор и хранение трассировок
- **Grafana** - визуализация данных
- **OpenTelemetry Collector** - центральный сборщик телеметрии

### Запуск мониторинга

```bash
cd /var/www/quark
docker-compose -f infra/monitoring/docker-compose.monitoring.yml up -d
```

### Проверка состояния компонентов

```bash
docker-compose -f infra/monitoring/docker-compose.monitoring.yml ps
```

### Доступ к интерфейсам

- **Grafana**: http://localhost:3000 (admin / quark)
- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100
- **Tempo**: http://localhost:3200

### Остановка мониторинга

```bash
docker-compose -f infra/monitoring/docker-compose.monitoring.yml down
```

## Auth Service

Auth Service - это сервис аутентификации и авторизации.

### Запуск

```bash
cd services/auth-service
docker-compose up -d
```

### Проверка состояния

```bash
docker-compose ps
```

### API Endpoints

- `POST /auth/register` - регистрация нового пользователя
- `POST /auth/login` - аутентификация пользователя
- `GET /auth/validate` - валидация JWT токена
- `POST /auth/logout` - выход из системы
- `GET /health` - проверка состояния сервиса

### Остановка

```bash
docker-compose down
```

## Документация

Подробная документация доступна в следующих файлах:

- [/var/www/quark/docs/metrics_instrumentation.md](file:///var/www/quark/docs/metrics_instrumentation.md) - Инструментирование метрик, логов и трассировок
- [/var/www/quark/docs/monitoring.md](file:///var/www/quark/docs/monitoring.md) - Общая документация по системе мониторинга
- [/var/www/quark/docs/services/auth-service/README.md](file:///var/www/quark/docs/services/auth-service/README.md) - Документация Auth Service
- [/var/www/quark/infra/monitoring/README.md](file:///var/www/quark/infra/monitoring/README.md) - Документация инфраструктуры мониторинга

## Рекомендации по разработке

### Интеграция новых сервисов с системой мониторинга

1. Добавьте зависимости OpenTelemetry в ваш сервис
2. Настройте отправку метрик, логов и трассировок в OpenTelemetry Collector
3. Создайте дашборд Grafana для визуализации метрик вашего сервиса
4. Подробная информация доступна в [/var/www/quark/docs/metrics_instrumentation.md](file:///var/www/quark/docs/metrics_instrumentation.md)

### Следование стандартам проекта

1. Каждый сервис должен иметь полную документацию
2. Все сервисы должны интегрироваться с системой мониторинга
3. Используйте стандартные порты и конфигурации
4. Соблюдайте структуру проекта при добавлении новых компонентов

## Полезные команды

### Работа с Docker

- Просмотр запущенных контейнеров: `docker ps`
- Просмотр логов контейнера: `docker logs <container_name>`
- Выполнение команд в контейнере: `docker exec -it <container_name> <command>`

### Работа с Git

- Просмотр статуса: `git status`
- Добавление изменений: `git add .`
- Создание коммита: `git commit -m "сообщение коммита"`
- Отправка изменений: `git push`

## Дополнительная информация

Для получения дополнительной информации обратитесь к документации в каталоге [/var/www/quark/docs/](file:///var/www/quark/docs/) или свяжитесь с командой проекта.