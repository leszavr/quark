# Утилиты для обработки ошибок и состояния загрузки

## Обзор

В этом документе описаны утилиты для обработки ошибок и состояния загрузки в приложении Quark UI.

## Обработка ошибок

### Типы ошибок

#### Сетевые ошибки
- `NetworkError` - проблемы с подключением
- `TimeoutError` - превышено время ожидания
- `ConnectionError` - потеря соединения

#### Ошибки API
- `APIError` - общая ошибка API
- `ValidationError` - ошибки валидации данных
- `AuthError` - ошибки аутентификации
- `NotFoundError` - ресурс не найден
- `ServerError` - внутренние ошибки сервера

#### Ошибки приложения
- `AppError` - общая ошибка приложения
- `ConfigError` - ошибки конфигурации

### Классы ошибок

```typescript
class QuarkError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = this.constructor.name;
  }
}

class NetworkError extends QuarkError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', details);
  }
}

class APIError extends QuarkError {
  constructor(message: string, public status: number, details?: any) {
    super(message, 'API_ERROR', details);
  }
}
```

### Обработка ошибок в компонентах

#### Error Boundary
Компонент для перехвата ошибок в дереве компонентов:

```tsx
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

#### Обработка ошибок в хуках
Использование `useState` для хранения состояния ошибки:

```typescript
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState<boolean>(false);

const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await api.getData();
    setData(data);
  } catch (err) {
    setError(getErrorMessage(err));
  } finally {
    setLoading(false);
  }
};
```

## Состояние загрузки

### Типы состояний загрузки

#### Глобальная загрузка
- Индикатор в шапке приложения
- Блокировка интерфейса

#### Локальная загрузка
- Индикатор на кнопке
- Скелетоны для контента
- Прогресс-бары

### Компоненты индикаторов загрузки

#### Spinner
Простой спиннер для небольших элементов:

```tsx
<Spinner size="sm" color="primary.500" />
```

#### Skeleton
Скелетоны для имитации контента:

```tsx
<Skeleton height="20px" />
<Skeleton height="20px" mt={2} />
<Skeleton height="20px" mt={2} width="80%" />
```

#### ProgressBar
Прогресс-бар для длительных операций:

```tsx
<Progress value={progress} hasStripe isAnimated />
```

### Управление состоянием загрузки

#### Глобальное состояние
Использование Zustand для глобального состояния загрузки:

```typescript
interface LoadingState {
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (isLoading: boolean, message?: string) => void;
}
```

#### Локальное состояние
Использование React хуков для локального состояния:

```typescript
const [loading, setLoading] = useState(false);
const [progress, setProgress] = useState(0);
```

## Утилиты

### Форматирование ошибок

```typescript
const getErrorMessage = (error: unknown): string => {
  if (error instanceof QuarkError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Произошла неизвестная ошибка';
};
```

### Retry механизм

```typescript
const retry = async <T>(fn: () => Promise<T>, retries: number = 3): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return retry(fn, retries - 1);
    }
    throw error;
  }
};
```

## Интеграция с API

### Обработка ошибок в API вызовах

```typescript
const apiCall = async <T>(url: string, options?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new APIError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new NetworkError('Network error occurred');
    }
    
    throw error;
  }
};
```

### Автоматическая обработка ошибок

```typescript
const useApi = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall<T>(url);
        setData(result);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [url]);
  
  return { data, loading, error };
};
```

## UX рекомендации

### Отображение ошибок
- Использовать понятный язык
- Предоставлять варианты решения
- Добавлять кнопки повтора
- Логировать ошибки для разработчиков

### Отображение загрузки
- Показывать индикаторы как можно раньше
- Использовать скелетоны вместо пустых мест
- Добавлять текстовые описания длительных операций
- Обеспечивать плавные переходы между состояниями