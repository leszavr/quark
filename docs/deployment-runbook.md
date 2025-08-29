# Deployment Runbook

## Шаги развёртывания
1. Применить манифесты Kubernetes:
   ```bash
   kubectl apply -f manifests/
   ```
2. Проверить состояние подов:
   ```bash
   kubectl get pods
   ```
3. Проверить логи приложения:
   ```bash
   kubectl logs <pod-name>
   ```