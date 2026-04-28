# Mio SLOWFIRE 发版检查清单

> 每次部署前必须逐项确认。任何一项不通过，禁止发版。

## 一、本地检查（部署前）

- [ ] **TypeScript 编译通过**
  ```bash
  npm run build
  ```
  必须零报错、零 warning。

- [ ] **后端模块可正常加载**
  ```bash
  node -e "import('./server/db.mjs').then(() => console.log('✓ db.mjs')).catch(e => { console.error('✗', e.message); process.exit(1) })"
  node -e "import('./server/index.mjs').then(() => console.log('✓ index.mjs')).catch(e => { console.error('✗', e.message); process.exit(1) })"
  ```

- [ ] **关键 API 路由存在**
  检查 `api-handler.mjs` 中新增的路由是否已注册。

- [ ] **数据库变更安全**
  如果修改了表结构，确认使用 `ensureColumn()` 而非破坏性 ALTER。
  确认旧数据不会被新字段的默认值破坏。

## 二、部署后验证（5 分钟内）

- [ ] **容器正常启动**
  ```bash
  ssh root@8.133.194.58 "docker ps | grep mio-bakery"
  ```
  Status 必须为 `Up`，不能是 `Restarting`。

- [ ] **Bootstrap API 正常**
  ```bash
  curl -s http://8.133.194.58/api/bootstrap | head -c 200
  ```
  必须返回 JSON，不能 500/404。

- [ ] **登录 API 正常**
  ```bash
  curl -s -X POST http://8.133.194.58/api/admin/login \
    -H "Content-Type: application/json" \
    -d '{"username":"1","password":"1"}'
  ```
  必须返回 `{"token":...,"message":"登录成功"}`。

- [ ] **容器日志无错误**
  ```bash
  ssh root@8.133.194.58 "docker logs mio-bakery --tail 20"
  ```
  不能有 `SyntaxError`、`TypeError`、`ReferenceError`。

- [ ] **前端页面可访问**
  浏览器打开 http://8.133.194.58/ 和 /admin，确认无白屏、无报错。

## 三、回滚预案

如果部署后验证失败：

1. **立即回滚后端**：
   ```bash
   ssh root@8.133.194.58 "docker cp /app/server-backup/. mio-bakery:/app/server/ && docker restart mio-bakery"
   ```

2. **立即回滚前端**：
   ```bash
   ssh root@8.133.194.58 "docker cp /app/dist-backup/. mio-bakery:/app/dist/ && docker restart mio-bakery"
   ```

3. **记录故障原因**，修复后重新走完整清单。
