#!/bin/bash

# Скрипт для запуска всех сервисов Quark

echo "Остановка запущенных сервисов..."
sudo docker-compose down

echo "Запуск всех сервисов Quark..."
sudo JWT_SECRET=1D4SqYIsrszmXpAH0/EhDzRjTemdL2BwWzzJNKTpzTQ= docker-compose up -d

echo "Запуск playground сервера..."
cd /var/www/quark/playground
nohup node server.js > server.log 2>&1 &
echo $! > server.pid

echo ""
echo "Все сервисы запущены!"
echo ""
echo "Статус сервисов:"
sudo docker-compose ps
echo ""
echo "Playground сервер запущен. PID: $(cat server.pid)"
echo ""
echo "Веб-интерфейс доступен по адресу: http://localhost:8080/"
echo "API документация:"
echo "  - Auth service: http://localhost:3001/docs"
echo "  - User service: http://localhost:3002/docs"
echo "  - Media service: http://localhost:3003/docs"
echo "  - Blog service: http://localhost:3004/docs"
echo ""
echo "Для остановки всех сервисов используйте команду:"
echo "sudo docker-compose down"
echo "И остановите playground сервер:"
echo "kill $(cat server.pid)"