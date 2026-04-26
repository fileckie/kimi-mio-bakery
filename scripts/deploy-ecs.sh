#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ -f ".env.production" ]; then
  set -a
  # shellcheck disable=SC1091
  source ".env.production"
  set +a
fi

ECS_HOST="${ECS_HOST:-8.133.194.58}"
ECS_USER="${ECS_USER:-root}"
REMOTE_DIR="${REMOTE_DIR:-/opt/mio-bakery}"
APP_NAME="${APP_NAME:-mio-bakery}"
APP_PORT="${APP_PORT:-8787}"
PUBLIC_URL="${PUBLIC_URL:-http://${ECS_HOST}}"

ARCHIVE="/tmp/${APP_NAME}-deploy-$(date +%Y%m%d%H%M%S).tgz"
REMOTE_ARCHIVE="/tmp/${APP_NAME}-deploy.tgz"

echo "1/5 本地检查并构建..."
npm run build

echo "2/5 打包项目代码..."
tar \
  --exclude="./node_modules" \
  --exclude="./dist" \
  --exclude="./data" \
  --exclude="./.git" \
  --exclude="./.vercel" \
  --exclude="./screenshots" \
  --exclude="./*.tgz" \
  -czf "$ARCHIVE" .

echo "3/5 上传到阿里云 ECS..."
scp "$ARCHIVE" "${ECS_USER}@${ECS_HOST}:${REMOTE_ARCHIVE}"

echo "4/5 在服务器构建并重启容器..."
ssh "${ECS_USER}@${ECS_HOST}" "APP_NAME='${APP_NAME}' APP_PORT='${APP_PORT}' REMOTE_DIR='${REMOTE_DIR}' REMOTE_ARCHIVE='${REMOTE_ARCHIVE}' bash -s" <<'REMOTE'
set -euo pipefail

mkdir -p "$REMOTE_DIR"
tar -xzf "$REMOTE_ARCHIVE" -C "$REMOTE_DIR"
cd "$REMOTE_DIR"

docker build -t "$APP_NAME" .
docker rm -f "$APP_NAME" >/dev/null 2>&1 || true
mkdir -p "$REMOTE_DIR/data"
docker run -d \
  --name "$APP_NAME" \
  --restart unless-stopped \
  -p "$APP_PORT:8787" \
  -v "$REMOTE_DIR/data:/app/data" \
  "$APP_NAME"

curl -fsS "http://127.0.0.1:${APP_PORT}/api/bootstrap" >/dev/null
REMOTE

rm -f "$ARCHIVE"

echo "5/5 发布完成："
echo "顾客端：${PUBLIC_URL}"
echo "后台：${PUBLIC_URL}/admin"
echo "接口检查：${PUBLIC_URL}/api/bootstrap"
