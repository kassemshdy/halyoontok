FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate

FROM base AS deps
WORKDIR /app
COPY frontend/pnpm-workspace.yaml frontend/package.json frontend/pnpm-lock.yaml ./
COPY frontend/apps/web/package.json ./apps/web/
COPY frontend/packages/shared-types/package.json ./packages/shared-types/
COPY frontend/packages/api-client/package.json ./packages/api-client/
COPY frontend/packages/constants/package.json ./packages/constants/
COPY frontend/packages/i18n/package.json ./packages/i18n/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ ./
RUN pnpm --filter @halyoontok/web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs
EXPOSE 3001
ENV PORT=3001
CMD ["node", "server.js"]
