# syntax=docker/dockerfile:1.4
# Quark UI - Next.js 13 + React 18 + TypeScript
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@latest

# --- Builder stage ---
FROM base AS builder

# Build argument для registry с fallback на npmjs.org
ARG NPM_REGISTRY=https://registry.npmjs.org
ENV NPM_CONFIG_REGISTRY=${NPM_REGISTRY}

# Копируем конфигурацию workspace
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY infra/quark-ui/package.json ./infra/quark-ui/

# BuildKit cache mount для pnpm store
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Копируем исходники quark-ui
COPY infra/quark-ui ./infra/quark-ui

# Собираем Next.js приложение
WORKDIR /app/infra/quark-ui
RUN pnpm run build

# --- Production stage ---
FROM base AS production
WORKDIR /app/infra/quark-ui

# Build argument для registry (повторно объявляем для production stage)
ARG NPM_REGISTRY=https://registry.npmjs.org
ENV NPM_CONFIG_REGISTRY=${NPM_REGISTRY}

# Копируем package.json
COPY --from=builder /app/infra/quark-ui/package.json ./

# Копируем workspace конфигурацию
COPY --from=builder /app/pnpm-workspace.yaml /app/
COPY --from=builder /app/pnpm-lock.yaml /app/
COPY --from=builder /app/package.json /app/

# Устанавливаем prod dependencies с кешированием
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    cd /app && \
    pnpm install --prod --frozen-lockfile && \
    cd /app/infra/quark-ui

# Копируем собранное Next.js приложение
COPY --from=builder /app/infra/quark-ui/.next ./.next
COPY --from=builder /app/infra/quark-ui/public ./public

# Открываем порт
EXPOSE 3101

# Environment
ENV PORT=3101
ENV NODE_ENV=production

# Запускаем Next.js
CMD ["pnpm", "start"]
