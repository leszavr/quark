# Data Model

```mermaid
erDiagram
    USER ||--o{ BLOG : has
    USER ||--o{ POST : writes
    POST ||--o{ COMMENT : has
    POST ||--o{ MEDIA : contains
    USER ||--o{ MESSAGE : sends
```