# Deployment Diagram

```mermaid
graph TD;
    Kubernetes["Kubernetes Cluster"]
    AuthService["auth-service"]
    BlogService["blog-service"]
    MessengerService["messenger-service"]

    AuthService -->|Размещён в| Kubernetes
    BlogService -->|Размещён в| Kubernetes
    MessengerService -->|Размещён в| Kubernetes
```