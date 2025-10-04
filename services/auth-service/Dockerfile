# syntax=docker/dockerfile:1.4
# Multi-stage build for production
FROM node:20-alpine AS builder

WORKDIR /app

# Обновляем npm до последней версии - ЗОЛОТОЕ ПРАВИЛО
RUN npm install -g npm@11.6.1

# Copy package files
COPY package*.json ./

# Install dependencies for production first
RUN npm ci --omit=dev

# Копируем исходный код
COPY tsconfig.json ./
COPY src/ ./src/

# Устанавливаем dev зависимости для сборки
RUN npm ci

# Собираем приложение
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Обновляем npm до последней версии - ЗОЛОТОЕ ПРАВИЛО
RUN npm install -g npm@11.6.1

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S quark -u 1001

# Копируем package files
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --omit=dev

# Копируем собранное приложение
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Меняем владельца файлов
RUN chown -R quark:nodejs /app

# Переключаемся на пользователя
USER quark

# Открываем порт
EXPOSE 3001

# Устанавливаем environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:3001/auth/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Запускаем приложение
CMD ["node", "dist/main.js"]
