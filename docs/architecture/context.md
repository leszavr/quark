# Context Diagram

```mermaid
graph TD;
    Quark["Quark System"]
    User["Пользователь"]
    ExternalAPI["Внешние API"]

    User -->|Использует| Quark
    Quark -->|Обращается к| ExternalAPI
```