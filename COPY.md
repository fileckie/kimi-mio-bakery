# Mio SLOWFIRE — 品牌文案全量物料

> 自动提取自代码仓库，包含所有面向用户的文字表达。
> 生成时间：2026/4/27 18:56:20

## server/api-handler.mjs

- 没有找到订单，请检查订单号或取货码
- 登录成功
- 账号或密码错误
- 本轮预订未开放
- 门店自提
- 已完成
- 订单不存在
- 商品不存在
- 门店不存在
- 生产单不存在
- API 不存在
- 微信支付
- 待生产
- 待发货
- 待付款确认

## server/db.mjs

- );

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      weight TEXT NOT NULL,
      price INTEGER NOT NULL,
      description TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      imageTone TEXT NOT NULL,
      imageUrl TEXT NOT NULL DEFAULT '',
      isPublished INTEGER NOT NULL,
      featured INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      address TEXT NOT NULL,
      pickupOpen INTEGER NOT NULL,
      sourceCode TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS batch_sales (
      id TEXT PRIMARY KEY,
      isOpen INTEGER NOT NULL,
      deadline TEXT NOT NULL,
      defaultDeadline TEXT NOT NULL DEFAULT '21:30',
      ovenBatch TEXT NOT NULL,
      ovenBatches TEXT NOT NULL DEFAULT '[]',
      featuredProductIds TEXT NOT NULL,
      pickupStoreIds TEXT NOT NULL,
      freeShippingThreshold INTEGER NOT NULL,
      baseShippingFee INTEGER NOT NULL,
      note TEXT NOT NULL,
      paymentWechatId TEXT NOT NULL DEFAULT 'mio220827',
      paymentQrUrl TEXT NOT NULL DEFAULT '',
      paymentInstruction TEXT NOT NULL DEFAULT '下单后请添加主理人微信，发送订购单并完成转账，后台确认后安排制作。',
      checkoutTitle TEXT NOT NULL DEFAULT 'YOUR ORDER',
      checkoutSubtitle TEXT NOT NULL DEFAULT '本轮接受预订',
      checkoutEmptyHint TEXT NOT NULL DEFAULT '从左侧挑选喜欢的窑烤面包',
      closedMessage TEXT NOT NULL DEFAULT '本轮窑烤已结束，下一炉开启时会在社群通知。',
      memberLabel TEXT NOT NULL DEFAULT 'MEMBER',
      memberHint TEXT NOT NULL DEFAULT '输入姓名和手机号即可预订',
      successTitle TEXT NOT NULL DEFAULT 'ORDER CONFIRMED',
      successMessage TEXT NOT NULL DEFAULT '面团已入单，窑火为你而燃',
      footerTagline TEXT NOT NULL DEFAULT '不多做，只为你烤'
    );
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS inventory_allocations (
      productId TEXT NOT NULL,
      storeId TEXT NOT NULL,
      allocated INTEGER NOT NULL,
      sold INTEGER NOT NULL,
      PRIMARY KEY (productId, storeId),
      FOREIGN KEY (productId) REFERENCES products(id),
      FOREIGN KEY (storeId) REFERENCES stores(id)
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      shippingFee INTEGER NOT NULL,
      total INTEGER NOT NULL,
      deliveryMethod TEXT NOT NULL,
      paymentMethod TEXT NOT NULL,
      status TEXT NOT NULL,
      customerId TEXT,
      customerName TEXT,
      customerPhone TEXT,
      paymentStatus TEXT NOT NULL DEFAULT '待付款确认',
      sourceStoreId TEXT NOT NULL,
      pickupStoreId TEXT NOT NULL,
      receiver TEXT,
      phone TEXT,
      address TEXT,
      shippingCompany TEXT,
      trackingNumber TEXT,
      logisticsStatus TEXT,
      deliveryNote TEXT,
      pickupCode TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId TEXT NOT NULL,
      productId TEXT NOT NULL,
      name TEXT NOT NULL,
      qty INTEGER NOT NULL,
      price INTEGER NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS production_sheets (
      id TEXT PRIMARY KEY,
      batchId TEXT NOT NULL DEFAULT 'current',
      createdAt TEXT NOT NULL,
      totalItems INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT '生产中'
    );
    CREATE TABLE IF NOT EXISTS production_sheet_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sheetId TEXT NOT NULL,
      productId TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      totalQty INTEGER NOT NULL,
      storeBreakdown TEXT NOT NULL DEFAULT '{}',
      FOREIGN KEY (sheetId) REFERENCES production_sheets(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS changelog (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      version TEXT NOT NULL,
      title TEXT NOT NULL,
      items TEXT NOT NULL DEFAULT '[]'
    );
  `);

  ensureColumn(
- TEXT NOT NULL DEFAULT '下单后请添加主理人微信，发送订购单并完成转账，后台确认后安排制作。'
- TEXT NOT NULL DEFAULT '本轮接受预订'
- TEXT NOT NULL DEFAULT '从左侧挑选喜欢的窑烤面包'
- TEXT NOT NULL DEFAULT '本轮窑烤已结束，下一炉开启时会在社群通知。'
- TEXT NOT NULL DEFAULT '输入姓名和手机号即可预订'
- TEXT NOT NULL DEFAULT '面团已入单，窑火为你而燃'
- TEXT NOT NULL DEFAULT '不多做，只为你烤'
- TEXT NOT NULL DEFAULT '待付款确认'
- 下单后请添加主理人微信，发送订购单并完成转账，后台确认后安排制作。
- 待付款确认
- 请填写姓名和手机号
- 这个手机号已经注册，请直接登录
- 手机号未注册
- 手机号或密码不正确
- 商品 ID 已存在，请换一个名称
- 手作窑烤面包。
- 本轮接受预订
- 从左侧挑选喜欢的窑烤面包
- 本轮窑烤已结束，下一炉开启时会在社群通知。
- 输入姓名和手机号即可预订
- 面团已入单，窑火为你而燃
- 不多做，只为你烤
- 没有选择订单
- 第一炉
- 第二炉
- 待确认
- 待生产
- 生产中
- ").get());
  const inventory = buildInventory();
  const orders = getOrders();
  const changelog = getChangelog();
  return { products, stores, batchSale, inventory, orders, changelog };
}

export function getOrders() {
  return db.prepare("SELECT * FROM orders ORDER BY rowid DESC").all().map(mapOrderWithItems);
}

export function getOrder(id) {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  return order ? mapOrderWithItems(order) : null;
}

export function findOrderByCode(code) {
  const cleanCode = String(code || "").trim();
  if (!cleanCode) return null;
  const order = db
    .prepare("SELECT * FROM orders WHERE id = ? OR pickupCode = ? ORDER BY rowid DESC LIMIT 1")
    .get(cleanCode, cleanCode);
  return order ? mapOrderWithItems(order) : null;
}

export function insertOrder(order) {
  const insert = db.prepare(`
    INSERT INTO orders (
      id, type, subtotal, shippingFee, total, deliveryMethod, paymentMethod, status,
      customerId, customerName, customerPhone, paymentStatus, sourceStoreId, pickupStoreId,
      receiver, phone, address, shippingCompany, trackingNumber, logisticsStatus, deliveryNote,
      pickupCode, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (orderId, productId, name, qty, price) VALUES (?, ?, ?, ?, ?)
  `);
  insert.run(
    order.id,
    order.type,
    order.subtotal,
    order.shippingFee,
    order.total,
    order.deliveryMethod,
    order.paymentMethod,
    order.status,
    order.customerId ?? null,
    order.customerName ?? null,
    order.customerPhone ?? null,
    order.paymentStatus ?? "待付款确认",
    order.sourceStoreId,
    order.pickupStoreId,
    order.receiver ?? null,
    order.phone ?? null,
    order.address ?? null,
    order.shippingCompany ?? null,
    order.trackingNumber ?? null,
    order.logisticsStatus ?? null,
    order.deliveryNote ?? null,
    order.pickupCode,
    order.createdAt,
  );
  for (const item of order.items) {
    insertItem.run(order.id, item.productId, item.name, item.qty, item.price);
    db.prepare(`
      UPDATE inventory_allocations SET sold = sold + ? WHERE productId = ? AND storeId = ?
    `).run(item.qty, item.productId, order.pickupStoreId);
  }
}

export function registerCustomer({ name, phone, password }) {
  const cleanPhone = normalizePhone(phone);
  if (!name || !cleanPhone) throw new Error("请填写姓名和手机号");
  const existing = db.prepare("SELECT * FROM customers WHERE phone = ?").get(cleanPhone);
  if (existing) throw new Error("这个手机号已经注册，请直接登录");
  const customer = {
    id: `C${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`,
    name: String(name).trim(),
    phone: cleanPhone,
    passwordHash: password ? hashPassword(password) : "",
    createdAt: new Date().toISOString(),
  };
  db.prepare("INSERT INTO customers (id, name, phone, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)").run(
    customer.id,
    customer.name,
    customer.phone,
    customer.passwordHash,
    customer.createdAt,
  );
  return publicCustomer(customer);
}

export function loginCustomer({ phone, password }) {
  const cleanPhone = normalizePhone(phone);
  const customer = db.prepare("SELECT * FROM customers WHERE phone = ?").get(cleanPhone);
  if (!customer) throw new Error("手机号未注册");
  // If customer has no password (new simplified flow), skip password check
  if (customer.passwordHash && customer.passwordHash !== hashPassword(password || "")) {
    throw new Error("手机号或密码不正确");
  }
  return publicCustomer(customer);
}

// Unified authenticate: register if new, login if exists — no password required
export function authenticateCustomer({ name, phone }) {
  const cleanPhone = normalizePhone(phone);
  if (!name || !cleanPhone) throw new Error("请填写姓名和手机号");
  const existing = db.prepare("SELECT * FROM customers WHERE phone = ?").get(cleanPhone);
  if (existing) {
    // Update name if changed
    if (existing.name !== String(name).trim()) {
      db.prepare("UPDATE customers SET name = ? WHERE id = ?").run(String(name).trim(), existing.id);
      existing.name = String(name).trim();
    }
    return publicCustomer(existing);
  }
  // Auto-register
  return registerCustomer({ name, phone });
}

export function createProduct(product) {
  const id = normalizeProductId(product.id || product.name);
  const exists = db.prepare("SELECT id FROM products WHERE id = ?").get(id);
  if (exists) throw new Error("商品 ID 已存在，请换一个名称");
  db.prepare(`
    INSERT INTO products (
      id, name, category, weight, price, description, ingredients, imageTone, imageUrl, isPublished, featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    product.name,
    product.category,
    product.weight,
    Number(product.price),
    product.description || "手作窑烤面包。",
    JSON.stringify(product.ingredients || []),
    product.imageTone || "from-amber-100 via-stone-100 to-yellow-50",
    product.imageUrl || "",
    Number(Boolean(product.isPublished)),
    Number(Boolean(product.featured)),
  );

  const stores = db.prepare("SELECT id FROM stores ORDER BY rowid").all();
  const insertInventory = db.prepare(`
    INSERT INTO inventory_allocations (productId, storeId, allocated, sold) VALUES (?, ?, ?, 0)
  `);
  for (const store of stores) insertInventory.run(id, store.id, 0);
  return { product: mapProduct(db.prepare("SELECT * FROM products WHERE id = ?").get(id)), inventory: buildInventory() };
}

export function updateProduct(id, patch) {
  const current = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
  if (!current) return null;
  const next = {
    ...current,
    ...patch,
    isPublished: patch.isPublished === undefined ? current.isPublished : Number(Boolean(patch.isPublished)),
    featured: patch.featured === undefined ? current.featured : Number(Boolean(patch.featured)),
    ingredients: patch.ingredients ? JSON.stringify(patch.ingredients) : current.ingredients,
  };
  db.prepare(`
    UPDATE products SET name = ?, category = ?, weight = ?, price = ?, description = ?,
    ingredients = ?, imageTone = ?, imageUrl = ?, isPublished = ?, featured = ? WHERE id = ?
  `).run(
    next.name,
    next.category,
    next.weight,
    Number(next.price),
    next.description,
    next.ingredients,
    next.imageTone,
    next.imageUrl ?? "",
    next.isPublished,
    next.featured,
    id,
  );
  return mapProduct(db.prepare("SELECT * FROM products WHERE id = ?").get(id));
}

export function updateStore(id, patch) {
  const current = db.prepare("SELECT * FROM stores WHERE id = ?").get(id);
  if (!current) return null;
  const next = {
    ...current,
    ...patch,
    pickupOpen: patch.pickupOpen === undefined ? current.pickupOpen : Number(Boolean(patch.pickupOpen)),
  };
  db.prepare(`
    UPDATE stores SET name = ?, role = ?, address = ?, pickupOpen = ?, sourceCode = ? WHERE id = ?
  `).run(next.name, next.role, next.address, next.pickupOpen, next.sourceCode, id);
  return mapStore(db.prepare("SELECT * FROM stores WHERE id = ?").get(id));
}

export function updateBatchSale(patch) {
  const current = db.prepare("SELECT * FROM batch_sales WHERE id = 
- 
  `).run(
    next.isOpen,
    next.deadline,
    next.defaultDeadline ?? current.defaultDeadline ?? "21:30",
    next.ovenBatch,
    next.ovenBatches,
    next.featuredProductIds,
    next.pickupStoreIds,
    Number(next.freeShippingThreshold),
    Number(next.baseShippingFee),
    next.note,
    next.paymentWechatId ?? "mio220827",
    next.paymentQrUrl ?? "",
    next.paymentInstruction ?? "下单后请添加主理人微信，发送订购单并完成转账，后台确认后安排制作。",
    next.checkoutTitle ?? current.checkoutTitle ?? "YOUR ORDER",
    next.checkoutSubtitle ?? current.checkoutSubtitle ?? "本轮接受预订",
    next.checkoutEmptyHint ?? current.checkoutEmptyHint ?? "从左侧挑选喜欢的窑烤面包",
    next.closedMessage ?? current.closedMessage ?? "本轮窑烤已结束，下一炉开启时会在社群通知。",
    next.memberLabel ?? current.memberLabel ?? "MEMBER",
    next.memberHint ?? current.memberHint ?? "输入姓名和手机号即可预订",
    next.successTitle ?? current.successTitle ?? "ORDER CONFIRMED",
    next.successMessage ?? current.successMessage ?? "面团已入单，窑火为你而燃",
    next.footerTagline ?? current.footerTagline ?? "不多做，只为你烤",
  );
  return mapBatchSale(db.prepare("SELECT * FROM batch_sales WHERE id = 
- ").get());
}

export function updateInventory(productId, storeId, allocated) {
  db.prepare(`
    UPDATE inventory_allocations SET allocated = ? WHERE productId = ? AND storeId = ?
  `).run(Math.max(0, Number(allocated)), productId, storeId);
  return buildInventory();
}

export function getCustomers() {
  const customers = db.prepare("SELECT * FROM customers ORDER BY createdAt DESC").all();
  return customers.map((c) => {
    const stats = db.prepare("SELECT COUNT(*) as orderCount, COALESCE(SUM(total), 0) as totalSpent FROM orders WHERE customerId = ?").get(c.id);
    return {
      ...publicCustomer(c),
      orderCount: stats?.orderCount || 0,
      totalSpent: stats?.totalSpent || 0,
    };
  });
}

export function getCustomerOrders(customerId) {
  return db.prepare("SELECT * FROM orders WHERE customerId = ? ORDER BY createdAt DESC").all(customerId).map(mapOrderWithItems);
}

export function updateOrderStatus(id, status) {
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
  return getOrder(id);
}

export function batchUpdateOrderStatus(ids, status) {
  if (!Array.isArray(ids) || ids.length === 0) throw new Error("没有选择订单");
  const stmt = db.prepare("UPDATE orders SET status = ? WHERE id = ?");
  db.exec("BEGIN");
  try {
    for (const id of ids) {
      stmt.run(status, id);
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  return { updated: ids.length, status };
}

export function updateOrderFulfillment(id, patch) {
  const current = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  if (!current) return null;
  const next = { ...current, ...patch };
  db.prepare(`
    UPDATE orders SET shippingCompany = ?, trackingNumber = ?, logisticsStatus = ?,
    deliveryNote = ?, status = ? WHERE id = ?
  `).run(
    next.shippingCompany ?? null,
    next.trackingNumber ?? null,
    next.logisticsStatus ?? null,
    next.deliveryNote ?? null,
    next.status,
    id,
  );
  return getOrder(id);
}

export function getProductPrices(items) {
  const productById = new Map(db.prepare("SELECT id, name, price FROM products").all().map((product) => [product.id, product]));
  return items.map((item) => {
    const product = productById.get(item.productId);
    if (!product) throw new Error(`Unknown product: ${item.productId}`);
    return {
      productId: product.id,
      name: product.name,
      qty: Number(item.qty),
      price: Number(product.price),
    };
  });
}

export function getBatchSale() {
  return mapBatchSale(db.prepare("SELECT * FROM batch_sales WHERE id = 
- 
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      weight TEXT NOT NULL,
      price INTEGER NOT NULL,
      description TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      imageTone TEXT NOT NULL,
      imageUrl TEXT NOT NULL DEFAULT '',
      isPublished INTEGER NOT NULL,
      featured INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      address TEXT NOT NULL,
      pickupOpen INTEGER NOT NULL,
      sourceCode TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS batch_sales (
      id TEXT PRIMARY KEY,
      isOpen INTEGER NOT NULL,
      deadline TEXT NOT NULL,
      defaultDeadline TEXT NOT NULL DEFAULT '21:30',
      ovenBatch TEXT NOT NULL,
      ovenBatches TEXT NOT NULL DEFAULT '[]',
      featuredProductIds TEXT NOT NULL,
      pickupStoreIds TEXT NOT NULL,
      freeShippingThreshold INTEGER NOT NULL,
      baseShippingFee INTEGER NOT NULL,
      note TEXT NOT NULL,
      paymentWechatId TEXT NOT NULL DEFAULT 'mio220827',
      paymentQrUrl TEXT NOT NULL DEFAULT '',
      paymentInstruction TEXT NOT NULL DEFAULT '下单后请添加主理人微信，发送订购单并完成转账，后台确认后安排制作。',
      checkoutTitle TEXT NOT NULL DEFAULT 'YOUR ORDER',
      checkoutSubtitle TEXT NOT NULL DEFAULT '本轮接受预订',
      checkoutEmptyHint TEXT NOT NULL DEFAULT '从左侧挑选喜欢的窑烤面包',
      closedMessage TEXT NOT NULL DEFAULT '本轮窑烤已结束，下一炉开启时会在社群通知。',
      memberLabel TEXT NOT NULL DEFAULT 'MEMBER',
      memberHint TEXT NOT NULL DEFAULT '输入姓名和手机号即可预订',
      successTitle TEXT NOT NULL DEFAULT 'ORDER CONFIRMED',
      successMessage TEXT NOT NULL DEFAULT '面团已入单，窑火为你而燃',
      footerTagline TEXT NOT NULL DEFAULT '不多做，只为你烤'
    );
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS inventory_allocations (
      productId TEXT NOT NULL,
      storeId TEXT NOT NULL,
      allocated INTEGER NOT NULL,
      sold INTEGER NOT NULL,
      PRIMARY KEY (productId, storeId),
      FOREIGN KEY (productId) REFERENCES products(id),
      FOREIGN KEY (storeId) REFERENCES stores(id)
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      shippingFee INTEGER NOT NULL,
      total INTEGER NOT NULL,
      deliveryMethod TEXT NOT NULL,
      paymentMethod TEXT NOT NULL,
      status TEXT NOT NULL,
      customerId TEXT,
      customerName TEXT,
      customerPhone TEXT,
      paymentStatus TEXT NOT NULL DEFAULT '待付款确认',
      sourceStoreId TEXT NOT NULL,
      pickupStoreId TEXT NOT NULL,
      receiver TEXT,
      phone TEXT,
      address TEXT,
      shippingCompany TEXT,
      trackingNumber TEXT,
      logisticsStatus TEXT,
      deliveryNote TEXT,
      pickupCode TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId TEXT NOT NULL,
      productId TEXT NOT NULL,
      name TEXT NOT NULL,
      qty INTEGER NOT NULL,
      price INTEGER NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS production_sheets (
      id TEXT PRIMARY KEY,
      batchId TEXT NOT NULL DEFAULT 'current',
      createdAt TEXT NOT NULL,
      totalItems INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT '生产中'
    );
    CREATE TABLE IF NOT EXISTS production_sheet_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sheetId TEXT NOT NULL,
      productId TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      totalQty INTEGER NOT NULL,
      storeBreakdown TEXT NOT NULL DEFAULT '{}',
      FOREIGN KEY (sheetId) REFERENCES production_sheets(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS changelog (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      version TEXT NOT NULL,
      title TEXT NOT NULL,
      items TEXT NOT NULL DEFAULT '[]'
    );
  
- );

  db.exec("BEGIN");
  try {
    for (const product of seedProducts) {
      insertProduct.run(
        product[0],
        product[1],
        product[2],
        product[3],
        product[4],
        product[5],
        JSON.stringify(product[6]),
        product[7],
        "",
        product[8],
        product[9],
      );
    }
    for (const store of seedStores) insertStore.run(...store);
    insertBatch.run(
      seedBatchSale.id,
      seedBatchSale.isOpen,
      seedBatchSale.deadline,
      seedBatchSale.ovenBatch,
      JSON.stringify(seedBatchSale.ovenBatches || defaultOvenBatches()),
      JSON.stringify(seedBatchSale.featuredProductIds),
      JSON.stringify(seedBatchSale.pickupStoreIds),
      seedBatchSale.freeShippingThreshold,
      seedBatchSale.baseShippingFee,
      seedBatchSale.note,
      "mio220827",
      "",
      "下单后请添加主理人微信，发送订购单并完成转账，后台确认后安排制作。",
    );

    const storeIds = seedStores.map((store) => store[0]);
    seedProducts.forEach((product, index) => {
      const total = 32 + (index % 5) * 6;
      const allocations = {
        "store-a": Math.min(total, 12 + (index % 3)),
        "store-b": Math.min(total, 8 + (index % 2)),
        "store-c": Math.min(total, 8),
        "store-d": Math.min(total, 6 + (index % 2)),
      };
      const sold = {
        "store-a": index % 4,
        "store-b": index % 3,
        "store-c": index % 2,
        "store-d": index % 3 === 0 ? 1 : 0,
      };
      for (const storeId of storeIds) {
        insertInventory.run(product[0], storeId, allocations[storeId], sold[storeId]);
      }
    });

    for (const order of seedOrders) insertOrder(order);

    const insertChangelog = db.prepare("INSERT INTO changelog (id, date, version, title, items) VALUES (?, ?, ?, ?, ?)");
    for (const entry of seedChangelog) {
      insertChangelog.run(entry.id, entry.date, entry.version, entry.title, JSON.stringify(entry.items));
    }

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function getBootstrap() {
  const products = db
    .prepare("SELECT * FROM products ORDER BY rowid")
    .all()
    .map(mapProduct);
  const stores = db.prepare("SELECT * FROM stores ORDER BY rowid").all().map(mapStore);
  const batchSale = mapBatchSale(db.prepare("SELECT * FROM batch_sales WHERE id = 'current'").get());
  const inventory = buildInventory();
  const orders = getOrders();
  const changelog = getChangelog();
  return { products, stores, batchSale, inventory, orders, changelog };
}

export function getOrders() {
  return db.prepare("SELECT * FROM orders ORDER BY rowid DESC").all().map(mapOrderWithItems);
}

export function getOrder(id) {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  return order ? mapOrderWithItems(order) : null;
}

export function findOrderByCode(code) {
  const cleanCode = String(code || "").trim();
  if (!cleanCode) return null;
  const order = db
    .prepare("SELECT * FROM orders WHERE id = ? OR pickupCode = ? ORDER BY rowid DESC LIMIT 1")
    .get(cleanCode, cleanCode);
  return order ? mapOrderWithItems(order) : null;
}

export function insertOrder(order) {
  const insert = db.prepare(
- );
  insert.run(
    order.id,
    order.type,
    order.subtotal,
    order.shippingFee,
    order.total,
    order.deliveryMethod,
    order.paymentMethod,
    order.status,
    order.customerId ?? null,
    order.customerName ?? null,
    order.customerPhone ?? null,
    order.paymentStatus ?? "待付款确认",
    order.sourceStoreId,
    order.pickupStoreId,
    order.receiver ?? null,
    order.phone ?? null,
    order.address ?? null,
    order.shippingCompany ?? null,
    order.trackingNumber ?? null,
    order.logisticsStatus ?? null,
    order.deliveryNote ?? null,
    order.pickupCode,
    order.createdAt,
  );
  for (const item of order.items) {
    insertItem.run(order.id, item.productId, item.name, item.qty, item.price);
    db.prepare(
- ).run(item.qty, item.productId, order.pickupStoreId);
  }
}

export function registerCustomer({ name, phone, password }) {
  const cleanPhone = normalizePhone(phone);
  if (!name || !cleanPhone) throw new Error("请填写姓名和手机号");
  const existing = db.prepare("SELECT * FROM customers WHERE phone = ?").get(cleanPhone);
  if (existing) throw new Error("这个手机号已经注册，请直接登录");
  const customer = {
    id: 
- ,
    name: String(name).trim(),
    phone: cleanPhone,
    passwordHash: password ? hashPassword(password) : "",
    createdAt: new Date().toISOString(),
  };
  db.prepare("INSERT INTO customers (id, name, phone, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)").run(
    customer.id,
    customer.name,
    customer.phone,
    customer.passwordHash,
    customer.createdAt,
  );
  return publicCustomer(customer);
}

export function loginCustomer({ phone, password }) {
  const cleanPhone = normalizePhone(phone);
  const customer = db.prepare("SELECT * FROM customers WHERE phone = ?").get(cleanPhone);
  if (!customer) throw new Error("手机号未注册");
  // If customer has no password (new simplified flow), skip password check
  if (customer.passwordHash && customer.passwordHash !== hashPassword(password || "")) {
    throw new Error("手机号或密码不正确");
  }
  return publicCustomer(customer);
}

// Unified authenticate: register if new, login if exists — no password required
export function authenticateCustomer({ name, phone }) {
  const cleanPhone = normalizePhone(phone);
  if (!name || !cleanPhone) throw new Error("请填写姓名和手机号");
  const existing = db.prepare("SELECT * FROM customers WHERE phone = ?").get(cleanPhone);
  if (existing) {
    // Update name if changed
    if (existing.name !== String(name).trim()) {
      db.prepare("UPDATE customers SET name = ? WHERE id = ?").run(String(name).trim(), existing.id);
      existing.name = String(name).trim();
    }
    return publicCustomer(existing);
  }
  // Auto-register
  return registerCustomer({ name, phone });
}

export function createProduct(product) {
  const id = normalizeProductId(product.id || product.name);
  const exists = db.prepare("SELECT id FROM products WHERE id = ?").get(id);
  if (exists) throw new Error("商品 ID 已存在，请换一个名称");
  db.prepare(
- ).run(
    id,
    product.name,
    product.category,
    product.weight,
    Number(product.price),
    product.description || "手作窑烤面包。",
    JSON.stringify(product.ingredients || []),
    product.imageTone || "from-amber-100 via-stone-100 to-yellow-50",
    product.imageUrl || "",
    Number(Boolean(product.isPublished)),
    Number(Boolean(product.featured)),
  );

  const stores = db.prepare("SELECT id FROM stores ORDER BY rowid").all();
  const insertInventory = db.prepare(
- ).run(
    next.isOpen,
    next.deadline,
    next.defaultDeadline ?? current.defaultDeadline ?? "21:30",
    next.ovenBatch,
    next.ovenBatches,
    next.featuredProductIds,
    next.pickupStoreIds,
    Number(next.freeShippingThreshold),
    Number(next.baseShippingFee),
    next.note,
    next.paymentWechatId ?? "mio220827",
    next.paymentQrUrl ?? "",
    next.paymentInstruction ?? "下单后请添加主理人微信，发送订购单并完成转账，后台确认后安排制作。",
    next.checkoutTitle ?? current.checkoutTitle ?? "YOUR ORDER",
    next.checkoutSubtitle ?? current.checkoutSubtitle ?? "本轮接受预订",
    next.checkoutEmptyHint ?? current.checkoutEmptyHint ?? "从左侧挑选喜欢的窑烤面包",
    next.closedMessage ?? current.closedMessage ?? "本轮窑烤已结束，下一炉开启时会在社群通知。",
    next.memberLabel ?? current.memberLabel ?? "MEMBER",
    next.memberHint ?? current.memberHint ?? "输入姓名和手机号即可预订",
    next.successTitle ?? current.successTitle ?? "ORDER CONFIRMED",
    next.successMessage ?? current.successMessage ?? "面团已入单，窑火为你而燃",
    next.footerTagline ?? current.footerTagline ?? "不多做，只为你烤",
  );
  return mapBatchSale(db.prepare("SELECT * FROM batch_sales WHERE id = 'current'").get());
}

export function updateInventory(productId, storeId, allocated) {
  db.prepare(
- ).run(Math.max(0, Number(allocated)), productId, storeId);
  return buildInventory();
}

export function getCustomers() {
  const customers = db.prepare("SELECT * FROM customers ORDER BY createdAt DESC").all();
  return customers.map((c) => {
    const stats = db.prepare("SELECT COUNT(*) as orderCount, COALESCE(SUM(total), 0) as totalSpent FROM orders WHERE customerId = ?").get(c.id);
    return {
      ...publicCustomer(c),
      orderCount: stats?.orderCount || 0,
      totalSpent: stats?.totalSpent || 0,
    };
  });
}

export function getCustomerOrders(customerId) {
  return db.prepare("SELECT * FROM orders WHERE customerId = ? ORDER BY createdAt DESC").all(customerId).map(mapOrderWithItems);
}

export function updateOrderStatus(id, status) {
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
  return getOrder(id);
}

export function batchUpdateOrderStatus(ids, status) {
  if (!Array.isArray(ids) || ids.length === 0) throw new Error("没有选择订单");
  const stmt = db.prepare("UPDATE orders SET status = ? WHERE id = ?");
  db.exec("BEGIN");
  try {
    for (const id of ids) {
      stmt.run(status, id);
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  return { updated: ids.length, status };
}

export function updateOrderFulfillment(id, patch) {
  const current = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  if (!current) return null;
  const next = { ...current, ...patch };
  db.prepare(
- ).digest("hex");
}

function publicCustomer(customer) {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    createdAt: customer.createdAt,
  };
}

function defaultOvenBatches() {
  return [
    { id: "batch-am", label: "第一炉", time: "11:30", productIds: ["lychee-rose", "salt-roll", "pistachio-toast"] },
    { id: "batch-pm", label: "第二炉", time: "17:30", productIds: ["country-fruit", "pumpkin-toast", "brownie-soft"] },
  ];
}

function parseJson(value, fallback) {
  try {
    const parsed = JSON.parse(value || "");
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    weight: row.weight,
    price: row.price,
    description: row.description,
    ingredients: JSON.parse(row.ingredients),
    imageTone: row.imageTone,
    imageUrl: row.imageUrl || "",
    isPublished: Boolean(row.isPublished),
    featured: Boolean(row.featured),
  };
}

function mapStore(row) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    address: row.address,
    pickupOpen: Boolean(row.pickupOpen),
    sourceCode: row.sourceCode,
  };
}

function mapBatchSale(row) {
  return {
    id: row.id,
    isOpen: Boolean(row.isOpen),
    deadline: row.deadline,
    defaultDeadline: row.defaultDeadline || "21:30",
    ovenBatch: row.ovenBatch,
    ovenBatches: parseJson(row.ovenBatches, defaultOvenBatches()),
    featuredProductIds: JSON.parse(row.featuredProductIds),
    pickupStoreIds: JSON.parse(row.pickupStoreIds),
    freeShippingThreshold: row.freeShippingThreshold,
    baseShippingFee: row.baseShippingFee,
    note: row.note,
    paymentWechatId: row.paymentWechatId || "mio220827",
    paymentQrUrl: row.paymentQrUrl || "",
    paymentInstruction: row.paymentInstruction || "下单后请添加主理人微信，发送订购单并完成转账，后台确认后安排制作。",
    checkoutTitle: row.checkoutTitle || "YOUR ORDER",
    checkoutSubtitle: row.checkoutSubtitle || "本轮接受预订",
    checkoutEmptyHint: row.checkoutEmptyHint || "从左侧挑选喜欢的窑烤面包",
    closedMessage: row.closedMessage || "本轮窑烤已结束，下一炉开启时会在社群通知。",
    memberLabel: row.memberLabel || "MEMBER",
    memberHint: row.memberHint || "输入姓名和手机号即可预订",
    successTitle: row.successTitle || "ORDER CONFIRMED",
    successMessage: row.successMessage || "面团已入单，窑火为你而燃",
    footerTagline: row.footerTagline || "不多做，只为你烤",
  };
}

function mapOrderWithItems(row) {
  return {
    id: row.id,
    type: row.type,
    items: db
      .prepare("SELECT productId, name, qty, price FROM order_items WHERE orderId = ? ORDER BY id")
      .all(row.id),
    subtotal: row.subtotal,
    shippingFee: row.shippingFee,
    total: row.total,
    deliveryMethod: row.deliveryMethod,
    paymentMethod: row.paymentMethod,
    status: row.status,
    customerId: row.customerId ?? undefined,
    customerName: row.customerName ?? undefined,
    customerPhone: row.customerPhone ?? undefined,
    paymentStatus: row.paymentStatus ?? "待付款确认",
    sourceStoreId: row.sourceStoreId,
    pickupStoreId: row.pickupStoreId,
    receiver: row.receiver ?? undefined,
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    shippingCompany: row.shippingCompany ?? undefined,
    trackingNumber: row.trackingNumber ?? undefined,
    logisticsStatus: row.logisticsStatus ?? undefined,
    deliveryNote: row.deliveryNote ?? undefined,
    pickupCode: row.pickupCode,
    createdAt: row.createdAt,
  };
}

// ========== Production Sheets ==========

export function closeBatchAndCreateSheet() {
  const batchSale = getBatchSale();
  if (batchSale.isOpen) {
    // Close the batch
    updateBatchSale({ isOpen: false });
  }

  // Aggregate all pending orders into production sheet
  const orders = getOrders().filter((o) => o.status === "待确认" || o.status === "待生产");
  const productMap = new Map();
  const storeBreakdown = new Map();

  for (const order of orders) {
    for (const item of order.items) {
      const key = item.productId;
      if (!productMap.has(key)) {
        const product = db.prepare("SELECT * FROM products WHERE id = ?").get(key);
        productMap.set(key, { productId: key, name: item.name, category: product?.category || "", totalQty: 0 });
        storeBreakdown.set(key, {});
      }
      const p = productMap.get(key);
      p.totalQty += item.qty;

      const sb = storeBreakdown.get(key);
      sb[order.pickupStoreId] = (sb[order.pickupStoreId] || 0) + item.qty;
    }
  }

  const sheetId = 
- ;
  const totalItems = Array.from(productMap.values()).reduce((sum, p) => sum + p.totalQty, 0);

  db.prepare("INSERT INTO production_sheets (id, batchId, createdAt, totalItems, status) VALUES (?, ?, ?, ?, ?)")
    .run(sheetId, "current", new Date().toISOString(), totalItems, "生产中");

  const insertItem = db.prepare(

## server/seed.mjs

- 荔枝玫瑰
- 欧包/坚果
- 280克
- 红酒浸润荔枝果香，玫瑰尾调清晰，适合切片分享。
- 红酒荔枝
- 玫瑰
- 天然酵母
- 乡村果实
- 加州蔓越莓和热带亚麻籽，酸甜耐嚼，适合早餐。
- 蔓越莓
- 亚麻籽
- 乡村面团
- 奇亚籽坚果多
- 坚果香和谷物感更重，口感扎实，适合健身早餐。
- 奇亚籽
- 综合坚果
- 全麦粉
- 无花果&枸杞子
- 无花果颗粒和枸杞甜香，回烤后果香更明显。
- 无花果
- 枸杞
- 海盐卷
- 贝果/海盐卷
- 70克
- 外壳微脆，内部柔软，黄油和海盐是主角。
- 海盐
- 黄油
- 高筋粉
- 蔓越莓乳酪贝果
- 85克
- 乳酪微咸，蔓越莓带酸甜，适合冷藏后食用。
- 乳酪
- 贝果面团
- 橙皮鲜花贝果
- 95克
- 橙皮清香和花香轻盈，适合办公室拼单。
- 糖渍橙皮
- 花香酱
- 开心果吐司
- 吐司
- 坚果脂香浓郁，整条预订更适合家庭早餐。
- 开心果
- 牛奶
- 吐司面团
- 贝贝南瓜吐司
- 贝贝南瓜带自然甜香，口感柔软细腻。
- 贝贝南瓜
- 奶油生椰吐司
- 椰香和奶油感明显，适合作为门店主推款。
- 生椰乳
- 奶油
- 菌菇奶酪恰巴塔
- 恰巴塔
- 190克
- 菌菇香气和奶酪咸香，适合作为午餐轻食。
- 菌菇
- 奶酪
- 恰巴塔面团
- 玫瑰蔓越莓恰巴塔
- 玫瑰香和蔓越莓果酸平衡，适合开团试吃。
- 罗勒培根恰巴塔
- 罗勒和培根咸香明显，适合同城午间配送。
- 罗勒
- 培根
- 德肠芝士恰巴塔
- 德肠和芝士带来更强饱腹感，适合办公室拼单。
- 德肠
- 芝士
- 香蕉巧克力恰巴塔
- 香蕉甜香和巧克力微苦，下午茶友好。
- 香蕉
- 巧克力
- 火腿菌菇软欧包
- 软欧包
- 120克
- 火腿和菌菇咸香，单人早餐或午餐都合适。
- 火腿
- 软欧面团
- 黑胡椒牛肉软欧包
- 140克
- 黑胡椒香气和牛肉颗粒，适合工作日午餐。
- 牛肉
- 黑胡椒
- 布朗尼软欧包
- 180克
- 巧克力甜点型软欧，适合加购和分享。
- 布朗尼
- lim天鹅湖店
- 深圳市福田区天鹅湖花园三期 L112
- 南山店
- 深圳市南山区后海滨路 2013 号
- 罗湖店
- 深圳市罗湖区桂园路 88 号
- 今晚 21:30
- 明日 10:30 / 16:30 出炉
- 集中预订，按门店分配库存，次日到店自提或本地配送。
- 本轮接受预订
- 从左侧挑选喜欢的窑烤面包
- 本轮窑烤已结束，下一炉开启时会在社群通知。
- 输入姓名和手机号即可预订
- 面团已入单，窑火为你而燃
- 不多做，只为你烤
- 后台设置保存优化 + 更新日志
- 后台设置改为每个模块独立保存按钮，修改后点击保存才提交
- 新增更新日志模块，每次更新自动推送变更记录
- 保存状态可视化：保存中 / 已保存 / 保存失败
- 顾客端文案质感升级
- 下单面板增加英文氛围标签：YOUR ORDER / PICKUP / DELIVERY / PAYMENT
- 保存的订购单凭证图重绘：双层边框 + 英文分区 + 窑烤印章
- 后台新增页面文案定制面板，可修改所有顾客端文案
- 订单管理 + 打印优化
- 订单列表增加日期范围筛选和 CSV 导出功能
- 生产单记录增加日期筛选
- 打印单排版优化，防止分页截断
- 会员系统 + 后台管理
- 顾客免密码注册登录，输入姓名+手机号即可预订
- 新增会员管理和我的订单页面
- 订单批量操作：多选 + 一键改状态
- 新增后台登录验证，账号密码均为 1
- 门店自提
- 微信支付
- 待生产
- 顺丰快递
- 支付宝
- 待发货
- 王女士
- 上海市徐汇区某小区
- 现金
- 已完成

## src/components/SealStamp.tsx

- 窑烤
-  }}
      >
        {/* 外框 — 不规则圆角矩形 */}
        <rect
          x=
-  }}
        />
        {/* 内框 */}
        <rect
          x=
- 
        />
        {/* 文字 */}
        <text
          x=
- ${text}印章

## src/components/admin/AdminDashboard.tsx

- 门店自提
- 待确认
- 待生产
- 已完成
- 已发货
- 重新开窑失败
- 封窑中...
- 封窑截单 · 生成窑烤单
- 开窑中...
- 重新开窑
- 已出炉
- 今日窑单
- 到店自提
- 待配送
- 窑烤金额
- 总部看全部待入窑订单
- 本店待入窑订单
- 全部门店待取货
- 本店待取货
- 顾客
- ${orders.length} 单
- ${pickupCount} 单
- ${shippingCount} 单

## src/components/admin/AdminHeader.tsx

- 总部账号
-  />后台
          </button>
          <button onClick={() => setRoute(

## src/components/admin/AdminLogin.tsx

- 账号或密码错误
- 输入账号
- 输入密码

## src/components/admin/AdminPage.tsx

- 概览
- 订单
- 会员
- 商品
- 库存
- 设置
- 总部窑房
- 门店窑房
- 总部管理窑烤批次、商品、门店与入窑单。
- 门店处理本店订单、取货名单和现场收银。
- 更新日志

## src/components/admin/ChangelogDrawer.tsx

- 新功能
- 优化
- 修复
- 重大变更
- 全部

## src/components/admin/InventoryPanel.tsx

- 库存保存失败

## src/components/admin/MembersPanel.tsx

- 当前没有会员数据可导出
- );
  a.href = url;
  a.download = `窑烤会员_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function MembersPanel() {
  const [members, setMembers] = useState<MemberWithStats[]>([]);
  const [filter, setFilter] = useState(
- 搜索姓名或手机号
- >
                注册于 {new Date(member.createdAt).toLocaleDateString(

## src/components/admin/OrdersPanel.tsx

- 待确认
- 待生产
- 待自提
- 待发货
- 已发货
- 已完成
- 当前筛选条件下没有订单可导出
- 未登记
- ,
      商品: o.items.map((i) => `${i.name}×${i.qty}`).join(
- ),
      配送: o.deliveryMethod,
      状态: o.status,
      门店: stores.find((s) => s.id === o.pickupStoreId)?.name || o.pickupStoreId,
      金额: o.total,
    }));
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(
- );
    a.href = url;
    a.download = `窑烤订单_${dateFrom || 
- 全部
- 更新失败
- , message: `已批量更新 ${selected.size} 个订单为「${status}」` });
      setSelected(new Set());
      onUpdate();
    } catch (e) {
      alert(e instanceof Error ? e.message : 
- 搜索订单/顾客/取货码
- 收起
- 详情
- 免运费
- ).join(" / "),
      配送: o.deliveryMethod,
      状态: o.status,
      门店: stores.find((s) => s.id === o.pickupStoreId)?.name || o.pickupStoreId,
      金额: o.total,
    }));
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => 
- 已批量更新 ${selected.size} 个订单为「${status}」

## src/components/admin/PickupSheetPrint.tsx

- 门店自提
- 已完成
- );
    if (!printWindow) return;

    printWindow.document.write(`
      <html><head><title>自提单-${store.name}</title>
      <link href=
- >${store.address} · 共 ${storeOrders.length} 单</div>
      <table>
        <thead>
          <tr>
            <th>取货码</th>
            <th>顾客</th>
            <th>电话</th>
            <th>面包清单</th>
            <th>核对</th>
          </tr>
        </thead>
        <tbody>
          ${storeOrders.map(o => `
            <tr>
              <td><span class=
- 顾客

## src/components/admin/PosTerminal.tsx

- 现金
- 微信转账
- 微信支付
- 支付宝
- 到店付
- 门店自提
- 已完成
- 刚刚
- >门店现场拿货结账</p>
        </div>
        <button onClick={() => setRoute(
- >
              {lastOrder.id} 已完成，归属 {store.name}{lastOrder.pickupCode ? `，取货码 ${lastOrder.pickupCode}` : 

## src/components/admin/ProductionSheetPrint.tsx

- );
    if (!printWindow) return;

    printWindow.document.write(`
      <html><head><title>分拣单-${store.name}</title>
      <link href=
- >${store.name} · ${store.address} · 取货码 ${store.sourceCode}</div>
      <table>
        <thead><tr><th>面包</th><th>数量</th><th>核对</th></tr></thead>
        <tbody>
          ${storeItems.map(i => `<tr><td>${i.name}</td><td>${i.qty} 个</td><td><span class=
- >总计: ${storeItems.reduce((s, i) => s + i.qty, 0)} 个</div>
      <div class=
- >
            生成于 {new Date(sheet.createdAt).toLocaleString(
- 今日出炉
- >
          截单时间: {new Date(sheet.createdAt).toLocaleString(
- ).join("")}
        </tbody>
      </table>
      <div class="total">总计: ${storeItems.reduce((s, i) => s + i.qty, 0)} 个</div>
      <div class="seal">窑烤</div>
      </body></html>
    

## src/components/admin/ProductsPanel.tsx

- 欧包/坚果
- 吐司
- 恰巴塔
- 贝果/海盐卷
- 软欧包
- 280克
- 保存失败
- 新增失败
- 图片上传失败
- 总部可编辑
- 门店只读
- 产品名称
- 克重
- 价格
- 配料，逗号分隔
- 产品介绍
-  />选择图片<input type=
- 介绍
-  />上传图片<input type=
- 上架
- 下架

## src/components/admin/SettingsPanel.tsx

- );

  // Keep drafts in sync when props change (e.g. after save)
  const syncFromProps = useCallback(() => {
    setBatchDraft({
      isOpen: batchSale.isOpen,
      defaultDeadline: batchSale.defaultDeadline,
      deadline: batchSale.deadline,
      ovenBatch: batchSale.ovenBatch,
      freeShippingThreshold: batchSale.freeShippingThreshold,
      baseShippingFee: batchSale.baseShippingFee,
    });
    setBatchesDraft(batchSale.ovenBatches);
    setPaymentDraft({
      paymentWechatId: batchSale.paymentWechatId,
      paymentInstruction: batchSale.paymentInstruction,
      paymentQrUrl: batchSale.paymentQrUrl,
    });
    setCopyDraft({
      checkoutTitle: batchSale.checkoutTitle,
      checkoutSubtitle: batchSale.checkoutSubtitle,
      checkoutEmptyHint: batchSale.checkoutEmptyHint,
      closedMessage: batchSale.closedMessage,
      memberLabel: batchSale.memberLabel,
      memberHint: batchSale.memberHint,
      successTitle: batchSale.successTitle,
      successMessage: batchSale.successMessage,
      footerTagline: batchSale.footerTagline,
    });
    setStoresDraft(stores);
  }, [batchSale, stores]);

  // Generic save helper — 静默保存，不触发全局刷新避免闪烁和光标丢失
  const doSave = async (
    setter: (v: SaveState) => void,
    action: () => Promise<BatchSale>,
    label: string
  ) => {
    setter(
- , message: `${label} 已保存` });
      // 静默更新全局 store，不触发 isLoading
      useAppStore.getState().setBatchSale(updated);
      setTimeout(() => setter(
- , message: `${label} 保存失败，请重试` });
    }
  };

  // Save module A
  const saveBatch = () =>
    doSave(setBatchSave, () => api.updateBatchSale(batchDraft), 
- 出炉批次
- 付款设置
- 文案定制
- 门店设置 已保存
- 门店设置 保存失败，请重试
-  />已保存
        </span>
      );
    }
    if (state === 
- >关闭后只能浏览产品</span>
              </span>
              <input type=
- 如今晚 21:30
- 如明日 10:30 / 16:30 出炉
- 炉次名称
- 时间
- 顾客下单后看到的付款指引
-  />上传微信二维码
                <input type=
- >移除二维码</button>
              )}
            </div>
            {paymentDraft.paymentQrUrl && (
              <img src={paymentDraft.paymentQrUrl} alt=
- 主门店
- 自提点
- 门店名称
- 地址
- ${label} 已保存
- ${label} 保存失败，请重试
- 第${prev.length + 1}炉

## src/components/customer/CheckoutPanel.tsx

- 门店自提
- 本地配送
- 顺丰快递
- 微信转账
- 待生产
- 待发货
- 待付款确认
- 本轮已截单
- 姓名
- 手机号
- 收件人
- 详细地址
- ><span>运费</span><span>{shippingFee === 0 ? 
- }>
                  {opt.method === "门店自提" ? pickupStore.address : 

## src/components/customer/CustomerHeader.tsx

- 今日出炉
- 面包单
- 查订单
- 门店
- Mio SLOWFIRE 首页
-  />
              我的订单
            </button>
          )}
          {cartCount > 0 && (
            <a href=
- 
          >
            商家登录
          </button>
          <button
            type=
- 
              >
                我的订单
              </button>
            )}
            <button
              type=

## src/components/customer/FeatureEntrances.tsx

- 窑烤预订
- 提前一晚预订，次日按炉次出炉
- 邻里拼单
- 和街坊一起凑满免运，分摊温情
- 到店自提
- 中央窑烤，lim天鹅湖店就近取货
- 窑烤故事
- 每款面包都有面团背后的时间

## src/components/customer/HeroSection.tsx

- 本轮窑火已点燃，接受预订中
- 窑火渐熄，下一炉准备中

## src/components/customer/MobileCheckout.tsx

-  />
            {cartCount > 0 ? `${cartCount} 件面包` : 
- ${cartCount} 件面包

## src/components/customer/MyOrdersDrawer.tsx

- 待确认
- 待生产
- 待自提
- 待发货
- 已发货
- 已完成
- 订单已收到
- 已入生产单
- 已出炉，待领取
- 已出炉，待配送
- 配送中

## src/components/customer/OrderLookup.tsx

- 待确认
- 待生产
- 待自提
- 待发货
- 已发货
- 已完成
- 订单已收到，等待确认
- 已入生产单，窑火准备中
- 已出炉，等待到店领取
- 已出炉，等待配送
- 配送中
- 未找到订单
- 订单号或取货暗号
- 查询中...
- 查询

## src/components/customer/OrderSuccessModal.tsx

- 窑烤
- Mio SLOWFIRE · 不多做，只为你烤
- ><p>长按图片 → 保存到相册</p></body></html>`);
        w.document.close();
      }
    } else {
      const link = document.createElement(
- 微信二维码
- >扫码添加主理人微信，发送订单截图转账</p>
              <button
                onClick={() => {
                  const link = document.createElement(
- 已复制
- 复制
- >长按下方图片保存到相册</p>
            <img src={receiptImg} alt=

## src/components/customer/ProductCard.tsx

- 已售罄
- 减少
- 增加
- 仅剩 ${available}
- 余 ${available}

## src/components/customer/ProductGrid.tsx

- 欧包/坚果
- 吐司
- 恰巴塔
- 贝果/海盐卷
- 软欧包
- 全部
- 看看其他分类
- , message: `已添加 ${product.name}` });
                }}
                onRemove={() => {
                  updateQty(product.id, -1, getAvailable(product.id));
                  const newQty = (cartItems[product.id] || 0) - 1;
                  if (newQty <= 0) addToast({ type: 
- 已添加 ${product.name}
- 已移除 ${product.name}

## src/components/customer/ProductVisual.tsx

- ;

/* ===== 窑烤色块风 SVG =====
 * 背景：波点女王（草间弥生）风格的融合色块 + 重复圆点
 * 每个类别有独特的背景图案，上方叠加缩小的矢量面包
 */

const KILN_COLORS = {
  char: 
- ,
};

/* ===== 背景图案 — 每个类别独特的波点+色块融合 ===== */
const bgPatterns: Record<Category, ReactNode> = {
  
-  />
      {/* 融合大色块 */}
      <circle cx=
- 吐司
-  fill={KILN_COLORS.cream} />
      {/* 吐司切片感的垂直条纹色块 */}
      <rect x=
-  />
      {/* 融合圆 */}
      <circle cx=
- 恰巴塔
-  />
      {/* 大气泡色块 */}
      <ellipse cx=
- 贝果/海盐卷
-  fill={KILN_COLORS.cream} />
      {/* 同心圆环色块 */}
      <circle cx=
- 软欧包
-  />
      {/* 柔软云朵色块 */}
      <circle cx=
-  />
    </g>
  ),
};

/* ===== 矢量面包图 — 缩小版 ===== */
const breadSvg: Record<Category, ReactNode> = {
  

## src/components/customer/StoreInfo.tsx

- 主门店
- 自提点
- 接受自提
- 暂停自提

## src/components/ui/Countdown.tsx

- 截单倒计时

## src/components/ui/EmptyState.tsx

- 篮子里空空如也
- 先去挑几款喜欢的面包吧
- 今日已售罄
- 来晚了一步，明天早点来
- 网络断了
- 检查一下网络，或者稍后再试
- 这里什么都没有
- 面团还在发酵中

## src/components/ui/ProductVisual.tsx

- ;

/* ===== 精致窑烤面包 SVG =====
 * 用椭圆、路径和渐变模拟真实面包质感
 * 色调：焦褐 → 暖棕 → 麦黄，带径向渐变高光
 */

const defs = (
  <defs>
    <radialGradient id=
- 欧包/坚果
- >
      {defs}
      {/* 主面包体 — 椭圆外框 */}
      <ellipse cx=
-  />
      {/* 顶部高光区 */}
      <ellipse cx=
-  />
      {/* 割纹 — 自然曲线 */}
      <path d=
-  />
      {/* 坚果 — 不规则小椭圆 */}
      <ellipse cx=
-  />
      {/* 底部焦痕 */}
      <ellipse cx=
- 吐司
- >
      {defs}
      {/* 外框 — 圆角矩形 */}
      <rect x=
-  />
      {/* 顶面 — 更浅的椭圆 */}
      <ellipse cx=
-  />
      {/* 顶部焦弧 */}
      <path d=
-  />
      {/* 切片线 */}
      <line x1=
-  />
      {/* 侧边微焦 */}
      <rect x=
- 恰巴塔
- >
      {defs}
      {/* 扁平拖鞋形 */}
      <ellipse cx=
-  />
      {/* 顶部高光 */}
      <ellipse cx=
-  />
      {/* 割纹 */}
      <path d=
-  />
      {/* 大气孔 — 深色椭圆 */}
      <ellipse cx=
-  />
      {/* 底部 */}
      <ellipse cx=
- 贝果/海盐卷
- >
      {defs}
      {/* 外圈 */}
      <ellipse cx=
-  />
      {/* 中心孔 */}
      <ellipse cx=
-  />
      {/* 海盐粒 */}
      <rect x=
-  />
      {/* 顶部焦痕 */}
      <ellipse cx=
- 软欧包
- >
      {defs}
      {/* 圆润主体 */}
      <ellipse cx=
-  />
      {/* 顶部大高光 */}
      <ellipse cx=
-  />
      {/* 底部焦 */}
      <ellipse cx=

## src/lib/api.ts

- 请求失败
- , {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "请求失败");
  }
  return data as T;
}

export const api = {
  bootstrap: () => apiRequest<BootstrapPayload>("/api/bootstrap"),
  
  // Customers — simplified: no password required
  authenticateCustomer: (body: { name: string; phone: string }) =>
    apiRequest<Customer>("/api/customers/authenticate", { method: "POST", body: JSON.stringify(body) }),
  registerCustomer: (body: { name: string; phone: string; password?: string }) =>
    apiRequest<Customer>("/api/customers/register", { method: "POST", body: JSON.stringify(body) }),
  loginCustomer: (body: { phone: string; password?: string }) =>
    apiRequest<Customer>("/api/customers/login", { method: "POST", body: JSON.stringify(body) }),
  getCustomerOrders: (customerId: string) =>
    apiRequest<Order[]>(

## src/lib/utils.ts

- 图片读取失败
- ).map(Number);
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  if (target < now) target.setDate(target.getDate() + 1);
  const diffMs = target.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  return {
    hours: Math.floor(diffMins / 60),
    minutes: diffMins % 60,
    isOverdue: diffMins < 0,
  };
}

export function formatCountdown(hours: number, minutes: number): string {
  if (hours > 0) return `${hours}小时${minutes}分`;
  return `${minutes}分`;
}

export function classNames(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(
- ;
}

export function generatePickupCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
}

export function normalizePhone(phone: string): string {
  return String(phone || "").replace(/\D/g, "");
}

export function timeUntil(targetTime: string): { hours: number; minutes: number; isOverdue: boolean } {
  const now = new Date();
  const [hours, minutes] = targetTime.split(":").map(Number);
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  if (target < now) target.setDate(target.getDate() + 1);
  const diffMs = target.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  return {
    hours: Math.floor(diffMins / 60),
    minutes: diffMins % 60,
    isOverdue: diffMins < 0,
  };
}

export function formatCountdown(hours: number, minutes: number): string {
  if (hours > 0) return 
- ${minutes}分

## src/main.tsx

- [SW] 窑火已注册:
- [SW] 注册失败:

## src/stores/appStore.ts

- 下单后请添加主理人微信，发送订购单并完成转账，后台确认后安排制作。
- 本轮接受预订
- 从左侧挑选喜欢的窑烤面包
- 本轮窑烤已结束，下一炉开启时会在社群通知。
- 输入姓名和手机号即可预订
- 面团已入单，窑火为你而燃
- 不多做，只为你烤
- 后端暂不可用
- , message: `生产单 ${data.sheet.id} 已生成，共 ${data.sheet.totalItems} 个面包` });
      return data.sheet;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 
- , message: `订单 ${data.order.id} 创建成功` });
      return data.order;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 
- 生产单 ${data.sheet.id} 已生成，共 ${data.sheet.totalItems} 个面包
- 订单 ${data.order.id} 创建成功

## src/stores/authStore.ts

- , message: `欢迎，${customer.name}` });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 
- 已退出登录
- 欢迎，${customer.name}

## src/stores/cartStore.ts

- 门店自提
- 本地配送
- 顺丰快递
- 微信转账
- 微信支付
- 支付宝
- 到店付
- 现金

## src/types/index.ts

- 欧包/坚果
- 吐司
- 恰巴塔
- 贝果/海盐卷
- 软欧包
- 门店自提
- 本地配送
- 顺丰快递
- 微信转账
- 微信支付
- 支付宝
- 到店付
- 现金
- 待确认
- 待生产
- 待自提
- 待发货
- 已发货
- 已完成
- ;

export interface Product {
  id: string;
  name: string;
  category: Category;
  weight: string;
  price: number;
  description: string;
  ingredients: string[];
  imageTone: string;
  imageUrl?: string;
  isPublished: boolean;
  featured: boolean;
  story?: string;           // 主理人故事
  baker?: string;           // 面包师
  bestBefore?: string;      // 最佳食用时间
}

export interface StoreLocation {
  id: StoreId;
  name: string;
  role: 
- 生产中
- 已出炉

