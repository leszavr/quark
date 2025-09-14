# Quark МКС SDK для Node.js/TypeScript

## Обзор

Quark МКС SDK предоставляет простой способ интеграции Node.js/TypeScript приложений в экосистему Quark с использованием Universal Docking Interface (UDI).

## Установка

```bash
npm install @quark/mks-sdk
```

## Быстрый старт

```typescript
import { QuarkModule } from '@quark/mks-sdk';

// Создание модуля с автоматической регистрацией
const myModule = new QuarkModule({
  id: 'my-awesome-service',
  name: 'My Awesome Service',
  version: '1.0.0',
  technology: 'Node.js',
  language: 'TypeScript',
  framework: 'Express',
  description: 'Мой потрясающий микросервис',
  author: 'Developer Name',
  capabilities: ['data-processing', 'api'],
  provides: ['user-data', 'analytics'],
  dependencies: ['auth-service'],
  tags: ['microservice', 'api', 'data']
});

// Автоматическая регистрация в Plugin Hub
await myModule.dock(); // 🚀 МКС docking sequence initiated!

// Модуль готов к работе!
console.log('✅ Module successfully docked to МКС');
```

## Полная конфигурация

```typescript
import { QuarkModule, ModuleConfig } from '@quark/mks-sdk';

const config: ModuleConfig = {
  // Основные параметры
  id: 'advanced-service',
  name: 'Advanced Service',
  version: '2.1.0',
  description: 'Продвинутый сервис с полной конфигурацией',
  author: 'Advanced Developer',
  
  // Технологический стек
  technology: 'Node.js',
  language: 'TypeScript',
  framework: 'NestJS',
  
  // Сетевая конфигурация
  host: 'localhost',
  port: 3001,
  protocol: 'http',
  baseUrl: '/api/v1',
  
  // Эндпоинты (автоматически настраиваются, если не указаны)
  endpoints: {
    health: '/health',
    status: '/status',
    metrics: '/metrics',
    docs: '/api-docs'
  },
  
  // Функциональные возможности
  capabilities: ['authentication', 'authorization', 'user-management'],
  dependencies: ['database-service', 'email-service'],
  provides: ['user-auth', 'session-management'],
  tags: ['auth', 'security', 'users'],
  
  // Жизненный цикл
  lifecycle: {
    startup: 'auto',
    restart: 'on-failure',
    healthCheckInterval: 30, // секунды
    timeout: 10000 // миллисекунды
  },
  
  // Безопасность
  security: {
    requiresAuth: true,
    permissions: ['read:users', 'write:auth'],
    rateLimits: {
      requests: 1000,
      window: 3600 // секунды
    }
  },
  
  // Конфигурация Plugin Hub
  pluginHub: {
    url: 'http://localhost:3000',
    retryAttempts: 3,
    retryDelay: 5000
  }
};

const module = new QuarkModule(config);
await module.dock();
```

## API Reference

### QuarkModule

#### Конструктор

```typescript
constructor(config: ModuleConfig)
```

#### Методы

##### `dock(): Promise<void>`
Регистрирует модуль в Plugin Hub и инициализирует все необходимые службы.

```typescript
await module.dock();
```

##### `undock(): Promise<void>`
Отключает модуль от Plugin Hub с корректным завершением работы.

```typescript
await module.undock();
```

##### `sendHeartbeat(): Promise<void>`
Отправляет heartbeat в Plugin Hub.

```typescript
await module.sendHeartbeat();
```

##### `discoverModules(): Promise<Module[]>`
Получает список всех зарегистрированных модулей.

```typescript
const modules = await module.discoverModules();
console.log(`Found ${modules.length} modules in МКС`);
```

##### `getModule(id: string): Promise<Module | null>`
Получает информацию о конкретном модуле.

```typescript
const authModule = await module.getModule('auth-service');
if (authModule) {
  console.log(`Auth service: ${authModule.endpoints.base}`);
}
```

##### `publishEvent(event: QuarkEvent): Promise<void>`
Публикует событие в систему.

```typescript
await module.publishEvent({
  type: 'user.registered',
  data: { userId: '123', email: 'user@example.com' }
});
```

##### `subscribeToEvents(pattern: string, handler: EventHandler): void`
Подписывается на события по паттерну.

```typescript
module.subscribeToEvents('user.*', (event) => {
  console.log('User event received:', event);
});
```

## Интеграция с Express

```typescript
import express from 'express';
import { QuarkModule, withQuarkMiddleware } from '@quark/mks-sdk';

const app = express();

// Создание модуля
const quarkModule = new QuarkModule({
  id: 'express-service',
  name: 'Express Service',
  version: '1.0.0',
  technology: 'Node.js',
  language: 'JavaScript',
  framework: 'Express',
  port: 3002,
  description: 'Express.js микросервис',
  author: 'Express Developer'
});

// Добавление Quark middleware (автоматически добавляет health, status endpoints)
app.use(withQuarkMiddleware(quarkModule));

// Ваши маршруты
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from МКС module!' });
});

// Регистрация в МКС
quarkModule.dock().then(() => {
  app.listen(3002, () => {
    console.log('✅ Express service docked to МКС on port 3002');
  });
});
```

## Интеграция с NestJS

