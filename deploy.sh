#!/bin/bash
# Mio SLOWFIRE 一键部署脚本
# 用法：./deploy.sh [变更说明]

set -e

SERVER="root@8.133.194.58"
CONTAINER="mio-bakery"
REMOTE_DIR="/root/mio-dist"
CHANGELOG="CHANGELOG.md"

# 生成变更日志条目
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
GIT_MSG=$(git log -1 --pretty=%B 2>/dev/null | head -1 || echo "手动部署")
DEPLOY_NOTE="${1:-$GIT_MSG}"

# 检测未提交的变更
UNCOMMITTED=$(git status --short 2>/dev/null | wc -l | tr -d ' ')
if [ "$UNCOMMITTED" -gt 0 ]; then
  CHANGED_FILES=$(git status --short 2>/dev/null | awk '{print $2}' | tr '\n' ' ')
  DIFF_STAT=$(git diff --shortstat 2>/dev/null | tr -d '\n')
  DEPLOY_NOTE="${DEPLOY_NOTE}（含 ${UNCOMMITTED} 个未提交文件${DIFF_STAT:+，$DIFF_STAT}）"
fi

LOG_ENTRY="## ${TIMESTAMP}

- **Commit**: \`${GIT_HASH}\`
- **变更**: ${DEPLOY_NOTE}
- **文件**: ${CHANGED_FILES:-无未提交变更}

"

# 本地写日志
if [ -f "$CHANGELOG" ]; then
  echo "$LOG_ENTRY" | cat - "$CHANGELOG" > /tmp/changelog.tmp && mv /tmp/changelog.tmp "$CHANGELOG"
else
  echo -e "# Mio SLOWFIRE 部署日志\n\n${LOG_ENTRY}" > "$CHANGELOG"
fi
echo "📝 变更已记录到 ${CHANGELOG}"

echo "🍞 开始构建..."
npm run build

echo "📦 上传前端到服务器..."
scp -r dist/* "$SERVER:$REMOTE_DIR/"

echo "📦 上传后端到服务器..."
scp -r server/* "$SERVER:$REMOTE_DIR-server/"

echo "📋 上传变更日志..."
scp "$CHANGELOG" "$SERVER:/root/CHANGELOG.md" 2>/dev/null || true

echo "🚀 部署到容器..."
ssh "$SERVER" "
  echo '清理旧前端资源...'
  docker exec $CONTAINER bash -c 'rm -f /app/dist/assets/index-*.js /app/dist/assets/index-*.css /app/dist/index.html'
  
  echo '复制新前端文件...'
  docker cp $REMOTE_DIR/. $CONTAINER:/app/dist/
  
  echo '复制新后端文件...'
  docker cp $REMOTE_DIR-server/. $CONTAINER:/app/server/
  
  echo '同步变更日志...'
  docker cp /root/CHANGELOG.md $CONTAINER:/app/CHANGELOG.md 2>/dev/null || true
  
  echo '重启容器...'
  docker restart $CONTAINER
  
  echo '✅ 部署完成'
"

echo ""
echo "📝 变更: ${DEPLOY_NOTE}"
echo "🎉 部署成功: http://8.133.194.58"
