# Multi-stage build для оптимизации размера образа
FROM node:20-alpine AS builder

# Метаданные
LABEL org.opencontainers.image.title="Quark Platform UI"
LABEL org.opencontainers.image.description="Modular Admin Console for Quark Platform"
LABEL org.opencontainers.image.version="1.0.0"

# Рабочая директория
WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая dev для сборки)
RUN npm ci --silent

# Копируем исходный код
COPY . .

# Собираем приложение для продакшена
RUN npm run build

# Production stage
FROM nginx:alpine

# Создаем пользователя quark для безопасности
RUN addgroup -g 1001 -S quark && \
    adduser -S quark -u 1001

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Создаем конфигурацию Nginx для SPA
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 3100;' >> /etc/nginx/conf.d/default.conf && \
    echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    index index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '    location /health {' >> /etc/nginx/conf.d/default.conf && \
    echo '        access_log off;' >> /etc/nginx/conf.d/default.conf && \
    echo '        return 200 "healthy\n";' >> /etc/nginx/conf.d/default.conf && \
    echo '        add_header Content-Type text/plain;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

# Настраиваем права доступа
RUN chown -R quark:quark /usr/share/nginx/html && \
    chown -R quark:quark /var/cache/nginx && \
    chown -R quark:quark /var/log/nginx && \
    chown -R quark:quark /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R quark:quark /var/run/nginx.pid

# Переключаемся на пользователя quark
USER quark

# Экспозируем порт
EXPOSE 3100

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3100/health || exit 1

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]
