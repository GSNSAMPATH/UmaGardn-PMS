# 1️⃣ Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy only package files first (better cache)
COPY package.json package-lock.json* ./

# Use clean install + retries
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Copy rest of source
COPY . .

# Build Next.js
RUN npm run build

# 2️⃣ Runtime stage
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000
CMD ["npm", "start"]
