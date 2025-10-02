# Multi-stage build для Blog Service (Interface)
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем клиент и сервер
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Копируем только production зависимости
COPY package*.json ./
RUN npm ci --only=production

# Копируем собранное приложение
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

# Копируем Drizzle конфигурацию для миграций
COPY drizzle.config.ts ./

# Создаем директорию для uploads
RUN mkdir -p uploads

# Открываем порт
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3004/api/health || exit 1

# Запускаем приложение
CMD ["node", "server/index.js"]