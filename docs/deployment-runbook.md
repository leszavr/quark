# Deployment Runbook

## 1. Подготовка
- Убедиться, что Kubernetes кластер работает
- Проверить наличие секретов в Vault

## 2. Деплой
```bash
kubectl apply -f k8s/blog-deployment.yaml
kubectl rollout status deployment/blog-service
   ```
## 3. Проверка 

- /health → 200 OK
- Логи: kubectl logs blog-pod-123
- Метрики: Grafana → latency, RPS