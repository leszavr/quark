# ADR-001: Выбор NATS JetStream вместо Apache Kafka

## Состояние
Принято

## Контекст
Нужно выбрать event bus для событийно-ориентированной архитектуры.

## Решение
Выбран **NATS JetStream** вместо Kafka.

## Обоснование
- Легковесность: NATS потребляет меньше ресурсов
- Простота развёртывания: не требует ZooKeeper
- Поддержка durable streams, replay, retention
- Отличная производительность при малом и среднем масштабе
- Подходит для эксперимента и MVP

## Альтернативы
- Kafka: мощнее, но сложнее, избыточен для MVP
- RabbitMQ: нет встроенной персистентности событий

## Последствия
- При масштабировании > 1M сообщений/сек может потребоваться переход на Kafka

## Усиление NATS JetStream

Чтобы избежать потери сообщений:

### Durable Consumers
Каждый потребитель (например, `search-service`) регистрируется как **durable**:
```bash
nats consumer add BLOG_STREAM SEARCH_SERVICE --ack --deliver all --replay instant
```

### Dead Letter Queue (DLQ)
Настроить stream с `max_deliver=5`, после чего сообщение попадает в DLQ:
```yaml
stream:
  name: BLOG_STREAM
  subjects: ["post.*"]
  max_deliver: 5
  dead_letter_queue: "dlq.blog"
```

### Ретри и экспоненциальный backoff
Потребитель должен использовать:
- Ретри с экспоненциальным backoff
- Подтверждение обработки (`ack`)
