# Auth UI Integration - Спецификация

**Ветка**: `003-auth-ui-integration` | **Дата**: 2025-11-03  
**Цель**: Интеграция форм регистрации/авторизации на Landing и Admin UI с Auth Service

## 📋 Проблема (WHY)

### Текущее состояние
1. **Landing** (`infra/quark-landing`):
   - ✅ Красивая форма авторизации/регистрации (`AuthModal`, `AuthForm`)
   - ❌ Нет реальной интеграции с Auth Service
   - ❌ Mock-обработчики (`setTimeout`)
   - ❌ Нет TypeScript types для API

2. **Admin UI** (`infra/quark-ui`):
   - ❌ Нет форм авторизации вообще
   - ❌ Нет JWT token management
   - ❌ Нет защищённых роутов

3. **Auth Service** (`services/auth-service`):
   - ✅ Работает на порту 3001
   - ✅ Есть API endpoints (login, register, validate)
   - ❌ Нет OpenAPI спецификации
   - ❌ Нет TypeScript types для клиентов

### Боль пользователей
- Нельзя зарегистрироваться реально
- Нельзя войти в систему
- Админ-панель открыта без авторизации
- Нет токенов, нет сессий

## 🎯 Цели (WHAT)

### Must Have (MVP)
1. **OpenAPI спецификация Auth Service**:
   - Endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/validate`, `GET /auth/health`
   - Request/Response schemas
   - Error codes

2. **TypeScript types генерация**:
   - Из OpenAPI → TypeScript interfaces
   - Shared package для всех фронтендов

3. **API клиент для Landing**:
   - `services/auth-api.ts` с typed методами
   - `login(email, password)`, `register(email, password)`
   - Error handling, loading states

4. **API клиент для Admin UI**:
   - Тот же `auth-api.ts` (shared)
   - JWT token storage (localStorage)
   - Axios interceptors для авторизации

5. **Интеграция форм**:
   - Landing: `AuthForm` → реальный API call
   - Admin UI: создать `LoginPage`

### Should Have
- [ ] Refresh token logic
- [ ] Protected routes guard
- [ ] Auto-redirect after login
- [ ] Remember me checkbox

### Could Have
- [ ] Social OAuth (Google, GitHub)
- [ ] Email verification
- [ ] Password reset flow

## 📊 Метрики успеха

1. **Функциональность**:
   - ✅ Пользователь может зарегистрироваться → получить токен
   - ✅ Пользователь может войти → получить токен
   - ✅ Админ UI проверяет токен перед входом

2. **DX (Developer Experience)**:
   - ✅ TypeScript types работают (autocomplete, type-safety)
   - ✅ API client типизирован
   - ✅ Ошибки показываются понятно

3. **Производительность**:
   - API call < 500ms
   - Token validation < 100ms

## 🧩 User Stories

### US-1: Регистрация нового пользователя (Landing)
**Как** посетитель лендинга  
**Я хочу** зарегистрироваться  
**Чтобы** получить доступ к платформе

**Сценарий**:
1. Пользователь открывает Landing (localhost:3200)
2. Кликает "Get Started" → открывается `AuthModal` (mode="signup")
3. Заполняет email, password, confirmPassword
4. Кликает "Create Account"
5. **Происходит**: `POST /auth/register` → Auth Service
6. **Результат**: Успех (200) → показать "✓ Account created" → редирект на `/dashboard`
7. **Альтернатива**: Ошибка (409 Conflict) → показать "Email уже используется"

### US-2: Вход существующего пользователя (Landing)
**Как** зарегистрированный пользователь  
**Я хочу** войти в систему  
**Чтобы** попасть в админ-панель

**Сценарий**:
1. Кликает "Sign In" в header → `AuthModal` (mode="login")
2. Вводит email, password
3. Кликает "Sign In"
4. **Происходит**: `POST /auth/login` → получает JWT token
5. **Результат**: Токен сохраняется в localStorage → редирект на `http://localhost:3101` (Admin UI)

### US-3: Доступ к Admin UI (Protected)
**Как** система  
**Я должна** проверить JWT токен  
**Чтобы** разрешить доступ к админ-панели

