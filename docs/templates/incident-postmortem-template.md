# Post-Mortem Report

## Инцидент
- **Название**: 
- **Дата**: 
- **Уровень**: Критический / Высокий / Средний

## Что произошло?
(Описание, timeline)

## Причина?
(Корневая причина: техническая, человеческая, процессная)

## Как обнаружено?
(Алерт, пользователь, мониторинг)

## Как исправлено?
(Действия, команды, время восстановления)

## Как предотвратить?
- [ ] Обновить документацию
- [ ] Добавить тест
- [ ] Улучшить мониторинг
- [ ] Обучить команду

## Ответственные
- **Incident Commander**: 
- **Technician**: 
- **Auditor**: 

## Статус
- [ ] Черновик
- [ ] Утверждён
- [ ] Закрыт


---

#### 📁 `docs/examples/`
> Примеры кода и контрактов

Создай папку `docs/examples/` с файлами:

- `grpc/blog-service.proto`
- `openapi/example-request-response.json`
- `module-manifest-full.yaml`
- `event-example.json`

Пример: `docs/examples/grpc/blog-service.proto`
```protobuf
syntax = "proto3";

package blog;

service BlogService {
  rpc CreatePost(CreatePostRequest) returns (CreatePostResponse);
  rpc GetPost(GetPostRequest) returns (GetPostResponse);
}

message CreatePostRequest {
  string title = 1;
  string content = 2;
  string author_id = 3;
}

message CreatePostResponse {
  string post_id = 1;
  string status = 2;
}

message GetPostRequest {
  string post_id = 1;
}

message GetPostResponse {
  string title = 1;
  string content = 2;
  string author_id = 3;
  bool published = 4;
}
```