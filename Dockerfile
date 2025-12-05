# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install OS deps needed by Prisma & Next
RUN apk add --no-cache libc6-compat python3 make g++ openssl

FROM base AS deps
ENV NODE_ENV=development
COPY package.json package-lock.json* ./
COPY prisma ./prisma
# Install all dependencies (dev + prod) for the build
RUN npm install

FROM base AS builder
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=1
ENV SKIP_DB_CONNECT=1
ARG DUMMY_DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/postgres"
ENV DATABASE_URL=$DUMMY_DATABASE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV PORT=3000
EXPOSE 3000

# Install only prod dependencies
COPY package.json package-lock.json* ./
COPY --from=builder /app/prisma ./prisma
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

CMD ["npm", "run", "start"]

