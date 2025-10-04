# Swagger UI для Quark Platform

Интерактивная документация API всех сервисов платформы Quark.

## Быстрый запуск

```bash
cd /var/www/quark/infra/swagger-ui
docker build -t quark-swagger-ui .
docker run -p 8081:8080 quark-swagger-ui
```

Откройте браузер: `http://localhost:8081`

## Интеграция с docker-compose

Добавьте в `docker-compose.yml`:

```yaml
swagger-ui:
  build: ./infra/swagger-ui
  container_name: quark-swagger-ui
  environment:
    - SWAGGER_JSON=/usr/share/nginx/html/swagger.yaml
    - TRY_IT_OUT_ENABLED=true
  ports:
    - "8081:8080"
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.swagger-ui.rule=Host(`docs.quark.local`)"
    - "traefik.http.services.swagger-ui.loadbalancer.server.port=8080"
  networks:
    - quark-network
```

## Доступ

- **Локально:** http://localhost:8081
- **Через Traefik:** http://docs.quark.local (после добавления в docker-compose.yml)

## Обновление спецификации

1. Отредактируйте `/var/www/quark/infra/swagger.yaml`
2. Пересоберите контейнер: `docker compose build swagger-ui`
3. Перезапустите: `docker compose up -d swagger-ui`

## Функциональность

- ��� Интерактивное тестирование API
- ✅ Автоматическая аутентификация через JWT
- ✅ Примеры запросов и ответов
- ✅ Валидация схем данных
- ✅ Экспорт в различные форматы