# IAM: Управление идентификацией и доступом

## Аутентификация
- **JWT** (JSON Web Token)
- Стандартный payload:
  ```json
  {
    "sub": "user-123",
    "roles": ["user", "moderator"],
    "permissions": ["posts:read", "posts:write:own"],
    "exp": 1712349278
  }
  ```
- Срок действия: 15 минут (access), 7 дней (refresh)
- Подпись: HS256 с ключом из Vault

## Авторизация
- **RBAC (Role-Based Access Control)**
- Роли:
  - `user`: может писать посты, комментировать
  - `moderator`: может помечать контент, просматривать flagged
  - `admin`: полный доступ к панели
- Права:
  - `posts:read`, `posts:write:own`, `posts:write:any`, `users:ban`

## Интеграция
- Все сервисы проверяют JWT через `auth-service/validate`
- Права проверяются локально по `permissions` в токене
