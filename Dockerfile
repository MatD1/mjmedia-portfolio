# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
WORKDIR /app

# Install OS deps needed by Prisma, Next.js, and Sharp (image processing)
# vips-dev includes headers needed for sharp to build from source
# libheif-dev provides HEIC/HEIF support for sharp (from edge repo)
# python3, make, g++ are build tools needed by node-gyp
RUN apk add --no-cache libc6-compat openssl vips-dev python3 make g++ && \
    apk add --no-cache libheif-dev --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community

# ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma
# Install all dependencies (dev + prod) for the build
# Force sharp to build from source with HEIF support
ENV npm_config_build_from_source=true
ENV npm_config_sharp_binary_host=""
ENV npm_config_sharp_libvips_binary_host=""
# Install dependencies
# Note: npm_config_build_from_source may not work reliably, so we'll try rebuilding after
RUN npm ci
# Verify sharp is installed
RUN test -d node_modules/sharp || (echo "ERROR: sharp not installed" && exit 1)
# Attempt to rebuild sharp with HEIF support (optional - won't fail build if it doesn't work)
RUN (cd node_modules/sharp && npm run install 2>&1 | head -20) || true

# ---------------------------------------------------------------------------
FROM base AS builder
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=1
ENV SKIP_DB_CONNECT=1
ARG DUMMY_DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/postgres"
ENV DATABASE_URL=$DUMMY_DATABASE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client with correct binary for Alpine
RUN npx prisma generate

# Build Next.js (standalone mode bundles dependencies)
RUN npm run build

# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

# Install runtime deps for Sharp image processing (including HEIC/HEIF support)
RUN apk add --no-cache libc6-compat vips && \
    apk add --no-cache libheif --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone build (includes node_modules and server.js)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Explicitly copy Prisma engine binaries (required for Alpine Linux)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Copy the prisma schema (needed for migrations if run at startup)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

# Use the standalone server directly (not npm run start)
CMD ["node", "server.js"]

