import { useState } from "react";
import { Printer, PackageCheck, ChefHat, CheckCircle, Flame, Circle, Save, Pencil, X, AlertTriangle } from "lucide-react";
import type { ProductionSheet, StoreLocation, BatchSale } from "../../types";
import { getStoreName } from "../../lib/utils";
import { api } from "../../lib/api";
import { useUIStore } from "../../stores/uiStore";

interface Props {
  sheet: ProductionSheet;
  stores: StoreLocation[];
  batchSale: BatchSale;
  onUpdate?: () => void;
}

export function ProductionSheetPrint({ sheet, stores, batchSale, onUpdate }: Props) {
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState(sheet.items);
  const [shortage, setShortage] = useState<{ name: string; original: number; current: number; diff: number }[]>([]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      await api.updateProductionSheetStatus(sheet.id, status);
      useUIStore.getState().addToast({ type: "success", message: `生产单已标记为「${status}」` });
      onUpdate?.();
    } catch {
      alert("状态更新失败");
    }
    setUpdating(false);
  };

  const handleQtyChange = (productId: string, rawValue: string) => {
    const newQty = Math.max(0, parseInt(rawValue, 10) || 0);
    setEditItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const oldTotal = item.totalQty;
        const ratio = oldTotal > 0 ? newQty / oldTotal : 1;
        const newBreakdown: Record<string, number> = {};
        for (const [sid, qty] of Object.entries(item.storeBreakdown)) {
          newBreakdown[sid] = Math.max(0, Math.round(qty * ratio));
        }
        // fix rounding diff
        const breakdownTotal = Object.values(newBreakdown).reduce((a, b) => a + b, 0);
        const diff = newQty - breakdownTotal;
        if (diff !== 0 && Object.keys(newBreakdown).length > 0) {
          const firstKey = Object.keys(newBreakdown)[0];
          newBreakdown[firstKey] = Math.max(0, newBreakdown[firstKey] + diff);
        }
        return { ...item, totalQty: newQty, storeBreakdown: newBreakdown };
      })
    );
  };

  const saveItems = async () => {
    setUpdating(true);
    try {
      const payload = editItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        category: item.category,
        totalQty: item.totalQty,
        storeBreakdown: item.storeBreakdown,
      }));
      await api.updateProductionSheetItems(sheet.id, payload);
      useUIStore.getState().addToast({ type: "success", message: "数量已更新" });
      // Check for shortages
      const shortages = payload
        .map((item) => {
          const original = sheet.items.find((i) => i.productId === item.productId)?.totalQty || 0;
          if (item.totalQty < original) {
            return { name: item.name, original, current: item.totalQty, diff: original - item.totalQty };
          }
          return null;
        })
        .filter(Boolean) as { name: string; original: number; current: number; diff: number }[];
      setShortage(shortages);
      onUpdate?.();
      setIsEditing(false);
    } catch {
      alert("更新失败");
    }
    setUpdating(false);
  };

  const cancelEdit = () => {
    setEditItems(sheet.items);
    setIsEditing(false);
  };

  const statusSteps = [
    { status: "生产中", icon: Circle, label: "生产中" },
    { status: "已出炉", icon: Flame, label: "已出炉" },
    { status: "已完成", icon: CheckCircle, label: "已完成" },
  ];
  const currentStepIndex = statusSteps.findIndex((s) => s.status === sheet.status);

  // Group by category
  const byCategory: Record<string, typeof editItems> = {};
  for (const item of editItems) {
    byCategory[item.category] ??= [];
    byCategory[item.category].push(item);
  }

  const totalItems = editItems.reduce((s, i) => s + i.totalQty, 0);

  // Print helpers use current editItems for consistency
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const primaryColor = batchSale.printPrimaryColor || "#E84A2E";
    const logoHtml = batchSale.printLogoUrl ? `<img src="${batchSale.printLogoUrl}" style="height:40px;margin-bottom:6px;" />` : "";

    let tableRows = "";
    Object.entries(byCategory).forEach(([category, items]) => {
      items.forEach((item, idx) => {
        tableRows += `
          <tr>
            ${idx === 0 ? `<td rowspan="${items.length}" style="vertical-align:top;font-weight:600;width:80px;">${category}</td>` : ""}
            <td>${item.name}</td>
            <td style="text-align:center;font-weight:bold;color:${primaryColor};">${item.totalQty}</td>
            <td style="text-align:center;"><span class="check"></span></td>
          </tr>
        `;
      });
    });

    printWindow.document.write(`
      <html><head><title>制作单-${sheet.id}</title>
      <link href="https://fonts.googleapis.com/css2?family=Zhi+Mang+Xing&family=Long+Cang&display=swap" rel="stylesheet">
      <style>
        @page { margin: 8mm; size: A4 portrait; }
        * { box-sizing: border-box; }
        body { font-family: Inter, sans-serif; padding: 10px 14px; color: #1E1712; background: #FAF6F0; margin: 0; }
        .header { text-align: center; border-bottom: 2px solid #1E1712; padding-bottom: 8px; margin-bottom: 10px; }
        h1 { margin: 0; font-family: 'Zhi Mang Xing', cursive; font-size: 26px; color: #1E1712; }
        .meta { font-family: 'Long Cang', cursive; color: #7A6E62; font-size: 13px; margin-top: 4px; }
        .summary { display: flex; gap: 16px; margin-bottom: 10px; font-size: 13px; }
        .summary span { color: #7A6E62; }
        .summary strong { color: #1E1712; margin-left: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; border-bottom: 2px solid #1E1712; padding: 4px 2px; font-size: 12px; font-weight: 600; }
        td { padding: 4px 2px; border-bottom: 1px solid #E2D5C5; }
        tr { page-break-inside: avoid; }
        .check { width: 18px; height: 18px; border: 1.5px solid #1E1712; display: inline-block; border-radius: 2px; }
        .total { font-weight: bold; font-size: 15px; margin-top: 8px; border-top: 2px solid #1E1712; padding-top: 6px; display: flex; justify-content: space-between; }
        .signatures { display: flex; gap: 24px; margin-top: 14px; padding-top: 10px; border-top: 1px solid #E2D5C5; }
        .sign-box { flex: 1; text-align: center; }
        .sign-box p { margin: 0 0 2px; font-size: 12px; font-weight: 600; }
        .sign-line { border-bottom: 1px solid #1E1712; height: 28px; }
        .seal { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border: 2px solid ${primaryColor}; border-radius: 6px; color: ${primaryColor}; font-family: 'Zhi Mang Xing', cursive; font-size: 20px; margin-top: 10px; }
      </style></head><body>
      <div class="header">
        ${logoHtml}
        <h1>Mio 制作单</h1>
        <div class="meta">${batchSale.ovenBatch || "今日出炉"} · 单号 ${sheet.id} · ${new Date(sheet.createdAt).toLocaleString("zh-CN")}</div>
      </div>
      <div class="summary">
        <div><span>总数量</span><strong>${totalItems} 个</strong></div>
        <div><span>品类数</span><strong>${editItems.length} 款</strong></div>
        <div><span>状态</span><strong>${sheet.status}</strong></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>品类</th>
            <th>面包</th>
            <th style="text-align:center;width:60px;">数量</th>
            <th style="text-align:center;width:50px;">核对</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <div class="total">
        <span>合计</span>
        <span>${totalItems} 个</span>
      </div>
      <div class="signatures">
        <div class="sign-box">
          <p>和面/发酵</p>
          <div class="sign-line"></div>
        </div>
        <div class="sign-box">
          <p>整形</p>
          <div class="sign-line"></div>
        </div>
        <div class="sign-box">
          <p>出炉确认</p>
          <div class="sign-line"></div>
        </div>
      </div>
      <div style="text-align:center;">
        <div class="seal">窑烤</div>
      </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const printSortSheet = (store: StoreLocation) => {
    const storeItems = editItems
      .map((item) => {
        const qty = item.storeBreakdown[store.id] || 0;
        return qty > 0 ? { ...item, qty } : null;
      })
      .filter(Boolean) as (typeof editItems[0] & { qty: number })[];

    if (storeItems.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const primaryColor = batchSale.printPrimaryColor || "#E84A2E";

    printWindow.document.write(`
      <html><head><title>分拣单-${store.name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Zhi+Mang+Xing&family=Long+Cang&display=swap" rel="stylesheet">
      <style>
        @page { margin: 10mm; size: A4 portrait; }
        body { font-family: Inter, sans-serif; padding: 16px 20px; color: #1E1712; background: #FAF6F0; }
        h1 { margin: 0; font-family: 'Zhi Mang Xing', cursive; font-size: 32px; color: #1E1712; }
        .meta { font-family: 'Long Cang', cursive; color: #7A6E62; font-size: 16px; margin: 8px 0 18px; }
        table { width: 100%; border-collapse: collapse; page-break-inside: avoid; }
        th { text-align: left; border-bottom: 2px solid #1E1712; padding: 8px 0; font-size: 14px; font-weight: 600; }
        td { padding: 8px 0; border-bottom: 1px solid #E2D5C5; font-size: 17px; }
        .total { font-weight: bold; font-size: 18px; margin-top: 14px; border-top: 2px solid #1E1712; padding-top: 8px; }
        .check { width: 24px; height: 24px; border: 2px solid #1E1712; display: inline-block; border-radius: 3px; }
        .seal { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border: 2.5px solid ${primaryColor}; border-radius: 8px; color: ${primaryColor}; font-family: 'Zhi Mang Xing', cursive; font-size: 26px; margin-top: 24px; }
        tr { page-break-inside: avoid; }
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
      <div style="text-align:center;"><div class="seal">窑烤</div></div>
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
            生成于 {new Date(sheet.createdAt).toLocaleString("zh-CN")} · 共 {totalItems} 个面包 · {sheet.status}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-full bg-kiln px-5 py-2.5 text-sm font-semibold text-ash hover:bg-kiln-light transition"
          >
            <Printer className="h-4 w-4" />
            打印 A4 生产单
          </button>
        </div>
      </div>

      {/* Status flow */}
      <div className="print:hidden rounded-2xl border border-border bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold text-kiln mb-3">生产状态</p>
        <div className="flex items-center gap-2">
          {statusSteps.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = idx === currentStepIndex;
            const isPast = idx < currentStepIndex;
            return (
              <div key={step.status} className="flex items-center gap-2">
                <button
                  onClick={() => updateStatus(step.status)}
                  disabled={updating}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isCurrent
                      ? "bg-ember text-white shadow-soft"
                      : isPast
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-ash text-muted border border-border hover:bg-ash/80"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {step.label}
                </button>
                {idx < statusSteps.length - 1 && (
                  <div className={`h-0.5 w-6 ${isPast ? "bg-green-400" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Baker-friendly summary view with editable quantities */}
      {/* Shortage alert */}
      {shortage.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-soft print:hidden">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-700">缺货提醒</h3>
          </div>
          <p className="text-sm text-red-600 mb-3">以下商品生产数量少于原始订单，请主动联系受影响的顾客。</p>
          <div className="space-y-2">
            {shortage.map((s) => (
              <div key={s.name} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm border border-red-100">
                <span className="font-semibold text-red-800">{s.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted">原 {s.original} 个</span>
                  <span className="text-red-600 font-bold">→ 现 {s.current} 个</span>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">少 {s.diff} 个</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-white p-6 shadow-soft print:hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-ember" />
            <h3 className="text-xl font-semibold text-kiln">面包师汇总</h3>
          </div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={saveItems}
                disabled={updating}
                className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                保存
              </button>
              <button
                onClick={cancelEdit}
                disabled={updating}
                className="inline-flex items-center gap-1.5 rounded-full bg-ash px-4 py-2 text-sm font-semibold text-muted border border-border hover:bg-stone-200 transition"
              >
                <X className="h-4 w-4" />
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-ember/10 px-4 py-2 text-sm font-semibold text-ember border border-ember/20 hover:bg-ember/20 transition"
            >
              <Pencil className="h-4 w-4" />
              编辑数量
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4 border-b border-border pb-4 mb-4">
          <div className="rounded-xl bg-ember/5 px-5 py-3 border border-ember/10">
            <span className="text-xs text-muted">总数量</span>
            <p className="text-3xl font-bold text-ember">{totalItems}</p>
          </div>
          <div className="rounded-xl bg-ash px-5 py-3">
            <span className="text-xs text-muted">品类数</span>
            <p className="text-2xl font-bold text-kiln">{editItems.length}</p>
          </div>
        </div>

        {Object.entries(byCategory).map(([category, items]) => (
          <div key={category} className="mb-5">
            <h4 className="text-sm font-semibold text-muted tracking-wider uppercase mb-2">{category}</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between rounded-xl bg-ash px-4 py-3"
                >
                  <span className="font-semibold text-kiln text-lg">{item.name}</span>
                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <input
                        type="number"
                        min={0}
                        value={item.totalQty}
                        onChange={(e) => handleQtyChange(item.productId, e.target.value)}
                        className="w-20 rounded-lg border border-border bg-white px-2 py-1 text-right text-lg font-bold text-ember focus:border-ember focus:outline-none"
                      />
                    ) : (
                      <span className="text-lg font-bold text-ember">{item.totalQty} 个</span>
                    )}
                    <div className="h-6 w-6 rounded border-2 border-kiln/30" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Production sheet content — screen view only, not printed directly */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-soft print:hidden">
        {/* Summary bar */}
        <div className="flex flex-wrap items-center gap-4 border-b border-border pb-4 mb-4">
          <div className="rounded-xl bg-ash px-4 py-2">
            <span className="text-xs text-muted">总数量</span>
            <p className="text-xl font-bold text-kiln">{totalItems} 个</p>
          </div>
          <div className="rounded-xl bg-ash px-4 py-2">
            <span className="text-xs text-muted">品类数</span>
            <p className="text-xl font-bold text-kiln">{editItems.length} 款</p>
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
                  className="flex items-center justify-between rounded-xl bg-ash p-3"
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
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Store sorting sheets */}
      <div className="print:hidden">
        <h3 className="text-xl font-semibold text-kiln mb-4 flex items-center gap-2">
          <PackageCheck className="h-5 w-5 text-ember" />
          门店分拣单
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {stores.map((store) => {
            const storeItems = editItems
              .map((item) => {
                const qty = item.storeBreakdown[store.id] || 0;
                return qty > 0 ? { ...item, qty } : null;
              })
              .filter(Boolean) as (typeof editItems[0] & { qty: number })[];

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
