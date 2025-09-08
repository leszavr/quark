# Мониторинг в проекте Quark

## Обзор

Система мониторинга в проекте Quark построена на основе стека Grafana (Prometheus, Loki, Tempo) и OpenTelemetry. Она обеспечивает сбор, хранение и визуализацию метрик, логов и трассировок для всех сервисов проекта.

## Архитектура системы мониторинга

### Компоненты

1. **OpenTelemetry Collector** - центральный компонент, собирающий данные от всех сервисов
2. **Prometheus** - хранит метрики
3. **Loki** - хранит логи
4. **Tempo** - хранит трассировки
5. **Grafana** - визуализирует данные

### Диаграмма взаимодействия

```
+----------------+     OTLP/gRPC     +---------------------+
|   Services     | ----------------> | OpenTelemetry       |
| (Auth, etc.)   |                   | Collector           |
+----------------+                   +----------+----------+
                                                |
                         +----------------------+----------------------+
                         |                      |                      |
                   +-----v----+           +-----v----+           +-----v----+
                   |Prometheus|           |   Loki   |           |  Tempo   |
                   |(Metrics) |           | (Logs)   |           |(Traces)  |
                   +----------+           +----------+           +----------+
                         |                      |                      |
                         +----------------------+----------------------+
                                                |
                                          +-----v----+
                                          | Grafana  |
                                          |(Dashboard|
                                          |  & UI)   |
                                          +----------+
```

## Запуск

Для запуска системы мониторинга выполните:

```bash
cd infra/monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

## Компоненты

### Grafana

Grafana доступна по адресу: http://localhost:3000
Логин: admin
Пароль: quark

Grafana настроена на русский язык по умолчанию.

### Prometheus

Prometheus доступен по адресу: http://localhost:9090

Prometheus собирает метрики с различных сервисов, включая:
- Системные метрики
- Метрики приложений
- Метрики OpenTelemetry Collector

### Loki

Loki доступен по адресу: http://localhost:3100

Loki собирает логи от всех сервисов через OpenTelemetry Collector.

### Tempo

Tempo доступен по адресу: http://localhost:3200

Tempo собирает трассировки от всех сервисов через OpenTelemetry Collector.

### OpenTelemetry Collector

OpenTelemetry Collector доступен по следующим адресам:
- OTLP/gRPC: http://localhost:4317
- OTLP/HTTP: http://localhost:4318
- Метрики: http://localhost:8888

## Реализация мониторинга в Auth Service

Auth Service был первым сервисом, для которого была реализована полная система мониторинга.

### Сбор метрик

Реализован сбор следующих метрик:

1. **HTTP метрики**:
   - Счетчик запросов (`http_requests_total`)
   - Гистограмма времени ответа (`http_request_duration_seconds`)

2. **Middleware для автоматического сбора метрик**:
   - Автоматически собирает метрики для всех HTTP запросов
   - Записывает метод, путь и код ответа

### Сбор логов

Все логи сервиса автоматически отправляются в Loki через OpenTelemetry Collector.

### Сбор трассировок

Трассировки собираются для всех HTTP запросов и автоматически отправляются в Tempo.

## Конфигурация компонентов

### OpenTelemetry Collector

Файл конфигурации: [/var/www/quark/infra/monitoring/otel-collector-config.yaml](file:///var/www/quark/infra/monitoring/otel-collector-config.yaml)

Настроен для приема данных через OTLP/gRPC и OTLP/HTTP и маршрутизации их в соответствующие системы:
- Метрики -> Prometheus
- Логи -> Loki
- Трассировки -> Tempo

### Prometheus

Файл конфигурации: [/var/www/quark/infra/monitoring/prometheus.yml](file:///var/www/quark/infra/monitoring/prometheus.yml)

Настроен для получения метрик от OpenTelemetry Collector через remote write.

### Loki

Использует конфигурацию по умолчанию, прием логов через OpenTelemetry Collector.

### Tempo

Файл конфигурации: [/var/www/quark/infra/monitoring/tempo.yaml](file:///var/www/quark/infra/monitoring/tempo.yaml)

Настроен для приема трассировок от OpenTelemetry Collector.

### Grafana

Настроены источники данных:
- Prometheus для метрик
- Loki для логов
- Tempo для трассировок

Созданы дашборды:
- Общий дашборд системы Quark
- Специализированный дашборд для Auth Service

## Требования к метрикам, логам и трейсам

### Метрики

1. **Обязательные системные метрики** для каждого сервиса:
   - Счетчик HTTP запросов
   - Гистограмма времени ответа HTTP запросов
   - Использование системных ресурсов (CPU, память)

2. **Бизнес-метрики**:
   - Количество выполненных бизнес-операций
   - Время выполнения ключевых операций
   - Ошибки бизнес-логики

### Логи

1. **Структурированные логи**:
   - Все логи должны содержать контекст (trace_id, span_id при наличии)
   - Уровни логирования: DEBUG, INFO, WARN, ERROR
   - Структурированные поля для удобства поиска и фильтрации

### Трейсы

1. **Автоматическая трассировка**:
   - Все HTTP запросы должны быть автоматически трассированы
   - Трассировка должна охватывать все компоненты системы
   - Спаны должны содержать полезную информацию (HTTP метод, путь, код ответа и т.д.)

## Интеграция с OpenTelemetry

Все сервисы должны использовать OpenTelemetry для сбора метрик, логов и трассировок. Подробная информация о реализации интеграции доступна в документе [metrics_instrumentation.md](file:///var/www/quark/docs/metrics_instrumentation.md).

Endpoint для отправки данных: `http://monitoring_otel-collector_1:4317` (gRPC) или `http://monitoring_otel-collector_1:4318` (HTTP)

## Дашборды Grafana

### Общий дашборд системы (Quark System Overview)

Отображает общую картину состояния системы:
- Общее количество запросов
- Задержки системы
- Количество ошибок
- Последние логи

### Дашборд сервиса (Auth Service Dashboard)

Отображает детальную информацию по конкретному сервису:
- Детализация по HTTP запросам
- Подробные метрики задержек
- Логи сервиса
- Трассировки

## Инструкции по расширению и настройке

Подробные инструкции по интеграции мониторинга в новые сервисы доступны в документе [metrics_instrumentation.md](file:///var/www/quark/docs/metrics_instrumentation.md).