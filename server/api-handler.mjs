import {
  authenticateCustomer,
  batchUpdateOrderStatus,
  closeBatchAndCreateSheet,
  createProduct,
  createStore,
  findOrderByCode,
  getBatchSale,
  getBootstrap,
  getCustomers,
  getCustomerOrders,
  getOrder,
  getProductPrices,
  getProductionSheet,
  getProductionSheets,
  getOrders,
  getChangelog,
  createChangelogEntry,
  insertOrder,
  loginCustomer,
  registerCustomer,
  updateBatchSale,
  updateInventory,
  updateOrderFulfillment,
  updateOrderStatus,
  updateProduct,
  updateProductionSheetItem,
  updateProductionSheetItems,
  updateProductionSheetStatus,
  updateStore,
} from "./db.mjs";
import { listBackups, backupDatabase } from "./backup.mjs";

export async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/bootstrap") {
    sendJson(res, 200, getBootstrap());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/admin/dashboard") {
    sendJson(res, 200, { ...getBootstrap(), orders: getOrders() });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/orders/lookup") {
    const order = findOrderByCode(url.searchParams.get("code"));
    sendJson(res, order ? 200 : 404, order ?? { error: "没有找到订单，请检查订单号或取货码" });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/customers/register") {
    sendJson(res, 201, registerCustomer(await readJson(req)));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/customers/login") {
    sendJson(res, 200, loginCustomer(await readJson(req)));
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/admin/login") {
    const { username, password } = await readJson(req);
    if (username === "1" && password === "1") {
      sendJson(res, 200, { token: "mio-admin-" + Date.now(), message: "登录成功" });
    } else {
      sendJson(res, 401, { error: "账号或密码错误" });
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/customers/authenticate") {
    sendJson(res, 200, authenticateCustomer(await readJson(req)));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/admin/customers") {
    sendJson(res, 200, getCustomers());
    return;
  }

  const customerOrdersMatch = url.pathname.match(/^\/api\/customers\/([^/]+)\/orders$/);
  if (req.method === "GET" && customerOrdersMatch) {
    const orders = getCustomerOrders(decodeURIComponent(customerOrdersMatch[1]));
    sendJson(res, 200, orders);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/orders/batch-status") {
    const { ids, status } = await readJson(req);
    const result = batchUpdateOrderStatus(ids, status);
    sendJson(res, 200, result);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/orders") {
    const body = await readJson(req);
    const batchSale = getBatchSale();
    if (!batchSale.isOpen) {
      sendJson(res, 409, { error: "本轮预订未开放" });
      return;
    }
    const order = buildOrder({ ...body, type: "online" }, batchSale);
    insertOrder(order);
    sendJson(res, 201, { order, inventory: getBootstrap().inventory });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/pos-orders") {
    const body = await readJson(req);
    const order = buildOrder(
      { ...body, type: "pos", deliveryMethod: "门店自提", shippingFee: 0, status: "已完成" },
      getBatchSale(),
    );
    insertOrder(order);
    sendJson(res, 201, { order, inventory: getBootstrap().inventory });
    return;
  }

  const orderMatch = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
  if (req.method === "GET" && orderMatch) {
    const order = getOrder(decodeURIComponent(orderMatch[1]));
    sendJson(res, order ? 200 : 404, order ?? { error: "订单不存在" });
    return;
  }

  const productMatch = url.pathname.match(/^\/api\/admin\/products\/([^/]+)$/);
  if (req.method === "PATCH" && productMatch) {
    const product = updateProduct(decodeURIComponent(productMatch[1]), await readJson(req));
    sendJson(res, product ? 200 : 404, product ?? { error: "商品不存在" });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/products") {
    const result = createProduct(await readJson(req));
    sendJson(res, 201, result);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/stores") {
    const store = createStore(await readJson(req));
    sendJson(res, 201, store);
    return;
  }

  const storeMatch = url.pathname.match(/^\/api\/admin\/stores\/([^/]+)$/);
  if (req.method === "PATCH" && storeMatch) {
    const store = updateStore(decodeURIComponent(storeMatch[1]), await readJson(req));
    sendJson(res, store ? 200 : 404, store ?? { error: "门店不存在" });
    return;
  }

  if (req.method === "PATCH" && url.pathname === "/api/admin/batch-sale") {
    sendJson(res, 200, updateBatchSale(await readJson(req)));
    return;
  }

  if (req.method === "PATCH" && url.pathname === "/api/admin/inventory") {
    const { productId, storeId, allocated } = await readJson(req);
    sendJson(res, 200, updateInventory(productId, storeId, allocated));
    return;
  }

  const statusMatch = url.pathname.match(/^\/api\/admin\/orders\/([^/]+)\/status$/);
  if (req.method === "PATCH" && statusMatch) {
    const { status } = await readJson(req);
    const order = updateOrderStatus(decodeURIComponent(statusMatch[1]), status);
    sendJson(res, order ? 200 : 404, order ?? { error: "订单不存在" });
    return;
  }

  const cancelMatch = url.pathname.match(/^\/api\/orders\/([^/]+)\/cancel$/);
  if (req.method === "POST" && cancelMatch) {
    try {
      const order = cancelOrder(decodeURIComponent(cancelMatch[1]));
      sendJson(res, 200, order);
    } catch (e) {
      sendJson(res, 400, { error: e.message });
    }
    return;
  }

  const fulfillmentMatch = url.pathname.match(/^\/api\/admin\/orders\/([^/]+)\/fulfillment$/);
  if (req.method === "PATCH" && fulfillmentMatch) {
    const order = updateOrderFulfillment(decodeURIComponent(fulfillmentMatch[1]), await readJson(req));
    sendJson(res, order ? 200 : 404, order ?? { error: "订单不存在" });
    return;
  }

  // Production sheets
  if (req.method === "POST" && url.pathname === "/api/admin/close-batch") {
    const sheet = closeBatchAndCreateSheet();
    sendJson(res, 201, { sheet, batchSale: getBatchSale(), orders: getOrders() });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/admin/production-sheets") {
    sendJson(res, 200, getProductionSheets());
    return;
  }

  const sheetMatch = url.pathname.match(/^\/api\/admin\/production-sheets\/([^/]+)$/);
  if (req.method === "GET" && sheetMatch) {
    const sheet = getProductionSheet(decodeURIComponent(sheetMatch[1]));
    sendJson(res, sheet ? 200 : 404, sheet ?? { error: "生产单不存在" });
    return;
  }

  const sheetStatusMatch = url.pathname.match(/^\/api\/admin\/production-sheets\/([^/]+)\/status$/);
  if (req.method === "PATCH" && sheetStatusMatch) {
    const { status } = await readJson(req);
    const sheet = updateProductionSheetStatus(decodeURIComponent(sheetStatusMatch[1]), status);
    sendJson(res, sheet ? 200 : 404, sheet ?? { error: "生产单不存在" });
    return;
  }

  const sheetItemMatch = url.pathname.match(/^\/api\/admin\/production-sheets\/([^/]+)\/items\/([^/]+)$/);
  if (req.method === "PATCH" && sheetItemMatch) {
    const { totalQty } = await readJson(req);
    const sheet = updateProductionSheetItem(decodeURIComponent(sheetItemMatch[1]), decodeURIComponent(sheetItemMatch[2]), totalQty);
    sendJson(res, sheet ? 200 : 404, sheet ?? { error: "生产单项不存在" });
    return;
  }

  const sheetItemsMatch = url.pathname.match(/^\/api\/admin\/production-sheets\/([^/]+)\/items$/);
  if (req.method === "PATCH" && sheetItemsMatch) {
    const { items } = await readJson(req);
    const sheet = updateProductionSheetItems(decodeURIComponent(sheetItemsMatch[1]), items);
    sendJson(res, sheet ? 200 : 404, sheet ?? { error: "生产单不存在" });
    return;
  }

  // ── Backups ──
  if (req.method === "GET" && url.pathname === "/api/admin/backups") {
    sendJson(res, 200, listBackups());
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/admin/backup") {
    try {
      const result = backupDatabase(true);
      sendJson(res, 200, result);
    } catch (e) {
      sendJson(res, 500, { error: e.message });
    }
    return;
  }

  // ── Changelog ──
  if (req.method === "GET" && url.pathname === "/api/admin/changelog") {
    sendJson(res, 200, getChangelog());
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/admin/changelog") {
    const entry = await readJson(req);
    sendJson(res, 200, createChangelogEntry(entry));
    return;
  }

  sendJson(res, 404, { error: "API 不存在" });
}

