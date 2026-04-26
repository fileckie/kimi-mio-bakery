import { Printer, Store } from "lucide-react";
import type { Order, StoreLocation } from "../../types";

interface Props {
  orders: Order[];
  stores: StoreLocation[];
}

export function PickupSheetPrint({ orders, stores }: Props) {
  const printStoreSheet = (store: StoreLocation) => {
    const storeOrders = orders.filter(
      (o) => o.pickupStoreId === store.id && o.deliveryMethod === "门店自提" && o.status !== "已完成"
    );
    if (storeOrders.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html><head><title>自提单-${store.name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Zhi+Mang+Xing&family=Long+Cang&display=swap" rel="stylesheet">
      <style>
        @page { margin: 10mm; size: A4 portrait; }
        body { font-family: Inter, sans-serif; padding: 14px 18px; color: #1E1712; background: #FAF6F0; }
        h1 { margin: 0; font-family: 'Zhi Mang Xing', cursive; font-size: 26px; color: #1E1712; }
        .meta { font-family: 'Long Cang', cursive; color: #7A6E62; font-size: 14px; margin: 5px 0 10px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; page-break-inside: avoid; }
        th { text-align: left; border-bottom: 2px solid #1E1712; padding: 5px 3px; font-size: 11px; font-weight: 600; }
        td { padding: 6px 3px; border-bottom: 1px solid #E2D5C5; vertical-align: top; }
        .code { font-family: monospace; font-weight: bold; font-size: 18px; color: #E84A2E; letter-spacing: 1px; }
        .status { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
        .pickup { background: #dbeafe; color: #1e40af; }
        .done { background: #dcfce7; color: #166534; }
        .check { width: 20px; height: 20px; border: 2px solid #1E1712; display: inline-block; border-radius: 3px; }
        .seal { display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; border: 2.5px solid #E84A2E; border-radius: 8px; color: #E84A2E; font-family: 'Zhi Mang Xing', cursive; font-size: 24px; margin-top: 16px; }
        tr { page-break-inside: avoid; }
      </style></head><body>
      <h1>Mio 自提名单 · ${store.name}</h1>
      <div class="meta">${store.address} · 共 ${storeOrders.length} 单</div>
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
              <td><span class="code">${o.pickupCode}</span></td>
              <td>${o.customerName || o.receiver || "-"}</td>
              <td>${o.customerPhone || o.phone || "-"}</td>
              <td>${o.items.map(i => i.name + "×" + i.qty).join(" / ")}</td>
              <td><span class="check"></span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div style="text-align:center;">
        <div class="seal">窑烤</div>
      </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-4 print:hidden">
      <h3 className="text-xl font-semibold text-kiln flex items-center gap-2">
        <Store className="h-5 w-5 text-ember" />
        门店自提单
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-1">
        {stores.map((store) => {
          const storeOrders = orders.filter(
            (o) => o.pickupStoreId === store.id && o.deliveryMethod === "门店自提" && o.status !== "已完成"
          );
          if (storeOrders.length === 0) return null;

          return (
            <div key={store.id} className="rounded-2xl border border-border bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                <div>
                  <p className="font-semibold text-kiln">{store.name}</p>
                  <p className="text-xs text-muted">{storeOrders.length} 单待自提</p>
                </div>
                <button
                  onClick={() => printStoreSheet(store)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-kiln px-3 py-1.5 text-xs font-semibold text-ash hover:bg-kiln-light transition"
                >
                  <Printer className="h-3 w-3" />
                  打印
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {storeOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-lg bg-ash p-3 text-sm">
                    <div>
                      <p className="font-semibold text-kiln">
                        {o.customerName || "顾客"} · <span className="font-mono text-ember">{o.pickupCode}</span>
                      </p>
                      <p className="text-xs text-muted mt-1">
                        {o.items.map((i) => `${i.name}×${i.qty}`).join(" / ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
