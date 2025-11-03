# Frontend-Backend Integration Pattern для Quark

**Дата**: 3 ноября 2025  
**Статус**: Архитектурное решение

---

## 🎯 Когда подключать Frontend?

### Правило: Frontend интегрируется **ПОСЛЕ Phase 3-4 Backend**

```
Backend Phases:
Phase 0: Research & Foundation
Phase 1: Contracts (OpenAPI, AsyncAPI, UDI) ← FRONTEND МОЖЕТ НАЧАТЬ РАБОТУ
Phase 2: Tests (Contract, Integration, E2E)
Phase 3: Core Implementation (код для тестов)
Phase 4: UDI Integration ← FRONTEND ИНТЕГРИРУЕТСЯ СЮДА
Phase 5: Deployment

Frontend Phases (параллельно с Backend Phase 1-3):
Phase 0: UI/UX Design (Figma mockups)
Phase 1: Component Library (на основе OpenAPI schemas)
Phase 2: Mock API Integration (на основе OpenAPI examples)
Phase 3: Real API Integration (Phase 4 backend готов)
```

### ✅ Преимущество contracts-first подхода
**Frontend может начать разработку ДО готовности backend!**

```
Backend Day 1-2:  spec.md + plan.md + contracts/ (OpenAPI, AsyncAPI)
                  ↓
Frontend Day 2-5: Использует OpenAPI → генерирует TypeScript types
                  Использует examples → создаёт mock API server
                  Разрабатывает UI компоненты (работает с моками)
                  ↓
Backend Day 3-6:  Реализует реальный API
                  ↓
Frontend Day 6:   Меняет baseURL: 'http://mock-api' → 'http://localhost:3004'
                  Всё работает (контракты совпадают!)
```

---

## 🔧 Практический паттерн интеграции

### Сценарий: Интеграция user-service с Frontend

#### Шаг 1: Backend создаёт контракты (уже готово!)
```yaml
# specs/001-user-service/contracts/openapi.yaml
paths:
  /users/me:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserProfileResponse'
              example:  # ← Frontend использует это!
                user_id: "550e8400-e29b-41d4-a716-446655440000"
                username: "john_doe"
                email: "john.doe@example.com"
                profile:
                  bio: "Full-stack developer"
                  avatar_url: "https://media.quark.example/avatars/john_doe.jpg"
```

#### Шаг 2: Frontend генерирует types из OpenAPI
```bash
# Frontend (React/Next.js/Vue)
cd infra/quark-ui/

# Установить генератор types
npm install --save-dev openapi-typescript

# Сгенерировать TypeScript types из OpenAPI
npx openapi-typescript \
  ../../specs/001-user-service/contracts/openapi.yaml \
  --output src/api/user-service.types.ts
```

**Результат**:
```typescript
// src/api/user-service.types.ts (автогенерация!)
export interface UserProfileResponse {
  user_id: string;
  username: string;
  email: string;
  profile: {
    bio: string | null;
    avatar_url: string | null;
    contact_info: Record<string, any> | null;
    profile_visibility: 'public' | 'friends_only' | 'private';
  };
  roles: Array<{
    name: string;
    permissions: string[];
  }>;
  subscription: {
    type: 'monthly' | 'yearly';
    status: 'active' | 'expired' | 'cancelled';
    expiry_date: string;
  } | null;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}
```

#### Шаг 3: Frontend создаёт API client (type-safe!)
```typescript
// src/api/user-service.client.ts
import type { UserProfileResponse } from './user-service.types';

const API_BASE = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:3004/api/v1';

export class UserServiceClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl = API_BASE) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options?.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Type-safe метод (auto-complete работает!)
  async getUserMe(): Promise<UserProfileResponse> {
    return this.request<UserProfileResponse>('/users/me');
  }

  async updateUserMe(data: Partial<UserProfileResponse['profile']>): Promise<UserProfileResponse> {
    return this.request<UserProfileResponse>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUserMe(): Promise<void> {
    await this.request<void>('/users/me', { method: 'DELETE' });
  }
}

// Singleton instance
export const userService = new UserServiceClient();
```

