# Система мониторинга Quark

Система мониторинга на базе Grafana, Prometheus, Loki, Tempo и OpenTelemetry Collector.

## Компоненты

### Grafana
Grafana - платформа для визуализации и анализа метрик, логов и трассировок.

- Порт: 3000
- Доступ: http://localhost:3000
- Логин/пароль: admin/quark

### Prometheus
Prometheus - система мониторинга и оповещения, ориентированная на сбор и обработку метрик.

- Порт: 9090
- Доступ: http://localhost:9090

### Loki
Loki - система агрегации и поиска логов, разработанная Grafana Labs.

- Порт: 3100
- Доступ: http://localhost:3100

### Tempo
Tempo - решение для распределенной трассировки от Grafana Labs.

- Порт: 3200
- Доступ: http://localhost:3200

### OpenTelemetry Collector
OpenTelemetry Collector - компонент для получения, обработки и экспорта телеметрических данных.

- Порт OTLP/gRPC: 4317
- Порт OTLP/HTTP: 4318
- Метрики: 8888

## Архитектура

```text
                   +------------------+
                   |   Auth Service   |
                   +------------------+
                           |
                    OpenTelemetry
                           |
                   +------------------+
                   | OTel Collector   |
                   +------------------+
                    /       |        \
            Prometheus    Loki      Tempo
          (метрики:9090) (логи:3100) (трассировки:3200)
                           |
                      +---------+
                      | Grafana |
                      | (3000)  |
                      +---------+
```

## Источники данных в Grafana

1. **Prometheus** - метрики системы
2. **Loki** - логи приложений
3. **Tempo** - трассировки запросов

## Запуск

Для запуска системы мониторинга выполните:

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

## Конфигурация

### Prometheus
Конфигурация Prometheus находится в файле [prometheus.yml](prometheus.yml).

### Loki
Конфигурация Loki находится в файле [loki-config.yml](loki-config.yml).

### Tempo
Конфигурация Tempo находится в файле [tempo.yaml](tempo.yaml).

### OpenTelemetry Collector
Конфигурация OpenTelemetry Collector находится в файле [otel-collector-config.yaml](otel-collector-config.yaml).

### Grafana
Конфигурация Grafana:
- Основная конфигурация: [grafana-config/grafana.ini](grafana-config/grafana.ini)
- Источники данных: [grafana/provisioning/datasources/datasources.yaml](grafana/provisioning/datasources/datasources.yaml)
- Дашборды: [grafana/provisioning/dashboards](grafana/provisioning/dashboards)

## Интеграция с приложениями

Для интеграции приложений с системой мониторинга необходимо настроить OpenTelemetry SDK для отправки данных на OpenTelemetry Collector по адресу:

```
http://otel-collector:4317  # для gRPC
http://otel-collector:4318  # для HTTP
```

## Локализация

Grafana настроена на русский язык по умолчанию. Файлы локализации находятся в директории [temp-locales/ru-RU](temp-locales/ru-RU).

## Дашборды

В системе доступны следующие дашборды:
1. Обзор состояния системы
2. Метрики Auth Service
3. Логи приложений
4. Трассировки запросов

Для доступа к дашбордам перейдите в Grafana и выберите нужный дашборд из списка.