# Инструментирование метрик, логов и трассировок в сервисах Quark

## Обзор

В рамках проекта Quark была выполнена настройка системы мониторинга для Auth Service, включая сбор метрик, логов и трассировок с помощью OpenTelemetry, их экспорт в соответствующие системы хранения и визуализацию в Grafana.

## Компоненты системы мониторинга

1. **Сервисы** - собирают и отправляют данные через OpenTelemetry
2. **OpenTelemetry Collector** - получает данные и маршрутизирует их
3. **Prometheus** - хранит метрики
4. **Loki** - хранит логи
5. **Tempo** - хранит трассировки
6. **Grafana** - визуализирует данные

## Что было сделано

### 1. Настройка OpenTelemetry в Auth Service

В файле [otel_instrumentation.py](file:///var/www/quark/services/auth-service/otel_instrumentation.py) реализована полная настройка OpenTelemetry:

- Трассировка с использованием OTLP экспортера
- Сбор метрик с использованием OTLP экспортера
- Сбор логов с использованием OTLP экспортера
- Инструментация FastAPI и Redis

### 2. Сбор метрик

В [main.py](file:///var/www/quark/services/auth-service/main.py) реализован сбор пользовательских метрик:

- Счетчик HTTP запросов (`http_requests_total`)
- Гистограмма длительности запросов (`http_request_duration_seconds`)

### 3. Middleware для сбора метрик

Реализован middleware, который автоматически собирает метрики для всех HTTP запросов:

```python
@app.middleware("http")
async def metrics_middleware(request, call_next):
    import time
    start_time = time.time()
    
    try:
        # Выполняем запрос
        response = await call_next(request)
        
        # Засекаем время выполнения
        duration = time.time() - start_time
        
        # Записываем метрики
        if 'http_requests_counter' in globals():
            http_requests_counter.add(1, {
                "method": request.method,
                "endpoint": request.url.path,
                "status": str(response.status_code)
            })
        
        if 'http_request_duration' in globals():
            http_request_duration.record(duration, {
                "method": request.method,
                "endpoint": request.url.path,
                "status": str(response.status_code)
            })
        
        logger.info(f"Recorded metrics for {request.method} {request.url.path} with status {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Error in metrics middleware: {e}")
        # Все равно выполняем запрос даже если метрики не записались
        return await call_next(request)
```

### 4. Настройка OpenTelemetry Collector

В файле [otel-collector-config.yaml](file:///var/www/quark/infra/monitoring/otel-collector-config.yaml) настроены пайплайны для приема и экспорта данных:

- Прием метрик, логов и трассировок через OTLP
- Экспорт метрик в Prometheus
- Экспорт логов в Loki
- Экспорт трассировок в Tempo

### 5. Настройка Grafana

Созданы дашборды для визуализации данных:

- Общий дашборд системы Quark
- Специализированный дашборд для Auth Service

## Рекомендации по инструментированию других сервисов

### 1. Базовая настройка OpenTelemetry

Для интеграции OpenTelemetry в другие сервисы рекомендуется использовать следующий подход:

#### Установка зависимостей

В файл requirements.txt добавьте:

```
opentelemetry-api==1.21.0
opentelemetry-sdk==1.21.0
opentelemetry-exporter-otlp-proto-grpc==1.21.0
opentelemetry-instrumentation-fastapi==0.42b0
```

#### Настройка OpenTelemetry

Создайте файл otel_instrumentation.py:

```python
from opentelemetry import trace, metrics
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import Resource

def setup_otlp(app, service_name, endpoint):
    # Создаем ресурс с именем сервиса
    resource = Resource.create({"service.name": service_name})
    
    # Настройка трассировки
    trace.set_tracer_provider(TracerProvider(resource=resource))
    otlp_exporter = OTLPSpanExporter(endpoint=endpoint)
    trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(otlp_exporter))
    
    # Настройка метрик
    metric_exporter = OTLPMetricExporter(endpoint=endpoint)
    metric_reader = PeriodicExportingMetricReader(metric_exporter)
    metrics.set_meter_provider(MeterProvider(resource=resource, metric_readers=[metric_reader]))
    
    # Инструментация FastAPI
    FastAPIInstrumentor.instrument_app(app)
```

#### Интеграция в основное приложение

В основном файле приложения (например, main.py):

```python
from otel_instrumentation import setup_otlp
import os

app = FastAPI()

# Настройка OpenTelemetry
otlp_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://monitoring_otel-collector_1:4317")
setup_otlp(app, "название-вашего-сервиса", otlp_endpoint)
```

### 2. Сбор пользовательских метрик

#### Создание метрик

```python
from opentelemetry import metrics

# Получение метрик
meter = metrics.get_meter("название-вашего-сервиса")

# Создание счетчика
requests_counter = meter.create_counter(
    name="http_requests_total",
    description="Total number of HTTP requests",
    unit="1",
)

# Создание гистограммы
request_duration = meter.create_histogram(
    name="http_request_duration_seconds",
    description="HTTP request duration in seconds",
    unit="s",
)
```

#### Запись метрик

```python
# Запись счетчика
requests_counter.add(1, {
    "method": request.method,
    "endpoint": request.url.path,
    "status": str(response.status_code)
})

# Запись гистограммы
request_duration.record(duration, {
    "method": request.method,
    "endpoint": request.url.path,
    "status": str(response.status_code)
})
```

### 3. Middleware для автоматического сбора метрик

```python
@app.middleware("http")
async def metrics_middleware(request, call_next):
    import time
    start_time = time.time()
    
    try:
        response = await call_next(request)
        duration = time.time() - start_time
        
        # Записываем метрики
        if 'requests_counter' in globals():
            requests_counter.add(1, {
                "method": request.method,
                "endpoint": request.url.path,
                "status": str(response.status_code)
            })
        
        if 'request_duration' in globals():
            request_duration.record(duration, {
                "method": request.method,
                "endpoint": request.url.path,
                "status": str(response.status_code)
            })
        
        return response
    except Exception as e:
        # Все равно выполняем запрос даже если метрики не записались
        return await call_next(request)
```

### 4. Конфигурация Docker

В docker-compose.yml сервиса добавьте:

```yaml
environment:
  - OTEL_EXPORTER_OTLP_ENDPOINT=http://monitoring_otel-collector_1:4317
  - OTEL_SERVICE_NAME=название-вашего-сервиса
```

### 5. Настройка дашборда в Grafana

#### Создание дашборда

Создайте файл дашборда в формате JSON, например, `your-service-dashboard.json`:

```json
{
  "dashboard": {
    "id": null,
    "uid": "your-service-dashboard",
    "title": "Your Service Dashboard",
    "tags": ["your-service"],
    "timezone": "browser",
    "schemaVersion": 16,
    "version": 0,
    "refresh": "10s",
    "panels": [
      {
        "id": 1,
        "type": "graph",
        "title": "HTTP Requests Rate",
        "gridPos": {
          "x": 0,
          "y": 0,
          "w": 12,
          "h": 8
        },
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m])) by (method, status)",
            "legendFormat": "{{method}} {{status}}",
            "refId": "A"
          }
        ],
        "xaxis": {
          "mode": "time"
        },
        "yaxes": [
          {
            "format": "short",
            "label": "Requests/sec",
            "logBase": 1
          }
        ]
      }
    ]
  },
  "overwrite": true
}
```

#### Добавление дашборда в конфигурацию Grafana

Добавьте файл дашборда в директорию `/var/www/quark/infra/monitoring/grafana/dashboards/` и убедитесь, что он подключается через provisioning конфигурацию.

## Примеры правильной реализации

### Пример 1: Счетчик бизнес-метрик

```python
# Создание метрики
orders_counter = meter.create_counter(
    name="orders_processed_total",
    description="Total number of processed orders",
    unit="1",
)

# Использование в коде
@app.post("/orders")
async def create_order(order: Order):
    # Обработка заказа
    order_id = process_order(order)
    
    # Запись метрики
    orders_counter.add(1, {
        "status": "success",
        "order_type": order.type
    })
    
    return {"order_id": order_id}
```

### Пример 2: Гистограмма времени выполнения

```python
# Создание метрики
processing_time = meter.create_histogram(
    name="order_processing_duration_seconds",
    description="Order processing time",
    unit="s",
)

# Использование в коде
@app.post("/orders")
async def create_order(order: Order):
    start_time = time.time()
    
    try:
        # Обработка заказа
        order_id = process_order(order)
        
        duration = time.time() - start_time
        # Запись метрики
        processing_time.record(duration, {
            "order_type": order.type,
            "status": "success"
        })
        
        return {"order_id": order_id}
    except Exception as e:
        duration = time.time() - start_time
        processing_time.record(duration, {
            "order_type": order.type,
            "status": "error"
        })
        raise e
```

## Конфигурации для вывода информации в дашборд Grafana

### 1. Prometheus queries для дашбордов

#### Основные метрики:
- Скорость запросов: `sum(rate(http_requests_total[5m]))`
- 95-й перцентиль времени ответа: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))`
- Коды ошибок: `sum(rate(http_requests_total{status=~"5.."}[5m]))`

#### Бизнес-метрики:
- Количество обработанных заказов: `sum(rate(orders_processed_total[5m]))`
- Время обработки заказов: `histogram_quantile(0.95, sum(rate(order_processing_duration_seconds_bucket[5m])) by (le))`

### 2. Пример JSON дашборда

```json
{
  "title": "Service Overview",
  "panels": [
    {
      "title": "Request Rate",
      "type": "graph",
      "targets": [
        {
          "expr": "sum(rate(http_requests_total[5m]))",
          "legendFormat": "Requests/sec"
        }
      ]
    },
    {
      "title": "Error Rate",
      "type": "graph",
      "targets": [
        {
          "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m]))",
          "legendFormat": "5xx Errors"
        }
      ]
    },
    {
      "title": "Latency",
      "type": "graph",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
          "legendFormat": "95th Percentile"
        }
      ]
    }
  ]
}
```

## Рекомендации по метрикам

### 1. Обязательные метрики для каждого сервиса

1. **HTTP метрики**:
   - Счетчик запросов (`http_requests_total`)
   - Гистограмма времени ответа (`http_request_duration_seconds`)

2. **Системные метрики**:
   - Использование CPU и памяти
   - Количество Goroutines/Threads

3. **Бизнес-метрики**:
   - Количество обработанных бизнес-операций
   - Время выполнения ключевых операций

### 2. Правила именования метрик

1. Используйте snake_case
2. Называйте метрики в прошедшем времени или как состояние (например, `_total`, `_current`)
3. Используйте стандартные суффиксы:
   - `_total` - для счетчиков
   - `_duration_seconds` - для времени выполнения
   - `_current` - для текущих значений
   - `_bytes` - для размеров данных

### 3. Лейблы

1. Используйте лейблы для разделения данных, но не злоупотребляйте ими
2. Стандартные лейблы:
   - `method` - HTTP метод
   - `endpoint` - путь запроса
   - `status` - код ответа
   - `service` - имя сервиса

## Заключение

Следуя этим рекомендациям, вы сможете создать эффективную систему мониторинга для ваших сервисов. Важно помнить о необходимости:

1. Сбора как системных, так и бизнес-метрик
2. Правильной настройки OpenTelemetry
3. Создания понятных и информативных дашбордов
4. Регулярного анализа метрик для улучшения производительности сервисов