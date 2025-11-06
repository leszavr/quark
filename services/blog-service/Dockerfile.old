# syntax=docker/dockerfile:1.4
# Multi-stage build для Blog Service в pnpm workspace
FROM node:20-alpine AS builder

WORKDIR /workspace

# Устанавливаем pnpm
RUN npm install -g pnpm@latest

# Копируем workspace конфигурацию
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc* ./

# Копируем все package.json файлы для правильного разрешения зависимостей workspace
COPY services/blog-service/package.json ./services/blog-service/
COPY infra/*/package.json ./infra/

# Устанавливаем ВСЕ зависимости workspace (это важно для pnpm workspaces!)
RUN pnpm install --no-frozen-lockfile || pnpm install

# Копируем исходники blog-service
COPY services/blog-service ./services/blog-service

# Собираем blog-service
WORKDIR /workspace/services/blog-service
RUN pnpm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Копируем package.json для metadata
COPY --from=builder /workspace/services/blog-service/package.json ./

# Копируем node_modules из workspace root (pnpm workspace хранит все зависимости там)
COPY --from=builder /workspace/node_modules ./node_modules

# Fix: создаём отсутствующие симлинки для зависимостей blog-service
# pnpm workspace иногда не создаёт симлинки для всех зависимостей
WORKDIR /app/node_modules
RUN if [ ! -e drizzle-zod ] && [ -d .pnpm ]; then \
        DRIZZLE_ZOD_PATH=$(find .pnpm -maxdepth 1 -name "drizzle-zod@*" -type d | head -1); \
        if [ -n "$DRIZZLE_ZOD_PATH" ]; then \
            ln -sf "$DRIZZLE_ZOD_PATH/node_modules/drizzle-zod" drizzle-zod; \
        fi; \
    fi

WORKDIR /app

# Копируем собранное приложение из builder
COPY --from=builder /workspace/services/blog-service/dist ./dist
COPY --from=builder /workspace/services/blog-service/server ./server
COPY --from=builder /workspace/services/blog-service/shared ./shared
COPY --from=builder /workspace/services/blog-service/module-manifest.yaml ./module-manifest.yaml

# Копируем Drizzle конфигурацию для миграций
COPY --from=builder /workspace/services/blog-service/drizzle.config.ts ./

# Создаем директорию для uploads
RUN mkdir -p uploads

# Открываем порт
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3004/api/health || exit 1

# Запускаем приложение
CMD ["node", "dist/index.prod.js"]