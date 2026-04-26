#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  🍞 Mio SLOWFIRE 自动部署流水线${NC}"
echo -e "${YELLOW}══════════════════════════════════════════════${NC}"

# ── Step 1: 本地检查 ──────────────────────────
echo ""
echo -e "${BLUE}Step 1/5${NC} 本地检查并构建..."
npm run build >/dev/null 2>&1
echo -e "   ${GREEN}✓ 构建通过${NC}"

# ── Step 2: Git 自动提交 ──────────────────────
echo ""
echo -e "${BLUE}Step 2/5${NC} Git 自动提交..."
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "deploy: $(date '+%Y-%m-%d %H:%M:%S') 自动部署"
    echo -e "   ${GREEN}✓ 已自动提交${NC}"
else
    echo -e "   ${GREEN}✓ 工作区干净，跳过提交${NC}"
fi

# ── Step 3: 推送到 GitHub ─────────────────────
echo ""
echo -e "${BLUE}Step 3/5${NC} 推送到 GitHub..."
git push origin main
echo -e "   ${GREEN}✓ 已推送${NC}"

# ── Step 4: 部署到阿里云 ECS ──────────────────
echo ""
echo -e "${BLUE}Step 4/5${NC} 部署到阿里云 ECS..."
bash scripts/deploy-ecs.sh

# ── Step 5: 完成 ──────────────────────────────
echo ""
echo -e "${YELLOW}══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🎉 全自动部署完成！${NC}"
echo -e "${YELLOW}══════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BLUE}GitHub${NC}  https://github.com/fileckie/kimi-mio-bakery"
echo -e "  ${BLUE}顾客端${NC}  http://8.133.194.58"
echo -e "  ${BLUE}后台${NC}    http://8.133.194.58/admin"
echo ""
