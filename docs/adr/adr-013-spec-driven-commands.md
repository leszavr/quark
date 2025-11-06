# ADR-013: Реализация spec-driven команд в quark-manager.sh

## Статус

Принято

## Контекст

Проект Quark использует spec-driven подход к разработке, при котором каждый сервис сначала описывается в виде спецификаций:
- OpenAPI для REST API
- AsyncAPI для событийной архитектуры
- module-manifest для описания зависимостей

В [quark-manager.sh](file:///home/odmen/quark/quark-manager.sh) были объявлены команды для работы со спецификациями, но они не были реализованы:
- `spec:new` - создание новой спецификации
- `spec:validate` - валидация спецификаций
- `spec:types` - генерация TypeScript типов
- `spec:mock` - запуск mock сервера
- `spec:generate-tests` - генерация тестов

Это создавало путаницу у пользователей, которые видели команды в справке, но получали сообщения о том, что они не реализованы.

## Решение

1. Реализовать базовые команды `spec:new` и `spec:validate` в [quark-manager.sh](file:///home/odmen/quark/quark-manager.sh)
2. Использовать Docker-based подход для инструментов валидации
3. Создать структуру для последующей реализации остальных команд
4. Документировать реализованные команды

## Реализация

### spec:new

Команда создает новую спецификацию сервиса из шаблонов:
- Копирует шаблоны из [.specify/templates/](file:///home/odmen/quark/.specify/templates/)
- Создает структуру директорий в [specs/](file:///home/odmen/quark/specs/)
- Присваивает следующий порядковый номер
- Заменяет placeholders в шаблонах

### spec:validate

Команда валидирует спецификации с помощью инструментов:
- OpenAPI валидация через spectral (Docker)
- AsyncAPI валидация через @asyncapi/cli (Docker)

### Docker-based подход

Все инструменты запускаются через Docker для избежания необходимости установки глобальных пакетов:
- stoplight/spectral для OpenAPI валидации
- asyncapi/cli для AsyncAPI валидации

## Последствия

### Положительные

- Реализована часть spec-driven команд
- Улучшена документация
- Повышен уровень автоматизации
- Упрощен процесс создания новых спецификаций
- Обеспечена валидация контрактов

### Отрицательные

- Необходимость установки Docker
- Зависимость от внешних Docker образов
- Медленный первый запуск (pull образов)

## См. также

- [docs/spec-driven-summary.md](file:///home/odmen/quark/docs/spec-driven-summary.md)
- [docs/spec-driven-practical-guide.md](file:///home/odmen/quark/docs/spec-driven-practical-guide.md)
- [.specify/templates/](file:///home/odmen/quark/.specify/templates/)
- [specs/001-user-service/](file:///home/odmen/quark/specs/001-user-service/)