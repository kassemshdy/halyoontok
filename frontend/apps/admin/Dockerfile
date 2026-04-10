FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate

FROM base AS deps
WORKDIR /app
COPY frontend/pnpm-workspace.yaml frontend/package.json ./
COPY frontend/pnpm-lock.yaml ./
COPY frontend/apps/admin/package.json ./apps/admin/package.json
COPY frontend/packages/shared-types/package.json ./packages/shared-types/package.json
COPY frontend/packages/api-client/package.json ./packages/api-client/package.json
COPY frontend/packages/constants/package.json ./packages/constants/package.json
COPY frontend/packages/i18n/package.json ./packages/i18n/package.json
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
RUN cp -r /app/apps/admin/node_modules ./apps/admin/node_modules 2>/dev/null || true
COPY frontend/ ./
RUN pnpm --filter @halyoontok/admin build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
RUN mkdir -p ./apps/admin/public
COPY --from=builder /app/apps/admin/public/ ./apps/admin/public/

USER nextjs
ENV PORT=3000
EXPOSE 3000
CMD ["node", "apps/admin/server.js"]
