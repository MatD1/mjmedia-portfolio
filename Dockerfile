# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
WORKDIR /app

# Install OS deps needed by Prisma & Next
RUN apk add --no-cache libc6-compat openssl

FROM base AS deps
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
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Copy package.json (but skip postinstall by using --ignore-scripts)
COPY package.json package-lock.json* ./

# Copy prisma schema and the ALREADY GENERATED client from builder
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Install prod dependencies WITHOUT running postinstall (prisma generate)
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

# Copy built app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

CMD ["npm", "run", "start"]

