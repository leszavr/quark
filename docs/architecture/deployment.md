# Deployment Diagram

## Окружения
- **Development** — локально, Docker Compose
- **Staging** — Kubernetes (minikube), production-like
- **Production** — Kubernetes (EKS/GKE), autoscaling

## Узлы

### Клиентская сторона
- Браузер (Web)
- Мобильное устройство (React Native)

### Сеть
- Cloudflare: TLS, WAF, DNS, CDN

### Серверная сторона
```
[Ingress (Traefik)]
       ↓
[Pod: auth-service] — PostgreSQL
[Pod: blog-service] — PostgreSQL
[Pod: messaging-service] — Redis
[Pod: ai-orchestrator] — Ollama
[Pod: plugin-hub]
[Pod: nats]
[Pod: minio]
[Pod: grafana + tempo + loki + prometheus]
```

## Хранилище
- **PostgreSQL**: StatefulSet, PVC
- **MinIO**: 4 ноды, erasure coding
- **Backups**: Velero + S3

## Сеть
- Внутренняя: Kubernetes Service
- Внешняя: Ingress → Cloudflare