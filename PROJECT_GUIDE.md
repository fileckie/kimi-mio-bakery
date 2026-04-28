# Mio SLOWFIRE — 窑烤酸种面包订购系统 · 项目说明书

> 本文档供跨会话接续开发使用。路径：`/Users/leckie/kimi2.6/kimi-mio-bakery/PROJECT_GUIDE.md`

---

## 一、项目概述

**Mio SLOWFIRE** 是一个面向窑烤酸种面包品牌的全栈订购系统，支持：

- **顾客端**：浏览面包、加入购物车、会员登录/注册、下单（自提/配送/快递）、订单查询
- **后台管理**：订单管理（Kanban + 列表双视图）、生产单管理、商品库存管理、会员管理、门店管理、设置管理
- **POS 收银**：现场快速下单
- **多门店**：总部 + 多个自提点，支持角色隔离视图

---

## 二、技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 4.5 |
| 样式 | TailwindCSS 3.4（自定义窑烤主题色） |
| 状态管理 | Zustand 5（4 个独立 store） |
| 图标 | Lucide React |
| 后端 | Node.js 原生 `http` + `node:sqlite` (DatabaseSync) |
| 数据库 | SQLite |
| 部署 | Docker + Aliyun ECS |
| 部署脚本 | `./deploy.sh`（本地 + 服务器双份 CHANGELOG） |

---

## 三、目录结构

```
kimi-mio-bakery/
├── deploy.sh                  # 一键部署脚本（本地 build → scp → docker restart）
├── CHANGELOG.md               # 部署日志（自动维护）
├── tailwind.config.js         # 主题色/字体/动画配置
├── package.json
│
├── src/
│   ├── App.tsx                # 根组件：路由分发 + 全局错误遮罩 + Toast
│   ├── main.tsx               # 入口（已移除 StrictMode）
│   │
│   ├── types/index.ts         # 全类型定义（见下方「类型系统」）
│   │
│   ├── lib/
│   │   ├── api.ts             # 前端 API 封装（所有 REST 接口）
│   │   └── utils.ts           # getStoreName, readImageFile, formatDate 等
│   │
│   ├── stores/
│   │   ├── appStore.ts        # 全局数据 + 路由 + 角色（bootstrap/closeBatch/createOrder）
│   │   ├── authStore.ts       # 顾客登录（localStorage persist）
│   │   ├── cartStore.ts       # 购物车状态（非持久化）
│   │   └── uiStore.ts         # UI 状态（toast/菜单/adminTab/滚动）
│   │
│   ├── components/
│   │   ├── admin/             # 后台组件
│   │   │   ├── AdminPage.tsx          # 后台主页面：标签页 + 角色切换 + 面板路由
│   │   │   ├── AdminDashboard.tsx     # 概览页：统计卡片 + 快速操作
│   │   │   ├── OrdersPanel.tsx        # 订单管理：Kanban/列表双视图 + 筛选 + 批量 + 打印
│   │   │   ├── OrderKanbanView.tsx    # Kanban 工作流视图（5 栏）
│   │   │   ├── ProductionPanel.tsx    # 生产页：窑烤单记录列表
│   │   │   ├── ProductsPanel.tsx      # 商品库存合并页：商品卡片 + 库存分配
│   │   │   ├── MembersPanel.tsx       # 会员管理
│   │   │   ├── SettingsPanel.tsx      # 设置页（拆分为子组件后的主文件）
│   │   │   ├── settings/              # 设置子组件（Phase 5 拆分）
│   │   │   │   ├── SaveButton.tsx
│   │   │   │   ├── BatchSettings.tsx
│   │   │   │   ├── OvenBatchesSettings.tsx
│   │   │   │   ├── PaymentSettings.tsx
│   │   │   │   ├── CopySettings.tsx
│   │   │   │   ├── PrintSettings.tsx
│   │   │   │   └── StoreSettings.tsx
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── PosTerminal.tsx        # POS 收银终端
│   │   │   ├── ProductionSheetPrint.tsx
│   │   │   ├── PickupSheetPrint.tsx
│   │   │   ├── InventoryPanel.tsx     # 原独立库存页（已合并到 ProductsPanel，可删除）
│   │   │   ├── ShippingPanel.tsx      # 发货管理
│   │   │   └── ChangelogDrawer.tsx
│   │   │
│   │   ├── customer/          # 顾客端组件
│   │   │   ├── CustomerPage.tsx       # 顾客端主页面（Simple Mode）
│   │   │   ├── ProductGrid.tsx        # 面包列表网格
│   │   │   ├── ProductCard.tsx        # 单个面包卡片（React.memo 优化）
│   │   │   ├── ProductDetailModal.tsx # 面包详情弹窗
│   │   │   ├── CheckoutPanel.tsx      # 结账面板
│   │   │   ├── MobileCheckout.tsx     # 移动端全屏结账
│   │   │   ├── HeroSection.tsx        # 首屏（PC 显示，移动端隐藏）
│   │   │   ├── FeatureEntrances.tsx   # 特色入口（PC 显示）
│   │   │   ├── OrderLookup.tsx        # 订单查询
│   │   │   ├── MyOrdersDrawer.tsx     # 我的订单抽屉
│   │   │   ├── OrderSuccessModal.tsx  # 下单成功弹窗
│   │   │   ├── CustomerHeader.tsx
│   │   │   └── StoreInfo.tsx
│   │   │
│   │   ├── ui/                # 通用 UI 组件
│   │   │   ├── Toast.tsx
│   │   │   ├── LoadingShell.tsx
│   │   │   ├── CountUp.tsx
│   │   │   ├── Countdown.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── DarkModeToggle.tsx
│   │   │   └── ...
│   │   │
│   │   └── SealStamp.tsx      # 印章组件
│   │
│   └── hooks/
│       └── useSwipe.ts
│
├── server/                      # 后端（Node.js，无框架）
│   ├── index.mjs                # HTTP 服务器入口 + 静态文件服务 + 定时任务
│   ├── api-handler.mjs          # REST API 路由分发（326 行）
│   ├── db.mjs                   # SQLite 数据库操作 + 表结构定义（931 行）
│   ├── seed.mjs                 # 种子数据
│   └── backup.mjs               # 数据库备份
│
├── data/                        # SQLite 数据库文件（gitignored）
├── dist/                        # Vite 构建输出（前端静态文件）
├── public/                      # 静态资源
└── scripts/                     # 部署脚本
```

