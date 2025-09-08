# SLO: Service Level Objectives

## Описание
Документ определяет **целевые метрики производительности и доступности** для ключевых сервисов Quark.  
Основан на модели **RED** (Rate, Error, Duration) и **SLI → SLO → Error Budget**.

---

## 1. Общие принципы

- **SLI** (Service Level Indicator) — метрика (например, latency)
- **SLO** (Service Level Objective) — цель (например, 95% запросов < 500 мс)
- **Error Budget** — допустимый "дефицит" (например, 0.1% ошибок в месяц)
- Все SLO мониторятся в **Grafana**
- При исчерпании бюджета — **заморозка новых фич, только исправления**

---

## 2. Ключевые сервисы и их SLO

### 🛡️ `auth-service`
| Метрика (SLI) | SLO | Измерение |
|---------------|-----|-----------|
| Доступность (Availability) | 99.95% | `up == 1` |
| Latency (p95) | < 300 мс | `http_request_duration_seconds{quantile="0.95"}` |
| Ошибки (Error Rate) | < 0.05% | `rate(http_requests_total{status=~"5.."}[5m])` |
| Rate | до 200 RPS | `rate(http_requests_total[1m])` |

> 💡 Обоснование: авторизация — критична для всей системы. **JWT_SECRET ротируется каждые 30 минут через Vault.**

---

### 📝 `blog-service`
| Метрика (SLI) | SLO | Измерение |
|---------------|-----|-----------|
| Доступность | 99.9% | `up == 1` |
| Latency (чтение, p95) | < 500 мс | `http_request_duration_seconds{handler="getPosts", quantile="0.95"}` |
| Latency (запись, p95) | < 1.5 с | `http_request_duration_seconds{handler="createPost", quantile="0.95"}` |
| Ошибки | < 0.1% | `rate(http_requests_total{status=~"5.."}[5m])` |
| Rate (чтение) | до 150 RPS | `rate(http_requests_total{method="GET"}[1m])` |
| Rate (запись) | до 30 RPS | `rate(http_requests_total{method="POST"}[1m])` |

> 💡 Обоснование: запись медленнее из-за обработки медиа и событий.

---

### 🤖 `ai-orchestrator`
| Метрика (SLI) | SLO | Измерение |
|---------------|-----|-----------|
| Доступность | 99.8% | `up == 1` |
| Latency (p95) | < 2.0 с | `ai_request_duration_seconds{quantile="0.95"}` |
| Успешность генерации | > 95% | `rate(ai_requests_total{status="success"}[5m])` |
| Accuracy (качество) | > 85% | [AI Monitoring Dashboard](./monitoring.md) |
| Rate | до 50 RPS | `rate(ai_requests_total[1m])` |

> 💡 Обоснование: ИИ может быть медленнее, но должен быть точным и стабильным.

---

### 💬 `messaging-service`
| Метрика (SLI) | SLO | Измерение |
|---------------|-----|-----------|
| Доступность | 99.9% | `up == 1` |
| Latency (отправка, p95) | < 400 мс | `http_request_duration_seconds{handler="sendMessage", quantile="0.95"}` |
| WebSocket: время подключения | < 1.5 с | `websocket_connect_duration_seconds` |
| Ошибки | < 0.1% | `rate(http_requests_total{status=~"5.."}[5m])` |
| Rate | до 100 RPS | `rate(http_requests_total[1m])` |

> 💡 Обоснование: мессенджер требует низкой задержки для UX.

---

## 3. Error Budget (бюджет ошибок)

| Сервис | Допустимые ошибки в месяц | Время простоя (в часах/месяц) |
|-------|----------------------------|-------------------------------|
| `auth-service` | 0.05% | ~0.36 часов (22 минуты) |
| `blog-service` | 0.1% | ~0.72 часов (43 минуты) |
| `ai-orchestrator` | 0.2% | ~1.44 часа |
| `messaging-service` | 0.1% | ~0.72 часов |

> ⚠️ При исчерпании бюджета:
> - Запрещаются новые фичи
> - Только исправления и оптимизации
> - Команда фокусируется на стабильности

---

## 4. Алертинг (Alerting Rules)

| Условие | Приоритет | Действие |
|--------|----------|---------|
| `latency > 1s for 2m` | Высокий | Telegram-уведомление |
| `error_rate > 1% for 5m` | Высокий | Алерт в Grafana + Slack |
| `availability < 99% for 5m` | Критический | Автоматический перезапуск (K8s) + уведомление |
| `error_budget_remaining < 20%` | Средний | Уведомление команды |
| `ai_accuracy < 80%` | Средний | Проверка данных, возможна откатка модели |

> 🔧 Правила будут добавлены в `monitoring/alert-rules.yml`.

---

## 5. Мониторинг в Grafana

- **Дашборды**:
  - `SLO Overview` — общий статус всех сервисов
  - `Error Budget Burn Rate` — скорость исчерпания бюджета
  - `Latency by Service` — сравнение p95
- **Источник данных**: Prometheus + OpenTelemetry

---

## 6. Пересмотр SLO
- Раз в **месяц** — анализ
- При **изменении нагрузки** — пересчёт
- При **добавлении нового сервиса** — создание SLO

---

## ✅ Статус
- [x] SLO для `auth-service`
- [x] SLO для `blog-service`
- [x] SLO для `ai-orchestrator`
- [x] SLO для `messaging-service`
- [x] Error Budget
- [x] Алертинг
- [x] Мониторинг

> ✅ **Готово. Можно использовать в CI/CD и для отчётов.**