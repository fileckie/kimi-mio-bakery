import { Printer, PackageCheck } from "lucide-react";
import type { ProductionSheet, StoreLocation, BatchSale } from "../../types";
import { getStoreName } from "../../lib/utils";

interface Props {
  sheet: ProductionSheet;
  stores: StoreLocation[];
  batchSale: BatchSale;
}

export function ProductionSheetPrint({ sheet, stores, batchSale }: Props) {
  const handlePrint = () => window.print();

  // Group by category
  const byCategory: Record<string, typeof sheet.items> = {};
  for (const item of sheet.items) {
    byCategory[item.category] ??= [];
    byCategory[item.category].push(item);
  }

  const printSortSheet = (store: StoreLocation) => {
    const storeItems = sheet.items
      .map((item) => {
        const qty = item.storeBreakdown[store.id] || 0;
        return qty > 0 ? { ...item, qty } : null;
      })
      .filter(Boolean) as (typeof sheet.items[0] & { qty: number })[];

    if (storeItems.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html><head><title>分拣单-${store.name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Zhi+Mang+Xing&family=Long+Cang&display=swap" rel="stylesheet">
      <style>
        @page { margin: 12mm; size: A4; }
        body { font-family: Inter, sans-serif; padding: 24px; color: #1E1712; background: #FAF6F0; }
        h1 { margin: 0; font-family: 'Zhi Mang Xing', cursive; font-size: 32px; color: #1E1712; }
        .meta { font-family: 'Long Cang', cursive; color: #7A6E62; font-size: 15px; margin: 8px 0 16px; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; border-bottom: 2px solid #1E1712; padding: 8px 0; font-size: 14px; font-weight: 600; }
        td { padding: 8px 0; border-bottom: 1px solid #E2D5C5; font-size: 16px; }
        .total { font-weight: bold; font-size: 18px; margin-top: 16px; border-top: 2px solid #1E1712; padding-top: 8px; }
        .check { width: 24px; height: 24px; border: 2px solid #1E1712; display: inline-block; border-radius: 3px; }
        .seal { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border: 2.5px solid #E84A2E; border-radius: 8px; color: #E84A2E; font-family: 'Zhi Mang Xing', cursive; font-size: 26px; margin-top: 24px; }
      </style></head><body>
      <h1>Mio 分拣单</h1>
      <div class="meta">${store.name} · ${store.address} · 取货码 ${store.sourceCode}</div>
      <table>
        <thead><tr><th>面包</th><th>数量</th><th>核对</th></tr></thead>
        <tbody>
          ${storeItems.map(i => `<tr><td>${i.name}</td><td>${i.qty} 个</td><td><span class="check"></span></td></tr>`).join("")}
        </tbody>
      </table>
      <div class="total">总计: ${storeItems.reduce((s, i) => s + i.qty, 0)} 个</div>
      <div class="seal">窑烤</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Screen controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <p className="text-sm font-semibold text-ember">生产单</p>
          <h2 className="mt-1 font-brush text-3xl text-kiln">{sheet.id}</h2>
          <p className="mt-1 text-sm text-muted">
            生成于 {new Date(sheet.createdAt).toLocaleString("zh-CN")} · 共 {sheet.totalItems} 个面包 · {sheet.status}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-full bg-kiln px-5 py-2.5 text-sm font-semibold text-ash hover:bg-kiln-light transition"
          >
            <Printer className="h-4 w-4" />
            打印生产单
          </button>
        </div>
      </div>

      {/* Print-only header */}
      <div className="hidden print:block text-center border-b-2 border-kiln pb-4 mb-4">
        <h1 className="font-brush text-4xl text-kiln">Mio 制作单</h1>
        <p className="mt-1 font-hand text-lg">{batchSale.ovenBatch || "今日出炉"}</p>
        <p className="text-sm text-muted">生产单号: {sheet.id}</p>
        <p className="text-sm text-muted">
          截单时间: {new Date(sheet.createdAt).toLocaleString("zh-CN")}
        </p>
      </div>

      {/* Production sheet content */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-soft print:shadow-none print:border-2 print:border-kiln print:bg-white">
        {/* Summary bar */}
        <div className="flex flex-wrap items-center gap-4 border-b border-border pb-4 mb-4">
          <div className="rounded-xl bg-ash px-4 py-2">
            <span className="text-xs text-muted">总数量</span>
            <p className="text-xl font-bold text-kiln">{sheet.totalItems} 个</p>
          </div>
          <div className="rounded-xl bg-ash px-4 py-2">
            <span className="text-xs text-muted">品类数</span>
            <p className="text-xl font-bold text-kiln">{sheet.items.length} 款</p>
          </div>
          <div className="rounded-xl bg-ash px-4 py-2">
            <span className="text-xs text-muted">状态</span>
            <p className="text-xl font-bold text-kiln">{sheet.status}</p>
          </div>
        </div>

        {/* By category */}
        {Object.entries(byCategory).map(([category, items]) => (
          <div key={category} className="mb-6">
            <h3 className="text-lg font-semibold text-kiln mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-ember" />
              {category}
            </h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between rounded-xl bg-ash p-3 print:bg-white print:border print:border-border"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-kiln text-lg">{item.name}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted">
                      {Object.entries(item.storeBreakdown).map(([storeId, qty]) => (
                        <span key={storeId} className="rounded-full bg-white px-2 py-0.5 border border-border">
                          {getStoreName(stores, storeId as any)} {qty}个
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-ember">{item.totalQty}</p>
                    <p className="text-xs text-muted">个</p>
                  </div>
                  {/* Print checkbox */}
                  <div className="hidden print:block ml-4">
                    <div className="h-6 w-6 rounded border-2 border-kiln" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Print signature area */}
        <div className="hidden print:block mt-8 pt-6 border-t-2 border-kiln">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="font-hand text-sm font-semibold">和面/发酵</p>
              <div className="mt-8 border-b border-kiln mx-4" />
              <p className="text-xs text-muted mt-1">签名</p>
            </div>
            <div>
              <p className="font-hand text-sm font-semibold">整形</p>
              <div className="mt-8 border-b border-kiln mx-4" />
              <p className="text-xs text-muted mt-1">签名</p>
            </div>
            <div>
              <p className="font-hand text-sm font-semibold">出炉确认</p>
              <div className="mt-8 border-b border-kiln mx-4" />
              <p className="text-xs text-muted mt-1">签名</p>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <div className="print-seal">窑烤</div>
          </div>
        </div>
      </div>

      {/* Store sorting sheets */}
      <div className="print:hidden">
        <h3 className="text-xl font-semibold text-kiln mb-4 flex items-center gap-2">
          <PackageCheck className="h-5 w-5 text-ember" />
          门店分拣单
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {stores.map((store) => {
            const storeItems = sheet.items
              .map((item) => {
                const qty = item.storeBreakdown[store.id] || 0;
                return qty > 0 ? { ...item, qty } : null;
              })
              .filter(Boolean) as (typeof sheet.items[0] & { qty: number })[];

            if (storeItems.length === 0) return null;

            return (
              <div
                key={store.id}
                className="rounded-2xl border border-border bg-white p-5 shadow-soft"
              >
                <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                  <div>
                    <p className="font-semibold text-kiln">{store.name}</p>
                    <p className="text-xs text-muted">{store.address}</p>
                  </div>
                  <button
                    onClick={() => printSortSheet(store)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-kiln px-3 py-1.5 text-xs font-semibold text-ash hover:bg-kiln-light transition"
                  >
                    <Printer className="h-3 w-3" />
                    打印
                  </button>
                </div>
                <div className="space-y-2">
                  {storeItems.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between text-sm">
                      <span className="text-kiln">{item.name}</span>
                      <span className="font-bold text-ember">{item.qty} 个</span>
                    </div>
                  ))}
                  <div className="mt-3 border-t border-border pt-2 flex justify-between font-semibold text-kiln">
                    <span>合计</span>
                    <span>{storeItems.reduce((s, i) => s + i.qty, 0)} 个</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
