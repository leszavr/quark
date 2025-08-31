# Автоматизированная генерация документации

## Цель
Обеспечить **актуальность документации** за счёт интеграции с CI/CD.

## Инструменты

| Инструмент | Назначение | Интеграция |
|----------|-----------|-----------|
| **Swagger (OpenAPI Generator)** | Генерация SDK и документации из кода | FastAPI, NestJS |
| **Buf** | Валидация и генерация gRPC-контрактов | `*.proto` |
| **Mermaid Live** | Визуализация диаграмм в GitHub | `.mmd` |
| **MkDocs + Material** | Автоматическое создание сайта документации | CI/CD |
| **GitHub Actions** | Автоматический запуск генерации при коммите | `.github/workflows/docs.yml` |

## Процесс
1. Разработчик обновляет `openapi.yaml` или `asyncapi-events.yaml`
2. При PR запускается action:
   ```yaml
   - name: Generate Docs
     run: |
       npx @mermaid-js/mermaid-cli -i docs/*.mmd -o docs/diagrams/
       python -m openapi_spec_validator openapi.yaml
   ```
3. Обновлённая документация публикуется в `gh-pages`