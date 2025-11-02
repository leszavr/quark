#!/bin/bash

# Установка GitLab Runner (для Ubuntu/Debian)
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash
sudo apt-get install gitlab-runner

# Регистрация раннера
echo "Для регистрации раннера выполните следующую команду на сервере раннера:"
echo "sudo gitlab-runner register"
echo ""
echo "Вам потребуется:"
echo "1. URL GitLab инстанса (обычно https://gitlab.example.com/)"
echo "2. Регистрационный токен из Settings > CI/CD > Runners вашего проекта"
echo "3. Описание раннера (например, 'quark-landing-runner')"
echo "4. Теги (например, 'docker,quark')"
echo "5. Executor (выберите 'shell' для простоты)"

echo ""
echo "Альтернативно, вы можете использовать Docker для запуска раннера:"
echo "docker run -d --name gitlab-runner --restart always \\
  -v /srv/gitlab-runner/config:/etc/gitlab-runner \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  gitlab/gitlab-runner:latest"

echo ""
echo "После регистрации раннера перезапустите его:"
echo "sudo gitlab-runner restart"
