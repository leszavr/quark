# Dockerfile for Quark UI (Next.js 15, React 19, TypeScript, Chakra UI, Tailwind CSS)

# 1. Use official Node.js image
FROM node:20-alpine AS builder

# 2. Set working directory
WORKDIR /app

# 3. Install dependencies
COPY package*.json ./
RUN npm install --frozen-lockfile

# 4. Copy source code
COPY . .

# 5. Build Next.js app
RUN npm run build

# 6. Production image
FROM node:20-alpine AS runner
WORKDIR /app

# 7. Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev --frozen-lockfile

# 8. Copy built files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 9. Expose port 3101
EXPOSE 3101

# 10. Set port and start Next.js app
ENV PORT=3101
CMD ["npm", "start"]