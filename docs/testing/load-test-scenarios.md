# Load Test Scenarios

## 1. Цель
Проверить производительность системы под нагрузкой, приближенной к продакшену, и убедиться, что SLO выполняются:
- Latency < 500 мс (p95)
- Error Rate < 0.1%
- Доступность > 99.9%

## 2. Инструмент
- **k6** — для нагрузочного тестирования
- **Grafana + Prometheus** — для мониторинга метрик в реальном времени
- **Docker** — для запуска тестов в изолированной среде

## 3. Окружение
- **Staging-кластер**, идентичный production (Kubernetes)
- **База данных**: PostgreSQL + Redis + MinIO
- **Event Bus**: NATS JetStream
- **Масштабирование**: HPA включён

---

## 4. Сценарии

### 4.1. Чтение постов

| Атрибут | Значение |
|--------|--------|
| **Цель** | Проверить latency и ошибки при массовом чтении |
| **Пользователи (VU)** | 1000 |
| **Длительность** | 10 минут |
| **Нагрузка** | 70 RPS |
| **Точка входа** | `GET /api/v1/posts?limit=20` |
| **SLO** | p95 < 500 мс, error rate < 0.1% |

#### k6-скрипт (`load-tests/read-posts.js`)
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1000,
  duration: '10m',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.001'],
  },
};

export default function () {
  const res = http.get('https://staging.quark.com/api/v1/posts?limit=20');
  check(res, {
    'status was 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

---

### 4.2. Публикация постов

| Атрибут | Значение |
|--------|--------|
| **Цель** | Проверить обработку медиа и событий при массовой публикации |
| **Пользователи (VU)** | 500 |
| **Длительность** | 15 минут |
| **Нагрузка** | 20 RPS |
| **Точка входа** | `POST /api/v1/posts` (с изображением 1MB) |
| **SLO** | p95 < 1.5s, error rate < 0.2% |

#### k6-скрипт (`load-tests/publish-posts.js`)
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// Имитация изображения (base64)
const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

export const options = {
  vus: 500,
  duration: '15m',
  thresholds: {
    http_req_duration: ['p(95)<1500'],
    http_req_failed: ['rate<0.002'],
  },
};

export default function () {
  const payload = JSON.stringify({
    title: `Post by VU ${__VU}`,
    content: 'Тестовый пост для нагрузочного теста',
    status: 'published',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${randomToken()}`,
    },
  };

  const res = http.post('https://staging.quark.com/api/v1/posts', payload, params);
  check(res, {
    'status was 201': (r) => r.status === 201,
    'response time OK': (r) => r.timings.duration < 1500,
  });

  // Имитация загрузки медиа
  const mediaRes = http.post('https://staging.quark.com/api/v1/media', image, {
    ...params,
    headers: { ...params.headers, 'Content-Type': 'text/plain' },
  });

  sleep(2);
}

function randomToken() {
  return `mock-jwt-token-${__VU}`;
}
```

---

### 4.3. Отправка сообщений (WebSocket)

| Атрибут | Значение |
|--------|--------|
| **Цель** | Проверить стабильность WebSocket и обработку событий |
| **Пользователи (VU)** | 300 |
| **Длительность** | 10 минут |
| **Нагрузка** | 30 RPS (сообщений) |
| **Точка входа** | `WS /ws?token=...` |
| **SLO** | p95 < 400 мс, соединения не рвутся, error rate < 0.1% |

#### k6-скрипт (`load-tests/websocket-messaging.js`)
```javascript
import { check } from 'k6';
import ws from 'k6/ws';

export const options = {
  vus: 300,
  duration: '10m',
  thresholds: {
    checks: ['rate>0.99'],
    ws_session_duration: ['p(95)<400'],
  },
};

export default function () {
  const url = `ws://staging.quark.com/ws?token=${randomToken()}`;
  const res = ws.connect(url, {}, function (socket) {
    socket.on('open', function open() {
      console.log(`VU ${__VU} connected`);
      socket.setInterval(function timeout() {
        socket.send(JSON.stringify({
          type: 'message',
          content: `Hello from VU ${__VU}`,
          receiver_id: `user-${__VU + 1}`
        }));
      }, 5000);
    });

    socket.on('error', function (e) {
      console.error(`WebSocket error: ${e.error}`);
    });

    socket.on('close', function () {
      console.log('Disconnected');
    });
  });

  check(res, { 'status is 101': (r) => r && r.status === 101 });
}
```

---

### 4.4. Работа ИИ-агента (генерация контента)

| Атрибут | Значение |
|--------|--------|
| **Цель** | Проверить время генерации и стабильность `ai-orchestrator` |
| **Пользователи (VU)** | 100 |
| **Длительность** | 5 минут |
| **Нагрузка** | 10 RPS |
| **Точка входа** | `POST /ai/generate` |
| **SLO** | p95 < 2.0s, error rate < 0.5% (из-за LLM) |

#### k6-скрипт (`load-tests/ai-generation.js`)
```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100,
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.005'],
  },
};

export default function () {
  const payload = JSON.stringify({
    prompt: 'Напиши короткий пост о пользе медитации',
    model: 'phi:mini',
    max_tokens: 200
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${randomToken()}`,
    },
  };

  const res = http.post('https://staging.quark.com/ai/generate', payload, params);
  check(res, {
    'status was 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 2000,
  });
}
```

---

## 5. Процесс запуска

1. Запустить staging-окружение
2. Запустить k6-тест:
   ```bash
   docker run -i loadimpact/k6 run - < load-tests/read-posts.js
   ```
3. Мониторить в Grafana:
   - CPU, RAM, очередь NATS
   - Latency, errors
4. Зафиксировать результаты
5. Если SLO не выполняется — анализировать:
   - Базу данных
   - NATS
   - Кэширование
6. Внести оптимизации

---

## 6. Критерии успеха
- ? Все сценарии завершены без критических ошибок
- ? SLO выполнены
- ? Нет утечек памяти, падений сервисов
- ? Генерация отчёта в Grafana

---

## ? Статус
- [x] Сценарии определены
- [x] k6-скрипты созданы
- [x] SLO привязаны
- [x] Готово к запуску в CI/CD

> ? **Документ завершён и готов к использованию.**