**Сценарий**:
1. Пользователь открывает `http://localhost:3101`
2. Admin UI проверяет `localStorage.getItem('jwt_token')`
3. **Если нет токена**: показать страницу логина
4. **Если есть токен**: отправить `POST /auth/validate` с токеном
5. **Если валидный**: пустить в dashboard
6. **Если невалидный**: очистить localStorage → показать логин

## 🔧 Технические требования

### API Contracts (OpenAPI)

**POST /auth/register**:
```yaml
/auth/register:
  post:
    summary: Register new user
    requestBody:
      content:
        application/json:
          schema:
            type: object
            required: [email, password]
            properties:
              email:
                type: string
                format: email
              password:
                type: string
                minLength: 8
    responses:
      '201':
        description: User created
        content:
          application/json:
            schema:
              type: object
              properties:
                token:
                  type: string
                  description: JWT token
                user:
                  type: object
                  properties:
                    id: {type: string}
                    email: {type: string}
                    createdAt: {type: string, format: date-time}
      '409':
        description: Email already exists
      '400':
        description: Validation error
```

**POST /auth/login**:
```yaml
/auth/login:
  post:
    summary: Login user
    requestBody:
      content:
        application/json:
          schema:
            type: object
            required: [email, password]
            properties:
              email: {type: string, format: email}
              password: {type: string}
    responses:
      '200':
        description: Login successful
        content:
          application/json:
            schema:
              type: object
              properties:
                token: {type: string}
                user:
                  type: object
                  properties:
                    id: {type: string}
                    email: {type: string}
                    roles: {type: array, items: {type: string}}
      '401':
        description: Invalid credentials
```

### TypeScript Types (Generated)

```typescript
// @quark/api-types/auth.ts (auto-generated)
export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
```

### API Client Interface

```typescript
// shared/api/auth-client.ts
class AuthApiClient {
  constructor(baseUrl: string);
  
  async register(data: RegisterRequest): Promise<RegisterResponse>;
  async login(data: LoginRequest): Promise<LoginResponse>;
  async validate(token: string): Promise<{ valid: boolean; user?: any }>;
  
  // Token management
  saveToken(token: string): void;
  getToken(): string | null;
  clearToken(): void;
}
```

## 🚫 Non-Goals (OUT OF SCOPE)

- ❌ Email verification (будет в 004-email-service)
- ❌ Password reset (будет в 004-email-service)
- ❌ Social OAuth (будет в 005-oauth-integration)
- ❌ Multi-factor authentication (будет в 006-mfa)
- ❌ Role-based UI (будет в 007-rbac-ui)

## 🔗 Зависимости

### Внешние
- Auth Service должен быть запущен (port 3001)
- PostgreSQL база должна быть инициализирована

### Внутренние
- `.specify/memory/constitution.md` - архитектурные принципы
- `docs/architecture/ui-architecture.md` - UI архитектура
- `services/auth-service/` - существующий Auth Service

## 📅 Временная оценка

- **OpenAPI спецификация**: 2 часа
- **TypeScript types генерация**: 1 час
- **API client (shared)**: 3 часа
- **Интеграция Landing**: 2 часа
- **Интеграция Admin UI**: 3 часа
- **Тестирование**: 2 часа

**Итого**: ~13 часов (~2 рабочих дня)

## ✅ Acceptance Criteria

### Landing
- [ ] Форма регистрации отправляет реальный POST /auth/register
- [ ] При успехе показывает "✓ Account created" + редирект
- [ ] При ошибке показывает понятное сообщение (email exists, weak password)
- [ ] Форма логина отправляет POST /auth/login
- [ ] Токен сохраняется в localStorage
- [ ] После логина редирект на Admin UI

### Admin UI
- [ ] При входе на / проверяет наличие токена
- [ ] Если нет токена → показать LoginPage
- [ ] LoginPage работает (login form + API call)
- [ ] При успешном логине → редирект на /dashboard
- [ ] Все API calls используют Bearer token из localStorage

### Types & API Client
- [ ] TypeScript types сгенерированы из OpenAPI
- [ ] API client типизирован (autocomplete работает)
- [ ] Error handling есть (try/catch, user-friendly messages)
- [ ] Loading states обрабатываются

### Testing
- [ ] Auth Service отвечает на все endpoints
- [ ] Можно создать пользователя через Landing
- [ ] Можно войти через Landing
- [ ] Можно войти через Admin UI
- [ ] Невалидные токены отклоняются
