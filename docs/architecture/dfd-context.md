# DFD-0: Context Diagram (Level 0)

## Описание
Показывает взаимодействие системы **Quark** с внешними сущностями.

```mermaid
graph TD
    A[Пользователь] -->|HTTP/HTTPS| B(Quark Platform)
    C[Мобильное приложение] -->|API| B
    D[Сторонний разработчик] -->|Модуль| B
    E[GitHub / GitLab] -->|CI/CD| B
    F[Cloud Provider] -->|Инфраструктура| B

    B --> G[Grafana / OTel]
    B --> H[Email-сервис]
    B --> I[CDN / MinIO]

    style B fill:#2196F3,stroke:#1976D2,color:white
```

## Участники
- **Пользователь** — создаёт посты, читает, общается
- **Мобильное приложение** — клиент для Android/iOS
- **Сторонний разработчик** — загружает модули
- **GitHub / GitLab** — доставка кода
- **Cloud Provider** — хостинг (AWS/GCP)
- **Grafana / OTel** — сбор метрик
- **Email-сервис** — уведомления
- **CDN / MinIO** — хранение медиа

## Потоки данных
| От | Кому | Данные | Протокол |
|----|------|--------|---------|
| Пользователь | Quark | Логин, пост, сообщение | HTTPS |
| Quark | Пользователь | Лента, профиль, ответ | HTTPS |
| GitHub | Quark | Docker-образ | CI/CD |
| Quark | Grafana | Метрики, трейсы | OTLP |
| Quark | Email | Уведомления | SMTP |
| Quark | CDN | Изображения | S3 API |
