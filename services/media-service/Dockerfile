FROM node:18 AS builder
WORKDIR /app
# Установка системных зависимостей для sharp
RUN apt-get update && apt-get install -y libvips-dev
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# Установка системных зависимостей для sharp
RUN apt-get update && apt-get install -y libvips-dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3003
CMD ["node", "dist/src/main"]