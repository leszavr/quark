# Data Model

```mermaid
erDiagram
    USER ||--o{ BLOG : "создаёт"
    BLOG ||--o{ POST : "содержит"
    POST ||--o{ COMMENT : "имеет"
```