import { useState } from "react";
import { Printer, Flame, Clock, Calendar, PackageCheck, Eye } from "lucide-react";
import type { Order, StoreLocation, BatchSale, Product, ProductionSheet } from "../../types";
import { useAppStore } from "../../stores/appStore";
import { ProductionSheetPrint } from "./ProductionSheetPrint";

interface Props {
  orders: Order[];
  stores: StoreLocation[];
  isHq: boolean;
  batchSale?: BatchSale;
  products?: Product[];
  productionSheets: ProductionSheet[];
}

export function ProductionPanel({ orders, stores, isHq, batchSale, products, productionSheets }: Props) {
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);
  const [sheetDateFrom, setSheetDateFrom] = useState("");
  const [sheetDateTo, setSheetDateTo] = useState("");

  const safeDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

  const filteredSheets = productionSheets.filter((s) => {
    const sheetDate = safeDate(s.createdAt);
    return (!sheetDateFrom || sheetDate >= sheetDateFrom) && (!sheetDateTo || sheetDate <= sheetDateTo);
  });

  const activeSheet = productionSheets.find((s) => s.id === activeSheetId);

  if (activeSheet && batchSale) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setActiveSheetId(null)}
          className="print:hidden inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-kiln transition"
        >
          ← 返回生产记录
        </button>
        <ProductionSheetPrint sheet={activeSheet} stores={stores} batchSale={batchSale} onUpdate={() => { setActiveSheetId(null); useAppStore.getState().refreshProductionSheets(); }} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!isHq && (
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 flex items-center gap-3">
          <Eye className="h-5 w-5 text-blue-600 shrink-0" />
          <p className="text-sm text-blue-800">门店视角 · 生产单仅供查看，如需编辑请联系总部</p>
        </div>
      )}
      {/* Production sheets history */}
      {productionSheets.length > 0 && (
        <div className="admin-panel">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold text-kiln flex items-center gap-2">
              <Printer className="h-5 w-5 text-ember" />
              窑烤单记录
            </h2>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted" />
              <input type="date" className="input-field py-2 text-sm w-36" value={sheetDateFrom} onChange={(e) => setSheetDateFrom(e.target.value)} />
              <span className="text-muted text-xs">-</span>
              <input type="date" className="input-field py-2 text-sm w-36" value={sheetDateTo} onChange={(e) => setSheetDateTo(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSheets.map((sheet) => (
              <button
                key={sheet.id}
                onClick={() => setActiveSheetId(sheet.id)}
                className="text-left rounded-xl border border-border bg-ash p-4 transition hover:border-kiln hover:shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-kiln">{sheet.id}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    sheet.status === "已完成" ? "bg-green-50 text-green-700" :
                    sheet.status === "已出炉" ? "bg-amber-50 text-amber-700" :
                    "bg-blue-50 text-blue-700"
                  }`}>{sheet.status}</span>
                </div>
                <p className="mt-2 text-sm text-muted">{sheet.items.length} 款 · {sheet.totalItems} 个</p>
                <p className="mt-1 text-xs text-muted">{new Date(sheet.createdAt).toLocaleString("zh-CN")}</p>
              </button>
            ))}
          </div>
          {filteredSheets.length === 0 && (
            <p className="py-8 text-center font-hand text-muted">该日期范围内没有窑烤单</p>
          )}
        </div>
      )}
    </div>
  );
}
