# Stage 1: Build
FROM node:22-slim AS build

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config and lockfile first for better caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig*.json ./

# Copy all package.json files to resolve workspace dependencies
COPY lib/ lib/
COPY scripts/ scripts/
COPY artifacts/ artifacts/

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install --no-frozen-lockfile

# Copy remaining source files
COPY attached_assets/ attached_assets/

# Build the halyoon landing page
RUN PORT=3000 BASE_PATH="/" pnpm --filter @workspace/halyoon run build

# Stage 2: Serve with Caddy
FROM caddy:2-alpine

COPY --from=build /app/artifacts/halyoon/dist/public /srv

COPY <<'EOF' /etc/caddy/Caddyfile
:{$PORT:3000}

root * /srv
file_server

try_files {path} /index.html

header {
    X-Content-Type-Options nosniff
    X-Frame-Options DENY
    Referrer-Policy strict-origin-when-cross-origin
}
EOF

EXPOSE 3000
