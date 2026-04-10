#!/bin/bash
# Run Playwright E2E tests locally with a test database.
# Usage: ./scripts/run_e2e.sh
#
# Prerequisites: Postgres + Redis running, backend venv activated, frontend installed

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$BACKEND_DIR/../frontend"
VENV="$BACKEND_DIR/.venv/bin/python3"

export POSTGRES_HOST=${POSTGRES_HOST:-localhost}
export REDIS_HOST=${REDIS_HOST:-localhost}
export TEST_MODE=true
export TEST_DATABASE_URL="postgresql://halyoontok:halyoontok@${POSTGRES_HOST}:5432/halyoontok_test"

echo "=== Creating test database ==="
PGPASSWORD=halyoontok psql -h $POSTGRES_HOST -U halyoontok -d halyoontok -c "CREATE DATABASE halyoontok_test;" 2>/dev/null || true

echo "=== Running migrations on test DB ==="
cd "$BACKEND_DIR"
$VENV -m alembic upgrade head

echo "=== Starting backend services (test DB) ==="
cd "$BACKEND_DIR/admin-api" && $VENV -m uvicorn app.main:app --host 0.0.0.0 --port 8080 &
ADMIN_PID=$!
cd "$BACKEND_DIR/front-api" && $VENV -m uvicorn app.main:app --host 0.0.0.0 --port 8081 &
FRONT_PID=$!
sleep 3

echo "=== Starting admin Next.js ==="
cd "$FRONTEND_DIR"
pnpm --filter @halyoontok/admin dev &
WEB_PID=$!
sleep 8

echo "=== Running Playwright tests ==="
cd "$FRONTEND_DIR/apps/admin"
FRONT_API_URL=http://localhost:8081 pnpm exec playwright test --project admin
TEST_EXIT=$?

echo "=== Cleaning up ==="
kill $ADMIN_PID $FRONT_PID $WEB_PID 2>/dev/null

echo "=== Dropping test database ==="
PGPASSWORD=halyoontok psql -h $POSTGRES_HOST -U halyoontok -d halyoontok -c "DROP DATABASE IF EXISTS halyoontok_test;" 2>/dev/null || true

exit $TEST_EXIT