```typescript
import { Injectable, Module } from '@nestjs/common';
import { QuarkModule, QuarkService } from '@quark/mks-sdk/nestjs';

@Injectable()
export class AppService {
  constructor(private quark: QuarkService) {}
  
  async getHello(): Promise<string> {
    // Получение других модулей через МКС
    const modules = await this.quark.discoverModules();
    return `Hello from МКС! Connected to ${modules.length} modules`;
  }
  
  async publishUserEvent(userId: string): Promise<void> {
    await this.quark.publishEvent({
      type: 'user.action',
      data: { userId, action: 'login' }
    });
  }
}

@Module({
  imports: [
    QuarkModule.forRoot({
      id: 'nestjs-service',
      name: 'NestJS Service',
      version: '1.0.0',
      technology: 'Node.js',
      language: 'TypeScript',
      framework: 'NestJS',
      description: 'NestJS микросервис для МКС',
      author: 'NestJS Developer'
    })
  ],
  providers: [AppService],
})
export class AppModule {}
```

## Обработка событий

```typescript
import { QuarkModule, EventHandler } from '@quark/mks-sdk';

const module = new QuarkModule({
  id: 'event-processor',
  name: 'Event Processor',
  // ... другие настройки
});

// Обработчик всех событий
const globalHandler: EventHandler = (event) => {
  console.log(`Event received: ${event.type}`, event.data);
};

// Обработчик событий пользователей
const userHandler: EventHandler = (event) => {
  switch (event.type) {
    case 'user.registered':
      console.log('New user registered:', event.data.email);
      break;
    case 'user.deleted':
      console.log('User deleted:', event.data.userId);
      break;
  }
};

// Подписка на события
module.subscribeToEvents('*', globalHandler);
module.subscribeToEvents('user.*', userHandler);

await module.dock();
```

## Healthcheck и метрики

Модуль автоматически предоставляет следующие эндпоинты:

- `GET /health` - Статус здоровья модуля
- `GET /status` - Детальная информация о статусе
- `GET /metrics` - Метрики производительности (если настроены)

```typescript
// Кастомные health checks
module.addHealthCheck('database', async () => {
  try {
    await database.ping();
    return { status: 'pass', message: 'Database connected' };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
});

// Кастомные метрики
module.addMetric('active_users', () => activeUserCount);
module.addMetric('requests_per_minute', () => requestsPerMinute);
```

## Конфигурация окружения

```bash
# .env
QUARK_HUB_URL=http://localhost:3000
QUARK_MODULE_ID=my-service
QUARK_MODULE_NAME=My Service
QUARK_MODULE_VERSION=1.0.0
QUARK_MODULE_PORT=3001
QUARK_MODULE_HOST=localhost
QUARK_HEALTH_CHECK_INTERVAL=30
QUARK_AUTO_REGISTER=true
```

```typescript
// Автоматическая конфигурация из environment
const module = QuarkModule.fromEnv();
await module.dock();
```

## Примеры использования

### Простой HTTP API модуль

```typescript
import express from 'express';
import { QuarkModule } from '@quark/mks-sdk';

const app = express();
const quark = new QuarkModule({
  id: 'simple-api',
  name: 'Simple API',
  version: '1.0.0',
  technology: 'Node.js',
  language: 'JavaScript',
  framework: 'Express'
});

app.get('/api/data', (req, res) => {
  res.json({ data: 'Hello from МКС!' });
});

// Интеграция с МКС
app.use('/health', quark.healthEndpoint());
app.use('/status', quark.statusEndpoint());

quark.dock().then(() => {
  app.listen(3001, () => {
    console.log('🚀 Simple API module docked to МКС');
  });
});
```

### Модуль обработки данных

```typescript
import { QuarkModule } from '@quark/mks-sdk';

const processor = new QuarkModule({
  id: 'data-processor',
  name: 'Data Processor',
  version: '1.0.0',
  technology: 'Node.js',
  language: 'TypeScript',
  capabilities: ['data-processing', 'analytics'],
  provides: ['processed-data', 'reports']
});

// Обработка входящих данных
processor.subscribeToEvents('data.incoming', async (event) => {
  const processedData = await processData(event.data);
  
  // Публикация результата
  await processor.publishEvent({
    type: 'data.processed',
    data: processedData
  });
});

await processor.dock();
console.log('📊 Data processor ready for МКС operations');
```

## Troubleshooting

### Модуль не может подключиться к Plugin Hub

```typescript
// Проверка соединения
try {
  await module.dock();
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    console.error('Plugin Hub недоступен. Проверьте URL и статус Hub.');
  } else if (error.code === 'QE002') {
    console.error('Неверный манифест модуля:', error.message);
  }
}
```

### Проблемы с health checks

```typescript
// Отладка health checks
module.onHealthCheckFailed((check, error) => {
  console.error(`Health check '${check}' failed:`, error);
});
```

## Best Practices

1. **Уникальные ID**: Используйте уникальные идентификаторы модулей
2. **Версионирование**: Следуйте семантическому версионированию
3. **Graceful shutdown**: Всегда вызывайте `undock()` при завершении
4. **Error handling**: Обрабатывайте ошибки подключения к Plugin Hub
5. **Health checks**: Добавляйте кастомные health checks для зависимостей
6. **События**: Используйте события для слабосвязанной коммуникации

## Changelog

### v1.0.0
- Начальная реализация Universal Docking Interface
- Поддержка автоматической регистрации в Plugin Hub
- Express и NestJS интеграции
- Система событий и обнаружения сервисов
- Health checks и метрики
