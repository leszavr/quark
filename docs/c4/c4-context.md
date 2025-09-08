# C4 Model: System Context (Level 1)

## Описание
Показывает систему **Quark** в её окружении: пользователи, внешние сервисы, зависимости.

```mermaid
C4Context
    title System Context Diagram for Quark

    Person(user, "Пользователь", "Читает блоги, пишет посты, общается в мессенджере")
    Person(developer, "Сторонний разработчик", "Создаёт и подключает модули")
    Person(admin, "Администратор", "Управляет системой, модерирует контент")

    System_Ext(github, "GitHub / GitLab", "CI/CD, хранение кода")
    System_Ext(cloud, "Cloud Provider (AWS/GCP)", "Инфраструктура, хранение")
    System_Ext(ollama, "Ollama / OpenAI", "LLM для ИИ-агентов")
    System_Ext(cloudflare, "Cloudflare", "CDN, WAF, DNS")
    System_Ext(sentry, "Sentry", "Отслеживание ошибок")
    System_Ext(email, "Email-сервис", "Рассылка уведомлений")

    System(quark, "Quark Platform", "Модульная платформа: блоги + мессенджер + ИИ")

    Rel(user, quark, "Чтение, публикация, общение")
    Rel(developer, quark, "Загрузка модулей через Plugin Hub")
    Rel(admin, quark, "Управление через Admin Panel")
    Rel(quark, github, "Автоматический деплой")
    Rel(quark, cloud, "Развёртывание в облаке")
    Rel(quark, ollama, "Генерация контента, модерация")
    Rel(quark, cloudflare, "HTTPS, защита от DDoS")
    Rel(quark, sentry, "Отправка ошибок")
    Rel(quark, email, "Отправка уведомлений")
```

## Участники
- **Пользователь** — основной потребитель платформы
- **Сторонний разработчик** — создаёт модули
- **Администратор** — управляет системой
- **Внешние сервисы** — интеграции

## Цель
- Показать границы системы
- Определить взаимодействие с внешним миром
- Использовать как основу для более детальных диаграмм