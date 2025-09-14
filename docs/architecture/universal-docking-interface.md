# Universal Docking Interface (UDI)
## Унифицированный механизм интеграции модулей МКС

### Концепция
Основываясь на принципах Международной Космической Станции, каждый модуль должен иметь стандартизированный стыковочный узел, позволяющий подключение к центральной станции (Plugin Hub) независимо от технологии реализации.

### 1. Стандартный Интерфейс Регистрации

#### 1.1 Спецификация модуля
Каждый модуль МКС должен предоставлять следующую информацию:

```typescript
interface ModuleManifest {
  // Идентификация
  id: string;                    // Уникальный идентификатор модуля
  name: string;                  // Человеко-читаемое имя
  version: string;               // Семантическая версия (semver)
  
  // Технические данные
  technology: string;            // Node.js, Python, Go, .NET, Java, etc.
  language: string;              // JavaScript, TypeScript, Python, Go, C#, etc.
  framework?: string;            // Express, NestJS, FastAPI, Gin, ASP.NET, etc.
  
  // Сетевая конфигурация
  host: string;                  // IP адрес или hostname
  port: number;                  // Порт сервиса
  protocol: 'http' | 'https' | 'grpc' | 'tcp' | 'custom';
  baseUrl?: string;              // Базовый путь для HTTP API
  
  // Эндпоинты
  endpoints: {
    health: string;              // Health check endpoint
    status: string;              // Статус модуля
    metrics?: string;            // Метрики (опционально)
    docs?: string;               // API документация
  };
  
  // Функциональность
  capabilities: string[];        // Список возможностей модуля
  dependencies: string[];        // Зависимости от других модулей
  provides: string[];            // Что предоставляет другим модулям
  
  // Метаданные
  description: string;           // Описание функционала
  author: string;                // Автор модуля
  tags: string[];                // Теги для категоризации
  
  // Конфигурация жизненного цикла
  lifecycle: {
    startup: 'auto' | 'manual';    // Автозапуск или ручной
    restart: 'always' | 'on-failure' | 'never';
    healthCheckInterval: number;    // Интервал проверки здоровья (сек)
    timeout: number;               // Таймаут для операций (сек)
  };
  
  // Безопасность
  security?: {
    requiresAuth: boolean;      // Требует ли аутентификации
    permissions: string[];      // Необходимые разрешения
    rateLimits?: {              // Ограничения скорости
      requests: number;
      window: number;           // в секундах
    };
  };
}
```

#### 1.2 Стандартные HTTP эндпоинты модуля

Каждый модуль МКС обязан предоставлять:

```
GET  /health          - Health check (200 OK = alive)
GET  /status          - Детальный статус модуля
GET  /manifest        - Манифест модуля (ModuleManifest)
POST /shutdown        - Graceful shutdown (опционально)
```

#### 1.3 Формат Health Check

```typescript
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;            // ISO 8601
  uptime: number;              // Время работы в секундах
  checks: {
    [checkName: string]: {
      status: 'pass' | 'fail' | 'warn';
      message?: string;
      duration?: number;        // Время выполнения проверки (мс)
    };
  };
}
```

### 2. Протокол Регистрации в Plugin Hub

#### 2.1 Автоматическая регистрация

```http
POST /modules/register
Content-Type: application/json

{
  "manifest": { /* ModuleManifest */ },
  "timestamp": "2024-12-31T10:00:00Z",
  "registrationToken": "optional-auth-token"
}
```

#### 2.2 Ответ Plugin Hub

```typescript
interface RegistrationResponse {
  success: boolean;
  moduleId: string;             // Присвоенный ID
  message: string;
  hubEndpoints: {
    events: string;             // NATS/WebSocket для событий
    discovery: string;          // Обнаружение других модулей
    metrics: string;            // Отправка метрик
  };
  nextHeartbeat: string;        // Время следующего heartbeat
  configuration?: any;          // Конфигурация от хаба
}
```

### 3. Жизненный Цикл Модуля

#### 3.1 Фазы подключения

1. **Предварительная проверка** - проверка доступности Plugin Hub
2. **Регистрация** - отправка манифеста и получение конфигурации
3. **Инициализация** - настройка соединений с другими модулями
4. **Активация** - модуль готов к работе
5. **Мониторинг** - отправка heartbeat и метрик

#### 3.2 Heartbeat протокол

```http
POST /modules/{moduleId}/heartbeat
Content-Type: application/json

{
  "timestamp": "2024-12-31T10:00:00Z",
  "status": "healthy",
  "metrics": {
    "cpu": 15.5,
    "memory": 128.5,
    "requests": 1500,
    "errors": 2
  }
}
```