---

## 四、前端架构

### 4.1 路由系统（无路由库，纯状态管理）

路由由 `appStore.route` 驱动，配合 `window.history.pushState`：

| URL 路径 | 对应组件 |
|----------|----------|
| `/` | `CustomerPage`（顾客端） |
| `/admin` | `AdminLogin` → `AdminPage`（后台） |
| `/admin/pos` | `AdminLogin` → `PosTerminal`（POS 收银） |

浏览器前进/后退通过 `popstate` 事件同步到 store。

### 4.2 角色系统

`appStore.activeRole: RoleId` 控制后台视角：

| RoleId | 说明 |
|--------|------|
| `hq` | 总部：看到所有订单、所有功能、设置页 |
| `store-a` ~ `store-d` | 门店：只看到自己门店的订单，隐藏设置页和导出 CSV |

`AdminPage.tsx` 中计算 `scopedOrders`：
```ts
const activeStoreId = activeRole === "hq" ? "store-a" : activeRole;
const scopedOrders = isHq
  ? orders
  : orders.filter((o) => o.pickupStoreId === activeStoreId || o.sourceStoreId === activeStoreId);
```

### 4.3 状态管理（4 个 Zustand Store）

**`useAppStore`** — 全局业务数据
- `products, stores, batchSale, inventory, orders, productionSheets, changelog`
- `route, activeRole, isLoading, error`
- Actions: `refreshData()`, `createOrder()`, `closeBatch()`, `refreshProductionSheets()`
- Setter: `setProducts`, `setStores`, `setBatchSale`, `setInventory`, `setOrders`, `setChangelog`

**`useAuthStore`** — 顾客认证（localStorage persist）
- `customer: Customer | null`
- `authenticate(name, phone)` — 无密码简化登录

**`useCartStore`** — 购物车（非持久化）
- `items: Record<productId, qty>`
- `pickupStoreId, sourceStoreId, deliveryMethod, paymentMethod, receiver, phone, address`
- Actions: `addItem`, `removeItem`, `updateQty`, `clearCart`, setter...

