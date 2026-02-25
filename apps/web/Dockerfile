# Build context: repo root (docker build -f apps/web/Dockerfile .)
FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json
RUN pnpm install --frozen-lockfile

FROM base AS builder
ARG SOCIAL_API_ORIGIN
ARG GAME_API_ORIGIN
ARG STORAGE_PUBLIC_BASE_URL
ARG NODE_OPTIONS
ENV SOCIAL_API_ORIGIN=${SOCIAL_API_ORIGIN}
ENV GAME_API_ORIGIN=${GAME_API_ORIGIN}
ENV STORAGE_PUBLIC_BASE_URL=${STORAGE_PUBLIC_BASE_URL}
ENV NODE_OPTIONS=${NODE_OPTIONS}
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web ./apps/web
RUN pnpm -C apps/web build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 8000
ENV PORT=8000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "apps/web/server.js"]
