# syntax=docker/dockerfile:1.4
# Blog Service - Express + Drizzle ORM + TypeScript
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@latest

# --- Builder stage ---
FROM base AS builder

# Build argument для registry с fallback на npmjs.org
ARG NPM_REGISTRY=https://registry.npmjs.org
ENV NPM_CONFIG_REGISTRY=${NPM_REGISTRY}

# Копируем конфигурацию workspace
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc* ./
COPY services/blog-service/package.json ./services/blog-service/

# BuildKit cache mount для pnpm store
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Копируем исходники blog-service
COPY services/blog-service ./services/blog-service

# Собираем приложение
WORKDIR /app/services/blog-service
RUN pnpm run build

# --- Production stage ---
FROM base AS production
WORKDIR /app/services/blog-service

# Build argument для registry (повторно объявляем для production stage)
ARG NPM_REGISTRY=https://registry.npmjs.org
ENV NPM_CONFIG_REGISTRY=${NPM_REGISTRY}

# Копируем package.json
COPY --from=builder /app/services/blog-service/package.json ./

# Копируем workspace конфигурацию
COPY --from=builder /app/pnpm-workspace.yaml /app/
COPY --from=builder /app/pnpm-lock.yaml /app/
COPY --from=builder /app/package.json /app/

# Устанавливаем prod dependencies с кешированием
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    cd /app && \
    pnpm install --prod --frozen-lockfile && \
    cd /app/services/blog-service

# Копируем собранное приложение и необходимые runtime файлы
COPY --from=builder /app/services/blog-service/dist ./dist
COPY --from=builder /app/services/blog-service/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/services/blog-service/module-manifest.yaml ./module-manifest.yaml

# Создаем директорию для uploads
RUN mkdir -p uploads

# Открываем порт
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3004/api/health || exit 1

# Запускаем приложение
CMD ["node", "dist/index.prod.js"]