**`useUIStore`** — UI 状态
- `toasts, mobileMenuOpen, mobileCheckoutOpen, adminTab, scrolled`
- `addToast()`, `removeToast()`, `setAdminTab(tab)`

### 4.4 性能优化要点

- **Zustand 精确 selector**：所有组件必须使用 `useStore(s => s.field)`，禁止订阅整个 store
- **React.memo**: `ProductCard` 已包裹
- **useCallback**: 事件处理函数使用 `useCallback`
- **触摸节流**: `requestAnimationFrame` + `touchAction: "pan-y"`
- **图片懒加载**: `<img loading="lazy">`
- **SVG 简化**: `ProductVisual` 已精简

---

## 五、后端架构

### 5.1 服务器入口 (`server/index.mjs`)

- Node.js 原生 `createServer`，端口 `8787`
- `/api/*` → `api-handler.mjs`
- 其他 → 静态文件服务（`dist/` 目录，SPA fallback 到 `index.html`）
- 定时任务（每分钟检查）：
  - 03:00 自动数据库备份
  - 截单时间自动关闭批次并生成生产单

### 5.2 数据库 (`server/db.mjs`)

SQLite (`node:sqlite` / `DatabaseSync`)，表结构：

| 表名 | 说明 |
|------|------|
| `products` | 商品（id, name, category, price, isPublished, featured...） |
| `stores` | 门店（id, name, role, address, pickupOpen, sourceCode） |
| `batch_sales` | 批次销售设置（单条记录，id='current'） |
| `customers` | 顾客（id, name, phone, passwordHash, createdAt） |
| `inventory_allocations` | 库存分配（productId + storeId → allocated, sold） |
| `orders` | 订单（完整订单信息 + 物流字段） |
| `order_items` | 订单商品明细 |
| `production_sheets` | 生产单 |
| `production_sheet_items` | 生产单明细（db.mjs 中定义） |
| `changelog` | 更新日志（db.mjs 中定义） |

### 5.3 API 路由

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/bootstrap` | 获取全部初始数据 |
| POST | `/api/customers/authenticate` | 顾客认证（无密码） |
| POST | `/api/customers/register` | 注册 |
| POST | `/api/customers/login` | 登录 |
| GET | `/api/customers/:id/orders` | 顾客订单列表 |
| POST | `/api/orders` | 创建线上订单（检查 isOpen） |
| POST | `/api/admin/pos-orders` | 创建 POS 订单（免登录） |
| GET | `/api/orders/lookup?code=` | 订单查询 |
| POST | `/api/orders/:id/cancel` | 取消订单 |
| GET | `/api/admin/customers` | 顾客列表 |
| PATCH | `/api/admin/products/:id` | 更新商品 |
| POST | `/api/admin/products` | 创建商品 |
| PATCH | `/api/admin/stores/:id` | 更新门店 |
| POST | `/api/admin/stores` | 创建门店 |
| PATCH | `/api/admin/batch-sale` | 更新批次设置 |
| PATCH | `/api/admin/inventory` | 更新库存分配 |
| PATCH | `/api/admin/orders/:id/status` | 更新订单状态 |
| PATCH | `/api/admin/orders/:id/fulfillment` | 更新物流信息 |
| POST | `/api/admin/orders/batch-status` | 批量更新状态 |
| POST | `/api/admin/close-batch` | 截单并生成生产单 |
| GET | `/api/admin/production-sheets` | 生产单列表 |
| GET | `/api/admin/production-sheets/:id` | 生产单详情 |
| PATCH | `/api/admin/production-sheets/:id/status` | 更新生产单状态 |
| PATCH | `/api/admin/production-sheets/:id/items` | 更新生产单明细 |
| GET/POST | `/api/admin/backups` | 备份列表/创建 |
| GET/POST | `/api/admin/changelog` | 更新日志 |
| POST | `/api/admin/login` | 后台登录（账号密码均为 `1`） |

---

## 六、类型系统

核心类型在 `src/types/index.ts`：

```ts
type Category = "欧包/坚果" | "吐司" | "恰巴塔" | "贝果/海盐卷" | "软欧包";
type DeliveryMethod = "门店自提" | "本地配送" | "顺丰快递";
type PaymentMethod = "微信转账" | "微信支付" | "支付宝" | "到店付" | "现金";
type OrderType = "online" | "pos";
type OrderStatus = "待确认" | "待生产" | "待自提" | "待发货" | "已发货" | "已完成" | "已取消";
type Route = "/" | "/admin" | "/admin/pos";
type RoleId = "hq" | "store-a" | "store-b" | "store-c" | "store-d";
type StoreId = "store-a" | "store-b" | "store-c" | "store-d";
type AdminTab = "overview" | "orders" | "production" | "products" | "members" | "settings";
```

完整接口定义见 `src/types/index.ts`（Product, StoreLocation, OvenBatch, BatchSale, Customer, InventoryAllocation, InventoryMap, OrderItem, Order, BootstrapPayload, DashboardMetrics, ProductionSheet, ToastMessage, ChangelogEntry）。

---

## 七、Tailwind 主题色

```js
// 核心色值
ash:        "#FAF6F0"   // 页面背景
ash-deep:   "#F0E9E0"
clay:       "#E2D5C5"   // 边框/分隔线
ember:      "#E84A2E"   // 强调色/主按钮
kiln:       "#1E1712"   // 主文字色
wheat:      "#D4A853"   // 金色点缀
smoke:      "#7A6E62"   // 次要文字
border:     "#E2D5C5"
success:    "#15803D"

