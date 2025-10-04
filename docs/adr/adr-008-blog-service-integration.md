# ADR-008: Интеграция Blog Service с Enterprise Architecture

## Состояние
Принято

## Дата
3 октября 2025 г.

## Контекст
Blog Service в настоящее время имеет критическое архитектурное нарушение - прямые вызовы к auth-service, что противоречит принципам МКС архитектуры. Согласно GOLDEN-RULES-DEVELOPMENT.md и Universal Docking Interface, все модули должны интегрироваться через Plugin Hub как центральный МКС Command Module.

### Проблемы текущей реализации:
1. **Архитектурное нарушение**: Прямые HTTP вызовы к auth-service
2. **Отсутствие UDI**: Модуль не имеет стандартного дocking interface
3. **Нет регистрации**: Модуль не регистрируется в Plugin Hub
4. **Отсутствие производственной готовности**: Нет системы регистрации/авторизации пользователей

## Решение
Реализовать полную интеграцию Blog Service с Enterprise архитектурой МКС следующими этапами:

### 1. Исправление архитектуры аутентификации
- **Удалить**: Прямые вызовы к auth-service
- **Реализовать**: Архитектуру JWT → Blog Service → Plugin Hub → auth-service/validate
- **Использовать**: Enterprise JWT Middleware из Plugin Hub

### 2. Реализация Universal Docking Interface (UDI)
Создать `module-manifest.yaml` со следующими параметрами:
```yaml
id: blog-service
name: "Blog Service"
version: "1.0.0"
technology: Node.js
framework: Express
capabilities:
  - blog-management
  - post-creation
  - user-posts
  - content-publishing
security:
  requiresAuth: true
  permissions:
    - blog.read
    - blog.write
    - blog.publish
endpoints:
  health: /health
  status: /status
  manifest: /manifest
```

### 3. Производственная система регистрации/авторизации
- **POST /auth/register**: Регистрация пользователей через Plugin Hub
- **POST /auth/login**: Авторизация через Plugin Hub → auth-service
- **JWT validation**: Через Enterprise JWT Middleware
- **Role-based access**: Интеграция с RBAC системой

### 4. Автоматическая регистрация в Plugin Hub
- Реализация автоматической регистрации при старте модуля
- Heartbeat протокол для мониторинга состояния
- Graceful shutdown с уведомлением Plugin Hub

## Архитектурный поток

### Текущий (НЕПРАВИЛЬНЫЙ):
```
User → Blog Service → auth-service (ПРЯМОЙ ВЫЗОВ) ❌
```

### Целевой (ПРАВИЛЬНЫЙ):
```
User → Blog Service → Plugin Hub → auth-service/validate ✅
               ↓
    Enterprise JWT Middleware
           (mTLS, Circuit Breaker, 
            Rate Limiting, Caching)
```

## Обоснование

### Архитектурные принципы МКС:
1. **Модульность**: Каждый модуль автономен и стыкуется через стандартный интерфейс
2. **Центральное управление**: Plugin Hub как Command Module контролирует всю коммуникацию
3. **Безопасность**: Enterprise JWT Middleware обеспечивает production-ready безопасность
4. **Отказоустойчивость**: Circuit breaker и rate limiting защищают от каскадных отказов

### Преимущества решения:
- ✅ Соответствие архитектуре МКС
- ✅ Централизованная аутентификация через Plugin Hub
- ✅ Enterprise-grade безопасность (mTLS, rate limiting)
- ✅ Автоматическое обнаружение и регистрация модулей
- ✅ Мониторинг и метрики через Plugin Hub
- ✅ Возможность горизонтального масштабирования

## Последствия

### Положительные:
- Архитектурная целостность восстановлена
- Безопасность на production уровне
- Возможность автоматического развертывания и масштабирования
- Стандартизированный подход к интеграции модулей
- Готовность к интеграции с другими модулями МКС

### Требуемые изменения:
1. **Код Blog Service**: Удаление прямых вызовов auth-service
2. **UDI Implementation**: Создание module-manifest.yaml и стандартных endpoints
3. **Регистрация в Plugin Hub**: Автоматическая регистрация при старте
4. **Аутентификация**: Интеграция с Enterprise JWT Middleware
5. **Производственные функции**: Регистрация и авторизация пользователей

### Технические требования:
- Node.js 20 LTS (обновлено согласно GOLDEN-RULES)
- npm 11.6.1 (обновлено согласно GOLDEN-RULES)
- Интеграция с Plugin Hub API
- Использование Enterprise JWT Middleware
- Соблюдение UDI спецификации

## Связанные ADR
- ADR-003: Модульность по принципу "МКС"
- ADR-005: Единый формат аутентификации
- Связано с реализацией Enterprise JWT Middleware в Plugin Hub

## Примечания
Данная интеграция является критически важной для соблюдения архитектурных принципов МКС и обеспечения production-ready состояния Blog Service.