function buildOrder(body, batchSale) {
  const items = getProductPrices(body.items || []);
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const shippingFee =
    body.deliveryMethod === "门店自提" || subtotal >= batchSale.freeShippingThreshold
      ? 0
      : batchSale.baseShippingFee;
  return {
    id: body.id?.startsWith("POS") || body.type === "pos" ? makeId("POS") : makeId("MIO"),
    type: body.type || "online",
    items,
    subtotal,
    shippingFee: body.type === "pos" ? 0 : shippingFee,
    total: subtotal + (body.type === "pos" ? 0 : shippingFee),
    deliveryMethod: body.deliveryMethod || "门店自提",
    paymentMethod: body.paymentMethod || "微信支付",
    status: body.status || (body.deliveryMethod === "门店自提" ? "待生产" : "待发货"),
    customerId: body.customer?.id || body.customerId,
    customerName: body.customer?.name || body.customerName,
    customerPhone: body.customer?.phone || body.customerPhone,
    paymentStatus: body.paymentStatus || "待付款确认",
    sourceStoreId: body.sourceStoreId || body.pickupStoreId || "store-a",
    pickupStoreId: body.pickupStoreId || body.sourceStoreId || "store-a",
    receiver: body.receiver,
    phone: body.phone,
    address: body.address,
    shippingCompany: body.shippingCompany,
    trackingNumber: body.trackingNumber,
    logisticsStatus: body.logisticsStatus,
    deliveryNote: body.deliveryNote,
    pickupCode: makePickupCode(),
    createdAt: new Date().toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
}

let orderCounter = 0;
function makeId(prefix) {
  const now = new Date();
  const dateStr = `${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const timeStr = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
  orderCounter = (orderCounter + 1) % 999;
  return `${prefix}${dateStr}${timeStr}${String(orderCounter).padStart(3, "0")}`;
}

function makePickupCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
  });
  res.end(JSON.stringify(data));
}
