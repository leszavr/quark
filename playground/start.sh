#!/bin/bash
cd /var/www/quark/playground
echo "Запуск интерфейса на http://localhost:8080"
python3 -m http.server 8080