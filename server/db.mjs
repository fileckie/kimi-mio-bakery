import { mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { seedBatchSale, seedOrders, seedProducts, seedStores } from "./seed.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || (process.env.VERCEL ? "/tmp/mio-bakery-data" : join(__dirname, "..", "data"));
mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(process.env.DB_PATH || join(dataDir, "mio-bakery.sqlite"));
db.exec("PRAGMA foreign_keys = ON");

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
      ovenBatch TEXT NOT NULL,
      ovenBatches TEXT NOT NULL DEFAULT '[]',
      featuredProductIds TEXT NOT NULL,
      pickupStoreIds TEXT NOT NULL,
      freeShippingThreshold INTEGER NOT NULL,
      baseShippingFee INTEGER NOT NULL,
      note TEXT NOT NULL,
      paymentWechatId TEXT NOT NULL DEFAULT 'mio220827',
      paymentQrUrl TEXT NOT NULL DEFAULT '',
      paymentInstruction TEXT NOT NULL DEFAULT '下单后请添加主理人微信，发送订购单并完成转账，后台确认后安排制作。'
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
  `);

  ensureColumn("products", "imageUrl", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("batch_sales", "ovenBatches", "TEXT NOT NULL DEFAULT '[]'");
  ensureColumn("batch_sales", "paymentWechatId", "TEXT NOT NULL DEFAULT 'mio220827'");
  ensureColumn("batch_sales", "paymentQrUrl", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("batch_sales", "paymentInstruction", "TEXT NOT NULL DEFAULT '下单后请添加主理人微信，发送订购单并完成转账，后台确认后安排制作。'");
  ensureColumn("orders", "customerId", "TEXT");
  ensureColumn("orders", "customerName", "TEXT");
  ensureColumn("orders", "customerPhone", "TEXT");
  ensureColumn("orders", "paymentStatus", "TEXT NOT NULL DEFAULT '待付款确认'");
  ensureColumn("orders", "shippingCompany", "TEXT");
  ensureColumn("orders", "trackingNumber", "TEXT");
  ensureColumn("orders", "logisticsStatus", "TEXT");
  ensureColumn("orders", "deliveryNote", "TEXT");

  const productCount = db.prepare("SELECT COUNT(*) AS count FROM products").get().count;
  if (productCount === 0) seedDb();
}

function seedDb() {
  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, name, category, weight, price, description, ingredients, imageTone, imageUrl, isPublished, featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertStore = db.prepare(`
    INSERT INTO stores VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertBatch = db.prepare(`
    INSERT INTO batch_sales (
      id, isOpen, deadline, ovenBatch, ovenBatches, featuredProductIds, pickupStoreIds,
      freeShippingThreshold, baseShippingFee, note, paymentWechatId, paymentQrUrl, paymentInstruction
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertInventory = db.prepare(`
    INSERT INTO inventory_allocations VALUES (?, ?, ?, ?)
  `);

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
  return { products, stores, batchSale, inventory, orders };
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
  if (!name || !cleanPhone || !password) throw new Error("请填写姓名、手机号和密码");
  const existing = db.prepare("SELECT * FROM customers WHERE phone = ?").get(cleanPhone);
  if (existing) throw new Error("这个手机号已经注册，请直接登录");
  const customer = {
    id: `C${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`,
    name: String(name).trim(),
    phone: cleanPhone,
    passwordHash: hashPassword(password),
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
  if (!customer || customer.passwordHash !== hashPassword(password)) {
    throw new Error("手机号或密码不正确");
  }
  return publicCustomer(customer);
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
  const current = db.prepare("SELECT * FROM batch_sales WHERE id = 'current'").get();
  const next = {
    ...current,
    ...patch,
    isOpen: patch.isOpen === undefined ? current.isOpen : Number(Boolean(patch.isOpen)),
    ovenBatches: patch.ovenBatches ? JSON.stringify(patch.ovenBatches) : current.ovenBatches,
    featuredProductIds: patch.featuredProductIds
      ? JSON.stringify(patch.featuredProductIds)
      : current.featuredProductIds,
    pickupStoreIds: patch.pickupStoreIds ? JSON.stringify(patch.pickupStoreIds) : current.pickupStoreIds,
  };
  db.prepare(`
    UPDATE batch_sales SET isOpen = ?, deadline = ?, ovenBatch = ?, ovenBatches = ?, featuredProductIds = ?,
    pickupStoreIds = ?, freeShippingThreshold = ?, baseShippingFee = ?, note = ?,
    paymentWechatId = ?, paymentQrUrl = ?, paymentInstruction = ? WHERE id = 'current'
  `).run(
    next.isOpen,
    next.deadline,
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
  );
  return mapBatchSale(db.prepare("SELECT * FROM batch_sales WHERE id = 'current'").get());
}

export function updateInventory(productId, storeId, allocated) {
  db.prepare(`
    UPDATE inventory_allocations SET allocated = ? WHERE productId = ? AND storeId = ?
  `).run(Math.max(0, Number(allocated)), productId, storeId);
  return buildInventory();
}

export function updateOrderStatus(id, status) {
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
  return getOrder(id);
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
  return mapBatchSale(db.prepare("SELECT * FROM batch_sales WHERE id = 'current'").get());
}

function buildInventory() {
  const rows = db.prepare("SELECT * FROM inventory_allocations").all();
  const inventory = {};
  for (const row of rows) {
    inventory[row.productId] ??= { centralStock: 0, stores: {}, sold: {} };
    inventory[row.productId].stores[row.storeId] = row.allocated;
    inventory[row.productId].sold[row.storeId] = row.sold;
    inventory[row.productId].centralStock += row.allocated;
  }
  return inventory;
}

function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all().map((row) => row.name);
  if (!columns.includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function normalizeProductId(value) {
  const ascii = String(value || "product")
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "");
  const base = ascii
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "product"}-${Date.now().toString(36)}`;
}

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function hashPassword(password) {
  return createHash("sha256").update(`mio-bakery:${password}`).digest("hex");
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

  const sheetId = `PS${Date.now().toString(36).toUpperCase()}`;
  const totalItems = Array.from(productMap.values()).reduce((sum, p) => sum + p.totalQty, 0);

  db.prepare("INSERT INTO production_sheets (id, batchId, createdAt, totalItems, status) VALUES (?, ?, ?, ?, ?)")
    .run(sheetId, "current", new Date().toISOString(), totalItems, "生产中");

  const insertItem = db.prepare(`
    INSERT INTO production_sheet_items (sheetId, productId, name, category, totalQty, storeBreakdown)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const [, p] of productMap) {
    insertItem.run(sheetId, p.productId, p.name, p.category, p.totalQty, JSON.stringify(storeBreakdown.get(p.productId) || {}));
  }

  // Mark orders as 待生产
  const updateOrder = db.prepare("UPDATE orders SET status = ? WHERE id = ?");
  for (const order of orders) {
    if (order.status === "待确认") {
      updateOrder.run("待生产", order.id);
    }
  }

  return getProductionSheet(sheetId);
}

export function getProductionSheet(id) {
  const sheet = db.prepare("SELECT * FROM production_sheets WHERE id = ?").get(id);
  if (!sheet) return null;
  const items = db.prepare("SELECT * FROM production_sheet_items WHERE sheetId = ? ORDER BY id").all(id);
  return {
    id: sheet.id,
    batchId: sheet.batchId,
    createdAt: sheet.createdAt,
    totalItems: sheet.totalItems,
    status: sheet.status,
    items: items.map((row) => ({
      id: row.id,
      productId: row.productId,
      name: row.name,
      category: row.category,
      totalQty: row.totalQty,
      storeBreakdown: JSON.parse(row.storeBreakdown || "{}"),
    })),
  };
}

export function getProductionSheets() {
  const sheets = db.prepare("SELECT * FROM production_sheets ORDER BY createdAt DESC").all();
  return sheets.map((sheet) => getProductionSheet(sheet.id));
}

export function updateProductionSheetStatus(id, status) {
  db.prepare("UPDATE production_sheets SET status = ? WHERE id = ?").run(status, id);
  return getProductionSheet(id);
}
