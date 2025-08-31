# Resource Schema: Структура данных

## Blog Post
```json
{
  "id": "string",
  "title": "string",
  "content": "string",
  "authorId": "string",
  "published": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "tags": ["string"],
  "coverImage": "string (URL)"
}
```

## User
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "displayName": "string",
  "avatar": "string",
  "bio": "string",
  "createdAt": "datetime"
}
```

## Message
```json
{
  "id": "string",
  "senderId": "string",
  "receiverId": "string",
  "content": "string",
  "timestamp": "datetime",
  "isRead": "boolean"
}
```

> ✅ Все схемы используются в OpenAPI и AsyncAPI