#### Шаг 4: Frontend использует в React компонентах
```tsx
// src/components/UserProfile.tsx
import { useEffect, useState } from 'react';
import { userService } from '@/api/user-service.client';
import type { UserProfileResponse } from '@/api/user-service.types';

export function UserProfile() {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await userService.getUserMe();
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Failed to load profile</div>;

  return (
    <div className="user-profile">
      <img src={profile.profile.avatar_url || '/default-avatar.png'} alt={profile.username} />
      <h1>{profile.username}</h1>
      <p>{profile.profile.bio}</p>
      
      {/* Type-safe! TypeScript знает, что roles - это массив */}
      <div className="roles">
        {profile.roles.map(role => (
          <span key={role.name} className="badge">{role.name}</span>
        ))}
      </div>

      {/* Type-safe! TypeScript знает, что subscription может быть null */}
      {profile.subscription && (
        <div className="subscription">
          Status: {profile.subscription.status}
          Expires: {new Date(profile.subscription.expiry_date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 Real-time интеграция (NATS events → WebSocket)

### Для messaging-service (WebSocket + NATS)

#### Backend (messaging-service)
```typescript
// services/messaging-service/src/websocket/gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class MessagingGateway {
  @WebSocketServer()
  server: Server;

  // Подписка на NATS события
  async handleMessageCreated(event: MessageCreatedEvent) {
    // Отправить всем подключённым клиентам
    this.server.to(`dialog:${event.dialog_id}`).emit('message.created', {
      message_id: event.message_id,
      sender_id: event.sender_id,
      content: event.content,
      created_at: event.created_at,
    });
  }
}
```

#### Frontend (React)
```typescript
// src/hooks/useMessaging.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useMessaging(dialogId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Подключение к WebSocket
    const newSocket = io('http://localhost:3005', {
      auth: { token: localStorage.getItem('jwt') },
    });

    // Подписка на события
    newSocket.on('connect', () => {
      console.log('Connected to messaging service');
      newSocket.emit('join_dialog', { dialog_id: dialogId });
    });

    newSocket.on('message.created', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [dialogId]);

  const sendMessage = (content: string) => {
    if (socket) {
      socket.emit('send_message', { dialog_id: dialogId, content });
    }
  };

  return { messages, sendMessage };
}
```

---

## 📋 Checklist интеграции Frontend-Backend

### Phase 1: Контракты готовы (Backend Day 2)
- [ ] OpenAPI spec создан в `specs/*/contracts/openapi.yaml`
- [ ] AsyncAPI spec создан для NATS events (если есть real-time)
- [ ] Examples в OpenAPI заполнены (для mock API)
- [ ] Commit в Git → Frontend может начать работу

### Phase 2: Frontend Mock Integration (Frontend Day 2-5)
- [ ] Сгенерировать TypeScript types: `npx openapi-typescript`
- [ ] Создать API client с type-safe методами
- [ ] (Опционально) Поднять mock API server: `npx @stoplight/prism-cli mock openapi.yaml`
- [ ] Разработать UI компоненты (работают с моками)
- [ ] Написать тесты (Jest + React Testing Library)

### Phase 3: Backend Implementation (Backend Day 3-6)
- [ ] Backend реализует реальный API (Phase 3-4)
- [ ] Contract tests проверяют соответствие OpenAPI
- [ ] Integration tests с реальной БД
- [ ] Swagger UI доступен: `http://localhost:3004/api/v1/docs`

### Phase 4: Real Integration (Frontend Day 6)
- [ ] Frontend меняет baseURL на реальный backend
- [ ] Проверить E2E тесты (Playwright/Cypress)
- [ ] Проверить CORS настройки backend
- [ ] Проверить JWT authentication flow
- [ ] Проверить error handling (401, 403, 500)

### Phase 5: Real-time (если есть WebSocket/SSE)
- [ ] Backend поднимает WebSocket gateway
- [ ] Frontend подключается к WebSocket
- [ ] Проверить reconnection logic
- [ ] Проверить event typing (TypeScript)

---

## 🛠️ Инструменты для интеграции

### 1. OpenAPI → TypeScript types
```bash
npm install --save-dev openapi-typescript
npx openapi-typescript specs/*/contracts/openapi.yaml -o src/api/types.ts
```

### 2. Mock API server (для разработки Frontend без Backend)
```bash
npm install -g @stoplight/prism-cli
prism mock specs/001-user-service/contracts/openapi.yaml
# Mock API доступен: http://localhost:4010
```

### 3. AsyncAPI → TypeScript types (для NATS events)
```bash
npm install -g @asyncapi/generator
ag specs/*/contracts/asyncapi.yaml @asyncapi/typescript-template -o src/events
```

### 4. Swagger UI для тестирования API
```yaml
# docker-compose.yml (уже есть в Quark)
swagger-ui:
  image: swaggerapi/swagger-ui
  ports:
    - "8081:8080"
  environment:
    SWAGGER_JSON: /specs/openapi.yaml
  volumes:
    - ./specs/001-user-service/contracts/openapi.yaml:/specs/openapi.yaml
```

---

## 📊 Timeline интеграции (для solo developer)

### Вариант А: Backend first (текущий подход)
```
Week 1: Backend user-service (spec → plan → contracts → code)
Week 2: Backend messaging-service
Week 3: Frontend для user-service + messaging-service
Week 4: Integration + Testing
```

**Проблема**: Frontend ждёт 2 недели → не параллелизовано

### Вариант Б: Contracts first (рекомендую для solo + AI)
```
Day 1-2:  Backend: spec + plan + contracts для user-service
Day 2-3:  Frontend: Mock integration для user-service (параллельно с Backend Day 3)
Day 3-5:  Backend: Реализация user-service (Phase 3-4)
Day 5-6:  Frontend: Real integration + testing
Day 7-8:  Backend: spec + plan + contracts для messaging-service
Day 8-9:  Frontend: Mock integration для messaging-service
Day 9-11: Backend: Реализация messaging-service
Day 11-12: Frontend: Real integration + WebSocket
```

**Преимущество**: Frontend и Backend работают **параллельно** (AI делает одно, ты - другое)

---

## 🎯 Рекомендация для Quark (solo developer + AI)

### Workflow для тебя + AI:
```
1. Ты: "AI, создай spec.md для user-service"
   AI: генерирует spec.md (использует .specify/templates/)
   
2. Ты: "AI, создай plan.md и contracts/"
   AI: генерирует plan.md + OpenAPI + AsyncAPI
   
3. Ты: "AI, сгенерируй TypeScript types из OpenAPI"
   AI: npx openapi-typescript → src/api/user-service.types.ts
   
4. Ты: "AI, создай React компонент UserProfile"
   AI: создаёт компонент (использует types → type-safe!)
   ✅ Frontend готов (работает с mock API)
   
5. Ты: "AI, реализуй backend user-service"
   AI: создаёт NestJS code (Phase 3-4)
   
6. Ты: Меняешь baseURL в Frontend → всё работает!
```

### Порядок приоритетов:
1. **user-service**: Backend spec/plan/contracts (Day 1-2)
2. **user-service**: Frontend mock integration (Day 2-3) ← **ТЫ СЕЙЧАС ЗДЕСЬ**
3. **user-service**: Backend implementation (Day 3-5)
4. **user-service**: Real integration (Day 5-6)
5. Повторить для messaging-service, media-service и т.д.

---

## 🚀 Следующий шаг

**Я рекомендую**: Создать **Frontend Integration Guide** прямо сейчас, потом интегрировать с `quark-manager.sh`.

Команды для автоматизации:
```bash
# Генерация types из OpenAPI
./quark-manager.sh generate types --service user-service --output infra/quark-ui/src/api/

# Запуск mock API
./quark-manager.sh mock start --service user-service --port 4010

# Проверка соответствия контрактам
./quark-manager.sh validate contract --service user-service
```

**Готов продолжить?** Что делаем первым:
- **A)** Создать frontend integration example (UserProfile компонент)
- **B)** Интегрировать с quark-manager.sh (команды для types generation)
- **C)** Создать spec для messaging-service (следующий сервис)
