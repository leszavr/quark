#!/bin/bash

echo "=== Регистрация GitLab Runner ==="
echo "Перед запуском убедитесь, что вы:"
echo "1. Получили регистрационный токен из Settings > CI/CD > Runners вашего проекта в GitLab"
echo "2. Имеете URL вашего GitLab инстанса (например, https://gitlab.com/)"
echo ""
echo "Запуск регистрации..."
sudo gitlab-runner register