// 字体
font-brush:  "'Zhi Mang Xing'"   // 标题毛笔字
font-hand:   "'Long Cang'"        // 手写体提示
font-wenkai: "'LXGW WenKai'"      // 正文
```

自定义阴影：`shadow-soft`, `shadow-card`, `shadow-elevated`

---

## 八、已完成功能（按迭代 Phase）

### Phase 0: 基础功能
- [x] 顾客端浏览面包、购物车、会员系统、下单
- [x] 三种配送方式：门店自提、本地配送、顺丰快递
- [x] 后台订单管理（列表视图）
- [x] 生产单打印
- [x] 取货名单打印
- [x] POS 收银终端
- [x] 数据备份
- [x] 更新日志

### Phase 1: 标签页重排 + 概览页精简
- [x] 标签页顺序：概览 → 订单 → 生产 → 商品库存 → 会员 → 设置
- [x] 概览页精简为今日运营看板（统计卡片 + 快速操作）
- [x] 移除取货名单/备份/更新日志弹窗
- [x] 统计卡片点击跳转订单页

### Phase 2: 订单页 Kanban 工作流视图
- [x] `OrderKanbanView` 组件：5 栏（待确认/待生产/待自提/待发货/已完成）
- [x] OrdersPanel 双视图切换（工作流 / 列表）
- [x] 每栏显示数量 + 下一步操作按钮
- [x] 取货名单内嵌「待自提」栏
- [x] 快递单号填写内嵌「待发货」栏

### Phase 3: 生产页精简
- [x] 保留核心「窑烤单记录」+ 日期筛选

### Phase 4: 商品库存合并
- [x] `ProductsPanel` 每个商品卡片直接显示各门店库存输入框
- [x] 总部可编辑，门店只读
- [x] 原 `InventoryPanel` 功能已合并（该文件可安全删除）

### Phase 5: 设置页拆分
- [x] `SettingsPanel` 从 500 行拆分为 7 个独立组件
- [x] 子组件目录：`src/components/admin/settings/`
- [x] 主文件只负责状态管理与组合

### Phase 6: 角色视图优化
- [x] 订单页「导出 CSV」仅总部可见
- [x] 生产页门店视角显示只读提示
- [x] 设置页标签仅在 isHq 时显示

### 顾客端优化
- [x] 移动端性能急救（Zustand 精确 selector、React.memo、触摸节流）
- [x] 移动端首屏精简（HeroSection 压缩、Stagger 动画限制）
- [x] 移动端交互优化（全屏结账、全屏详情、AddButton 微弹动画）
- [x] Simple Mode：移动端隐藏非核心元素，直接显示面包列表
- [x] 顾客小票打印（80mm 热敏纸格式）
- [x] 「我的订单」桌面端修复（移除 `lg:hidden`）

---

## 九、关键文件职责速查

| 文件 | 职责 |
|------|------|
| `src/App.tsx` | 路由分发（/ → 顾客端, /admin → 后台, /admin/pos → POS） |
| `src/stores/appStore.ts` | 全局数据 + `refreshData()` bootstrap + `closeBatch()` + `createOrder()` |
| `src/stores/uiStore.ts` | `addToast()` + `setAdminTab()` 用于概览页跳转 |
| `src/lib/api.ts` | 所有 API 调用封装 |
| `src/components/admin/AdminPage.tsx` | 标签页导航 + `scopedOrders` 过滤 + 角色切换 |
| `src/components/admin/OrdersPanel.tsx` | 订单管理核心：双视图 + 筛选 + 批量 + 打印/小票/导出 |
| `src/components/admin/OrderKanbanView.tsx` | Kanban 工作流视图 |
| `src/components/admin/ProductsPanel.tsx` | 商品 + 库存合并管理 |
| `src/components/admin/SettingsPanel.tsx` | 设置页主文件（已拆分子组件） |
| `src/components/admin/ProductionPanel.tsx` | 窑烤单记录 |
| `src/components/customer/CustomerPage.tsx` | 顾客端主页面（Simple Mode） |
| `server/api-handler.mjs` | 所有 REST API 路由 |
| `server/db.mjs` | SQLite 数据库操作 |
| `server/index.mjs` | HTTP 服务器 + 静态文件 + 定时任务 |
| `deploy.sh` | 一键部署（自动记录 CHANGELOG） |

---

## 十、部署信息

### 服务器
- **IP**: `8.133.194.58`
- **容器**: Docker `mio-bakery`
- **前端路径**: 容器内 `/app/dist/`
- **后端路径**: 容器内 `/app/server/`

### 部署命令
```bash
# 自动取 git message 作为变更说明
./deploy.sh

