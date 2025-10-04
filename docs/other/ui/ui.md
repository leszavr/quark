# Требования к UI-сервису Quark MKS

## Обзор проблемы

Текущая реализация UI в составе `blog-service` не является архитектурно правильной. UI должен быть выделен в отдельный инфраструктурный сервис для обеспечения масштабируемости, переиспользования и соответствия принципам микросервисной архитектуры.

## Архитектурные принципы

### 1. Разделение ответственности
- **UI-сервис**: отвечает только за отображение интерфейса и взаимодействие с пользователем
- **Business Logic Services**: отвечают за бизнес-логику (auth-service, blog-service, etc.)
- **API Gateway/Router**: маршрутизация запросов между сервисами

### 2. Слабая связанность
- UI не должен знать о внутренней реализации backend-сервисов
- Взаимодействие только через HTTP API или gRPC
- Возможность независимого развертывания и масштабирования

### 3. Повторное использование
- UI компоненты должны быть универсальными
- Возможность использования одного UI для разных модулей платформы

## Технические требования

### Frontend Stack
```yaml
Framework: React 18+ с TypeScript
Build Tool: Vite
Styling: 
  - Custom CSS Variables для темизации
  - CSS Modules или Styled Components
  - NO external UI libraries (shadcn/ui, Radix UI, etc.)
State Management: Context API + useReducer
Routing: React Router v6
HTTP Client: Fetch API или Axios
```

### Архитектура компонентов

#### 1. Базовые UI компоненты (Design System)
```
/components/ui/
├── Button/
│   ├── Button.tsx
│   ├── Button.module.css
│   └── index.ts
├── Modal/
│   ├── Modal.tsx
│   ├── Modal.module.css
│   └── index.ts
├── Input/
├── Card/
├── Table/
└── ...
```

#### 2. Бизнес-компоненты
```
/components/business/
├── Auth/
│   ├── LoginForm/
│   ├── RegisterForm/
│   └── UserProfile/
├── Blog/
│   ├── PostList/
│   ├── PostCard/
│   └── PostEditor/
└── ...
```

#### 3. Структура страниц
```
/pages/
├── HomePage/
├── BlogPage/
├── ProfilePage/
├── AdminPage/
└── ...
```

### CSS Architecture

#### 1. CSS Variables для темизации
```css
:root {
  /* Colors */
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;
  --color-border: #e2e8f0;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-family-primary: 'Inter', sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
}

[data-theme="dark"] {
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-border: #334155;
}
```

#### 2. Модальные окна без прозрачности
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: var(--color-background);
  border-radius: 8px;
  padding: var(--spacing-lg);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}
```

### API Integration Layer

#### 1. HTTP Client Configuration
```typescript
// services/api.ts
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken() {
    this.token = localStorage.getItem('auth_token');
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
}
```

#### 2. Service Layer
```typescript
// services/authService.ts
export class AuthService {
  constructor(private api: ApiClient) {}

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    return this.api.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.api.request('/auth/me');
  }
}
```

### Routing и Navigation

#### 1. Route Configuration
```typescript
// routes/index.tsx
export const routes = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/blog',
    element: <BlogPage />,
  },
  {
    path: '/blog/:postId',
    element: <PostDetailPage />,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
    protected: true,
  },
  {
    path: '/:username/blog',
    element: <UserBlogPage />,
  },
];
```

#### 2. Protected Routes
```typescript
// components/ProtectedRoute.tsx
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
```

### State Management

#### 1. Auth Context
```typescript
// contexts/AuthContext.tsx
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Auth methods implementation
  
  return (
    <AuthContext.Provider value={{ ...state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Development Requirements

#### 1. Environment Configuration
```typescript
// config/environment.ts
export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  AUTH_SERVICE_URL: import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001',
  BLOG_SERVICE_URL: import.meta.env.VITE_BLOG_SERVICE_URL || 'http://localhost:3002',
  PLUGIN_HUB_URL: import.meta.env.VITE_PLUGIN_HUB_URL || 'http://localhost:3003',
};
```

#### 2. Docker Configuration
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Testing Strategy

#### 1. Unit Tests
- Jest + React Testing Library
- Покрытие всех UI компонентов
- Тестирование пользовательских сценариев

#### 2. Integration Tests
- Cypress или Playwright
- E2E тестирование ключевых user flows

#### 3. Visual Regression Tests
- Storybook + Chromatic
- Контроль визуальных изменений

### Performance Requirements

1. **Bundle Size**: < 500KB gzipped
2. **First Contentful Paint**: < 1.5s
3. **Time to Interactive**: < 3s
4. **Lighthouse Score**: > 90

### Accessibility (A11y)

1. **WCAG 2.1 AA** compliance
2. **Keyboard Navigation** для всех интерактивных элементов  
3. **Screen Reader** support
4. **Color Contrast** минимум 4.5:1

### Security Requirements

1. **Content Security Policy** (CSP)
2. **XSS Protection**
3. **Secure Token Storage** (httpOnly cookies предпочтительнее localStorage)
4. **Input Validation** на frontend

### Deployment Strategy

#### 1. Development
```yaml
# docker-compose.dev.yml
services:
  quark-ui:
    build:
      context: ./infra/quark-ui
      target: development
    ports:
      - "3000:3000"
    volumes:
      - ./infra/quark-ui/src:/app/src
    environment:
      - VITE_API_BASE_URL=http://localhost:8080
```

#### 2. Production
```yaml
# docker-compose.yml
services:
  quark-ui:
    build: ./infra/quark-ui
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.quark-ui.rule=Host(`quark.local`)"
      - "traefik.http.routers.quark-ui.entrypoints=web"
      - "traefik.http.services.quark-ui.loadbalancer.server.port=80"
```

### Migration Plan

#### Phase 1: Создание UI сервиса
1. Создать структуру проекта в `/infra/quark-ui/`
2. Настроить базовую инфраструктуру (Vite, TypeScript, CSS)
3. Создать базовые UI компоненты

#### Phase 2: Миграция компонентов
1. Перенести компоненты из `blog-service/client/`
2. Рефакторинг без внешних библиотек  
3. Создание собственной системы модальных окон

#### Phase 3: API Integration
1. Настройка HTTP клиента
2. Интеграция с auth-service
3. Интеграция с blog-service

#### Phase 4: Testing & Optimization
1. Покрытие тестами
2. Performance optimization
3. A11y improvements

### File Structure

```
/infra/quark-ui/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button/
│   │   │   ├── Modal/
│   │   │   ├── Input/
│   │   │   └── ...
│   │   └── business/
│   │       ├── Auth/
│   │       ├── Blog/
│   │       └── ...
│   ├── pages/
│   ├── contexts/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── themes/
│   ├── config/
│   └── main.tsx
├── package.json
├── vite.config.ts
├── tsconfig.json
├── Dockerfile
└── nginx.conf
```

## Заключение

Создание отдельного UI-сервиса решит текущие проблемы с прозрачностью модальных окон, обеспечит лучшую архитектуру и позволит создать качественный, переиспользуемый интерфейс для всей Quark MKS платформы.

**Ключевые преимущества:**
- Чистая архитектура без внешних зависимостей
- Полный контроль над стилизацией
- Возможность оптимизации под конкретные потребности
- Лучшая производительность
- Простота сопровождения и развития