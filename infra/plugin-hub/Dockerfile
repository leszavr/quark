# Multi-stage build для оптимизации размера образа
FROM node:20-alpine AS builder

WORKDIR /app

# Обновляем npm до последней версии - ЗОЛОТОЕ ПРАВИЛО
RUN npm install -g npm@11.6.1

# Копируем package files
COPY package*.json ./
RUN npm ci --omit=dev

# Копируем исходный код и конфигурацию
COPY tsconfig.json ./
# Копируем весь исходный код включая middleware
COPY src/ ./src/

# Устанавливаем dev зависимости для сборки
RUN npm ci
RUN npm run build

# Production образ
FROM node:20-alpine AS production

WORKDIR /app

# Обновляем npm до последней версии - ЗОЛОТОЕ ПРАВИЛО
RUN npm install -g npm@11.6.1

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S quark -u 1001

# Копируем package files и устанавливаем только production зависимости
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

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
