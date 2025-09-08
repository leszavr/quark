# 🚀 Руководство по настройке мониторинга Grafana

## ✅ Выполненные исправления

### 1. **Исправлен конфликт портов**
- OpenTelemetry Collector теперь использует порт `4319:4317` (gRPC) и `4318:4318` (HTTP)
- Tempo использует только внутренний порт `4317` в Docker-сети

### 2. **Исправлена конфигурация сбора метрик**
- Prometheus теперь собирает метрики с `auth-service:9464/metrics`
- OpenTelemetry Collector настроен на сбор метрик из auth-service

### 3. **Исправлены дашборды**
- Обновлен `quark-overview.json` для использования правильных метрик
- Создан новый дашборд `auth-service-detailed.json` с детальными метриками

### 4. **Исправлен auth-service**
- Убрано дублирование метрик
- Исправлен OTLP endpoint на `http://otel-collector:4318`

### 5. **Исправлена DNS-резолюция в Docker**
- Добавлены явные имена контейнеров (`container_name`)
- Все сервисы находятся в одной сети `quark-network`

## 🧪 Инструкция по тестированию

### Шаг 1: Полная очистка и перезапуск
```bash
# Остановить все сервисы и удалить контейнеры
docker-compose -f infra/monitoring/docker-compose.monitoring.yml down --remove-orphans
docker-compose -f services/auth-service/docker-compose.yml down --remove-orphans

# Убедиться, что сеть существует
docker network create quark-network 2>/dev/null || true

# Запустить заново
./start-quark.sh
```

### Шаг 2: Проверка портов
```bash
# Проверить, что нет конфликтов портов
docker ps | grep -E "(otel|tempo)"

# Должно быть:
# otel-collector ... 0.0.0.0:4318->4318/tcp, 0.0.0.0:4319->4317/tcp
# tempo          ... 0.0.0.0:3200->3200/tcp
```

### Шаг 3: Проверка метрик auth-service
```bash
# Проверить, что auth-service экспортирует метрики
curl http://localhost:9464/metrics

# Должны быть метрики:
# http_requests_total{method="GET",route="/health",status="200"} 1
# http_request_duration_seconds_bucket{...} 0.001
```

### Шаг 4: Генерация тестовых данных
```bash
# Сделать несколько запросов для генерации метрик
curl http://localhost:3001/health
curl http://localhost:3001/health
curl http://localhost:3001/health

# Попробовать логин (будет ошибка, но метрики появятся)
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test&password=test"

# Генерировать тестовые ошибки
curl http://localhost:3001/test/error
curl http://localhost:3001/test/client-error
```

### Шаг 5: Проверка Grafana
1. Откройте http://localhost:3000
2. Войдите: `admin` / `quark`
3. Перейдите в **Dashboards → Manage**
4. Должны быть доступны:
   - `Quark System Overview`
   - `Auth Service - Detailed Metrics`

### Шаг 6: Проверка данных в дашбордах

#### В дашборде "Quark System Overview":
- **System Metrics Overview**: должны появиться данные о HTTP запросах
- **System Latency**: должна отображаться латентность p95/p99
- **Error Rates**: должны показываться ошибки 4xx/5xx
- **Recent System Logs**: должны отображаться логи auth-service

#### В дашборде "Auth Service - Detailed Metrics":
- **Login Requests Rate**: запросы к `/auth/login` и `/auth/validate`
- **Authentication Latency**: латентность аутентификации
- **Authentication Errors**: ошибки аутентификации
- **HTTP Status Codes Distribution**: распределение статус-кодов
- **All Endpoints Activity**: активность всех эндпоинтов

## 🔍 Диагностика проблем

### Если метрики не появляются:

1. **Проверить логи OpenTelemetry Collector:**
```bash
docker logs monitoring_otel-collector_1
# Искать: "MetricsExporter", "TracesExporter"
```

2. **Проверить логи auth-service:**
```bash
docker logs auth-service_auth-service_1
# Искать: "Metrics initialized successfully"
```

3. **Проверить Prometheus targets:**
- Откройте http://localhost:9090/targets
- Убедитесь, что `auth-service` target в состоянии UP

4. **Проверить Grafana Data Sources:**
- Перейдите в Configuration → Data Sources
- Проверьте подключение к Prometheus, Tempo, Loki

## 📊 Доступные метрики

| Метрика | Описание | Пример запроса |
|---------|----------|----------------|
| `http_requests_total` | Общее количество HTTP запросов | `sum(rate(http_requests_total[5m]))` |
| `http_request_duration_seconds` | Гистограмма времени выполнения | `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))` |
| `http_errors_total` | Количество HTTP ошибок | `sum(rate(http_errors_total[5m]))` |

## 🎯 Ожидаемый результат

После выполнения всех исправлений:
- ✅ Нет конфликтов портов
- ✅ Метрики собираются из auth-service
- ✅ Дашборды отображают реальные данные
- ✅ Логи, метрики и трейсы работают корректно
- ✅ Доступен детальный мониторинг auth-service

## 🚨 Если что-то не работает

1. Проверьте, что все контейнеры запущены: `docker ps`
2. Проверьте логи сервисов: `docker logs <container_name>`
3. Убедитесь, что сеть `quark-network` создана: `docker network ls`
4. Проверьте доступность портов: `netstat -tulpn | grep -E "(3000|9090|3001|9464)"`

Если проблемы остаются, предоставьте логи контейнеров для дальнейшей диагностики.