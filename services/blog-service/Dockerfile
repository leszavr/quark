# syntax=docker/dockerfile:1.4
# Multi-stage build для Blog Service (Interface)
FROM node:20-alpine AS builder

WORKDIR /app

# Обновляем npm до последней версии - ЗОЛОТОЕ ПРАВИЛО
RUN npm install -g npm@11.6.1

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости для сборки
RUN npm install

# Копируем исходный код
COPY . .

# Собираем клиент и сервер
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Обновляем npm до последней версии - ЗОЛОТОЕ ПРАВИЛО
RUN npm install -g npm@11.6.1

# Копируем только production зависимости
COPY package*.json ./
RUN npm install --omit=dev --omit=dev

# Копируем собранное приложение
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/module-manifest.yaml ./module-manifest.yaml

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
CMD ["node", "dist/index.prod.js"]