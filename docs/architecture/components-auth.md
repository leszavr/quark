# C4 Model: Component Diagram — Auth Service

## Описание
Детализация внутренних компонентов `auth-service`.

```mermaid
C4Component
    title Component Diagram: Auth Service

    Container_Boundary(auth_service, "Auth Service") {
        Component(login_controller, "LoginController", "HTTP", "Обработка /auth/login")
        Component(register_controller, "RegisterController", "HTTP", "Обработка /auth/register")
        Component(auth_service_logic, "AuthService", "Business Logic", "Валидация, генерация JWT")
        Component(user_repository, "UserRepository", "PostgreSQL", "CRUD пользователей")
        Component(jwt_generator, "JWTGenerator", "JWT", "Создание и валидация токенов")
        Component(email_client, "EmailClient", "SMTP", "Отправка писем (верификация)")
        Component(rate_limiter, "RateLimiter", "Redis", "Ограничение попыток входа")
    }

    Container(gateway, "API Gateway", "Traefik")
    Container(user_service, "User Service", "NestJS")
    Container(postgres, "PostgreSQL", "БД пользователей")
    Container(redis, "Redis", "Кэш, rate limiting")
    Container(email_service, "Email Service", "SMTP")

    Rel(gateway, login_controller, "POST /auth/login")
    Rel(gateway, register_controller, "POST /auth/register")
    Rel(login_controller, auth_service_logic, "validateCredentials()")
    Rel(register_controller, auth_service_logic, "createUser()")
    Rel(auth_service_logic, user_repository, "Сохранение/чтение")
    Rel(user_repository, postgres, "SQL")
    Rel(auth_service_logic, jwt_generator, "generateJWT()")
    Rel(jwt_generator, login_controller, "access_token")
    Rel(auth_service_logic, email_client, "sendVerificationEmail()")
    Rel(email_client, email_service, "SMTP")
    Rel(login_controller, rate_limiter, "checkRateLimit()")
    Rel(rate_limiter, redis, "INCR / EXPIRE")
```

## Компоненты
| Компонент | Ответственность |
|---------|-----------------|
| `LoginController` | HTTP-интерфейс для входа |
| `RegisterController` | HTTP-интерфейс для регистрации |
| `AuthService` | Бизнес-логика: валидация, хеширование пароля |
| `UserRepository` | Работа с БД |
| `JWTGenerator` | Подпись и валидация токенов |
| `EmailClient` | Отправка писем (верификация) |
| `RateLimiter` | Защита от брутфорса |

## Цель
- Показать, как реализуется безопасность и масштабируемость
- Поддержать стандарты из `secure-arch-guidelines.md`
- Готовность к интеграции с `user-service` и `plugin-hub`