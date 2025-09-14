# Multi-stage build для оптимизации размера образа
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package files
COPY package*.json ./
RUN npm ci --only=production

# Копируем исходный код и конфигурацию
COPY tsconfig.json ./
# Копируем простую версию
COPY src/simple-index.ts ./src/index.ts

# Устанавливаем dev зависимости для сборки
RUN npm ci
RUN npm run build

# Production образ
FROM node:18-alpine AS production

WORKDIR /app

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S quark -u 1001

# Копируем package files и устанавливаем только production зависимости
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Копируем собранное приложение
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Меняем владельца файлов
RUN chown -R quark:nodejs /app
USER quark

# Настройки
EXPOSE 3000
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Запуск
CMD ["node", "dist/index.js"]