# 手动指定变更说明
./deploy.sh "修复了某某问题"
```

部署脚本自动执行：
1. 生成 CHANGELOG.md 条目（含 commit hash、时间戳、未提交文件检测）
2. `npm run build`
3. scp 前端文件到服务器
4. scp 后端文件到服务器
5. docker cp 到容器 + docker restart

### 本地开发
```bash
npm run dev      # Vite 开发服务器
npm run api      # 后端 API 服务器
npm run build    # 生产构建（tsc + vite）
```

---

## 十一、开发规范

### 11.1 Zustand 使用规范
```tsx
// ✅ 正确：精确 selector
const items = useCartStore((s) => s.items);
const addItem = useCartStore((s) => s.addItem);

// ❌ 禁止：订阅整个 store
const store = useCartStore(); // 会导致不必要的重渲染
```

### 11.2 移动端/桌面端隔离
```tsx
// 移动端隐藏，PC 显示
<div className="hidden sm:block">...</div>

// 移动端显示，PC 隐藏
<div className="sm:hidden">...</div>
```

### 11.3 类型安全
- 所有组件 props 必须定义 interface
- 所有 API 返回类型必须在 `src/types/index.ts` 中定义
- `npm run build` 必须通过零 TypeScript 错误才能部署

### 11.4 后台登录
- 账号：`1`
- 密码：`1`
- 登录后 token 存入 `sessionStorage`（非持久化，关闭标签需重新登录）

---

## 十二、待办 / 后续可优化项

### 已知可改进
- [ ] `InventoryPanel.tsx` 已废弃（功能合并到 ProductsPanel），可删除文件及引用
- [ ] `OrderKanbanView.tsx` 中的「待自提」栏取货名单和「待发货」栏快递填写可进一步优化交互
- [ ] 生产单自动截单逻辑目前依赖服务器定时任务，可考虑前端手动触发兜底
- [ ] 顾客端会员系统目前无密码，可考虑增加可选密码

### 可能的新功能
- [ ] 订单搜索支持手机号模糊匹配
- [ ] 面包详情页增加「主理人故事」「原物料来源」等字段展示
- [ ] 多批次历史数据查询
- [ ] 门店业绩报表（按日/周/月统计）
- [ ] 微信小程序适配

---

## 十三、CHANGELOG 最新条目

查看最新部署记录：
```bash
cat /Users/leckie/kimi2.6/kimi-mio-bakery/CHANGELOG.md | head -20
```

---

*文档生成时间：2026-04-28*
*项目路径：`/Users/leckie/kimi2.6/kimi-mio-bakery`*
