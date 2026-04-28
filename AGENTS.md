# Mio SLOWFIRE — Agent 开发指南

## 技术栈

- 前端：React 18 + Vite + TailwindCSS + Zustand
- 后端：Node.js + `node:sqlite` (实验性模块)
- 部署：Docker on 阿里云 ECS

## 部署规范（强制）

每次发版前必须完成 `DEPLOY_CHECKLIST.md` 中的所有检查项。

核心原则：**先测试，后发布。任何一步失败，禁止发版。**

### 后端代码部署陷阱

`deploy.sh` 同时部署前后端，但历史上曾因只部署前端而导致后端代码失效。

- **前端文件**：`dist/` → 容器 `/app/dist/`
- **后端文件**：`server/` → 容器 `/app/server/`
- **重启**：`docker restart mio-bakery`

### 后端代码修改后必须验证

```bash
# 1. 模块能否正常加载
node -e "import('./server/db.mjs').then(() => console.log('OK')).catch(e => { console.error(e.message); process.exit(1) })"

# 2. 入口能否正常启动（监听端口前先杀掉）
node -e "import('./server/index.mjs').then(() => console.log('OK')).catch(e => { console.error(e.message); process.exit(1) })"
```

### 数据库变更规范

- **只允许添加列**，使用 `ensureColumn()` 函数
- **禁止删除列、重命名列、修改列类型**
- 新增列必须有合理的默认值
- 新增表必须在 `initDb()` 的 `CREATE TABLE IF NOT EXISTS` 中声明

### 日期安全（关键）

所有 `createdAt` 字段使用 `toLocaleString("zh-CN", {month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit"})` 生成 `"04/27 14:30"` 格式。

**绝对禁止**直接 `new Date("04/27 14:30").toISOString()`，会抛 `RangeError`。

正确做法：
```ts
const d = new Date(dateStr);
if (isNaN(d.getTime())) return "";
return d.toISOString().slice(0, 10);
```

## 项目结构

```
src/
  components/
    customer/     # 顾客端（C端）
    admin/        # 管理后台
    ui/           # 通用组件
  stores/         # Zustand 状态管理
  types/          # TypeScript 类型
  lib/            # API 封装 + 工具函数
server/
  db.mjs          # SQLite 数据库层
  api-handler.mjs # Express-style 路由
  index.mjs       # HTTP 入口
  backup.mjs      # 数据库备份
  seed.mjs        # 种子数据
```

## 登录信息

- 后台：`http://8.133.194.58/admin`
- 账号密码：`1` / `1`
- POS：`http://8.133.194.58/admin/pos`
