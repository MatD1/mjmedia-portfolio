# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install OS deps needed by Prisma & Next
RUN apk add --no-cache libc6-compat python3 make g++ openssl

FROM base AS deps
COPY package.json package-lock.json* ./
# Install all dependencies (dev + prod) for the build
RUN npm install

FROM base AS builder
ENV SKIP_ENV_VALIDATION=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV PORT=3000
EXPOSE 3000

# Install only prod dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

CMD ["npm", "run", "start"]