### 4. Система Событий

#### 4.1 Стандартные события МКС

```typescript
// События жизненного цикла модуля
type ModuleLifecycleEvent = 
  | 'module.registered'
  | 'module.starting' 
  | 'module.ready'
  | 'module.stopping'
  | 'module.stopped'
  | 'module.error';

// Системные события
type SystemEvent =
  | 'hub.ready'
  | 'hub.shutdown'
  | 'discovery.updated'
  | 'config.changed';
```

#### 4.2 Формат события

```typescript
interface QuarkEvent {
  id: string;                   // UUID события
  type: string;                 // Тип события
  source: string;               // ID модуля-источника
  timestamp: string;            // ISO 8601
  data: any;                    // Данные события
  correlationId?: string;       // Для связанных событий
  version: string;              // Версия схемы события
}
```

### 5. Обнаружение Сервисов

#### 5.1 Запрос доступных модулей

```http
GET /modules/discovery
Accept: application/json

Response:
{
  "modules": [
    {
      "id": "auth-service",
      "name": "Authentication Service", 
      "status": "healthy",
      "endpoints": {
        "base": "http://localhost:3003",
        "health": "http://localhost:3003/health"
      },
      "capabilities": ["authentication", "user-management"],
      "lastSeen": "2024-12-31T10:00:00Z"
    }
  ],
  "total": 1,
  "timestamp": "2024-12-31T10:00:00Z"
}
```

### 6. Безопасность и Аутентификация

#### 6.1 Аутентификация модулей

```typescript
interface ModuleAuth {
  type: 'none' | 'token' | 'certificate' | 'mutual-tls';
  token?: string;               // JWT или API ключ
  certificate?: {
    cert: string;               // Base64 сертификат
    key: string;                // Base64 приватный ключ
  };
}
```

#### 6.2 Межмодульная аутентификация

Для вызовов между модулями используется система доверенных токенов:

```http
GET /api/some-endpoint
Authorization: Bearer <hub-issued-module-token>
X-Module-ID: calling-module-id
```

### 7. Мониторинг и Метрики

#### 7.1 Стандартные метрики

```typescript
interface ModuleMetrics {
  timestamp: string;
  system: {
    cpu: number;                // Процент использования CPU
    memory: number;             // МБ используемой памяти  
    disk?: number;              // МБ использованного диска
    uptime: number;             // Секунды работы
  };
  application: {
    requests: number;           // Общее количество запросов
    errors: number;             // Количество ошибок
    responseTime: number;       // Среднее время ответа (мс)
    activeConnections: number;  // Активные соединения
  };
  custom?: { [key: string]: any };  // Пользовательские метрики
}
```

### 8. Обработка Ошибок

#### 8.1 Коды ошибок МКС

```typescript
enum QuarkErrorCode {
  // Регистрация
  REGISTRATION_FAILED = 'QE001',
  INVALID_MANIFEST = 'QE002',
  MODULE_ALREADY_EXISTS = 'QE003',
  
  // Жизненный цикл
  HEARTBEAT_TIMEOUT = 'QE101',
  MODULE_UNHEALTHY = 'QE102',
  STARTUP_FAILED = 'QE103',
  
  // Коммуникация
  SERVICE_UNAVAILABLE = 'QE201',
  AUTHENTICATION_FAILED = 'QE202',
  PERMISSION_DENIED = 'QE203',
  
  // Система
  HUB_OVERLOADED = 'QE301',
  CONFIGURATION_ERROR = 'QE302'
}
```

### 9. Версионирование и Совместимость

#### 9.1 Семантическое версионирование API

- API версия в заголовке: `X-API-Version: 1.0.0`
- Обратная совместимость для минорных версий
- Deprecation warnings для устаревших эндпоинтов

#### 9.2 Миграция модулей

```typescript
interface MigrationInfo {
  from: string;                 // Версия источник
  to: string;                   // Целевая версия
  breaking: boolean;            // Есть ли breaking changes
  steps: string[];              // Шаги миграции
  rollback: string[];           // Шаги отката
}
```

---

## Принципы МКС архитектуры

1. **Автономность** - каждый модуль независим и самодостаточен
2. **Стандартизация** - единый интерфейс для всех технологий
3. **Наблюдаемость** - полная видимость состояния системы
4. **Отказоустойчивость** - graceful degradation при отказах
5. **Масштабируемость** - горизонтальное масштабирование модулей
6. **Безопасность** - защищенная межмодульная коммуникация

Этот стандарт обеспечивает истинную технологическую независимость и позволяет любому разработчику создать модуль на любом языке программирования, который seamlessly интегрируется в экосистему Quark.
