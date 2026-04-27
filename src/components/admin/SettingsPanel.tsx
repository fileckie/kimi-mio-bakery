import { Plus, X, QrCode } from "lucide-react";
import type { BatchSale, StoreLocation, Product } from "../../types";
import { api } from "../../lib/api";
import { readImageFile } from "../../lib/utils";

interface SettingsPanelProps {
  batchSale: BatchSale;
  stores: StoreLocation[];
  products: Product[];
  onUpdate: () => void;
}

export function SettingsPanel({ batchSale, stores, products, onUpdate }: SettingsPanelProps) {
  const updateBatch = async (patch: Partial<BatchSale>) => {
    try { await api.updateBatchSale(patch); onUpdate(); } catch { alert("保存失败"); }
  };

  const updateStore = async (id: string, patch: Partial<StoreLocation>) => {
    try { await api.updateStore(id, patch); onUpdate(); } catch { alert("保存失败"); }
  };

  const updateOvenBatch = (batchId: string, patch: { label?: string; time?: string; productIds?: string[] }) => {
    const next = batchSale.ovenBatches.map((b) => b.id === batchId ? { ...b, ...patch } : b);
    updateBatch({ ovenBatches: next });
  };

  const toggleBatchProduct = (batchId: string, productId: string) => {
    const batch = batchSale.ovenBatches.find((b) => b.id === batchId);
    if (!batch) return;
    const has = batch.productIds.includes(productId);
    updateOvenBatch(batchId, { productIds: has ? batch.productIds.filter((id) => id !== productId) : [...batch.productIds, productId] });
  };

  const addBatch = () => updateBatch({
    ovenBatches: [...batchSale.ovenBatches, { id: `batch-${Date.now()}`, label: `第${batchSale.ovenBatches.length + 1}炉`, time: "18:30", productIds: [] }],
  });

  const removeBatch = (id: string) => updateBatch({ ovenBatches: batchSale.ovenBatches.filter((b) => b.id !== id) });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="admin-panel">
        <div>
          <p className="text-sm font-semibold text-ember">批次</p>
          <h2 className="mt-1 font-brush text-3xl text-kiln">本轮预订设置</h2>
        </div>
        <div className="mt-5 space-y-4">
          <label className="flex items-center justify-between rounded-xl bg-ash p-4 cursor-pointer">
            <span>
              <span className="block font-semibold text-kiln">开放顾客下单</span>
              <span className="font-hand text-sm text-muted">关闭后只能浏览产品</span>
            </span>
            <input type="checkbox" checked={batchSale.isOpen} onChange={(e) => updateBatch({ isOpen: e.target.checked })} className="h-5 w-5 accent-ember" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-2 block text-muted">默认截单时间（如 21:30）</span>
              <input className="input-field" type="time" value={batchSale.defaultDeadline} onChange={(e) => updateBatch({ defaultDeadline: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="mb-2 block text-muted">本轮截止时间文案</span>
              <input className="input-field" value={batchSale.deadline} onChange={(e) => updateBatch({ deadline: e.target.value })} placeholder="如今晚 21:30" />
            </label>
          </div>
          <input className="input-field" value={batchSale.ovenBatch} onChange={(e) => updateBatch({ ovenBatch: e.target.value })} placeholder="出炉批次描述" />

          <div className="rounded-xl bg-ash p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-kiln">出炉批次</span>
              <button onClick={addBatch} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-soft"><Plus className="h-3 w-3" />增加</button>
            </div>
            <div className="mt-4 space-y-4">
              {batchSale.ovenBatches.map((batch) => (
                <div key={batch.id} className="rounded-xl border border-border bg-white p-3">
                  <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <input className="input-field py-2 text-sm" value={batch.label} onChange={(e) => updateOvenBatch(batch.id, { label: e.target.value })} />
                    <input className="input-field py-2 text-sm" value={batch.time} onChange={(e) => updateOvenBatch(batch.id, { time: e.target.value })} />
                    <button onClick={() => removeBatch(batch.id)} className="rounded-full bg-surface px-3 py-2 text-xs font-semibold text-muted hover:text-ember">删除</button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {products.map((p) => (
                      <button key={p.id} onClick={() => toggleBatchProduct(batch.id, p.id)} className={`rounded-full px-3 py-1 text-xs font-semibold transition ${batch.productIds.includes(p.id) ? "bg-kiln text-ash" : "bg-ash text-muted"}`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-ash p-4">
            <p className="font-semibold text-kiln">付款设置</p>
            <div className="mt-3 grid gap-3">
              <input className="input-field" value={batchSale.paymentWechatId} onChange={(e) => updateBatch({ paymentWechatId: e.target.value })} placeholder="微信号" />
              <textarea className="input-field min-h-20 resize-none" value={batchSale.paymentInstruction} onChange={(e) => updateBatch({ paymentInstruction: e.target.value })} placeholder="付款说明" />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-soft">
                <QrCode className="h-4 w-4" />上传微信二维码
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && readImageFile(e.target.files[0]).then((url) => updateBatch({ paymentQrUrl: url }))} />
              </label>
              {batchSale.paymentQrUrl && <button onClick={() => updateBatch({ paymentQrUrl: "" })} className="text-xs text-muted">移除二维码</button>}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-2 block text-muted">免运门槛</span>
              <input className="input-field" type="number" value={batchSale.freeShippingThreshold} onChange={(e) => updateBatch({ freeShippingThreshold: Number(e.target.value) })} />
            </label>
            <label className="text-sm">
              <span className="mb-2 block text-muted">基础运费</span>
              <input className="input-field" type="number" value={batchSale.baseShippingFee} onChange={(e) => updateBatch({ baseShippingFee: Number(e.target.value) })} />
            </label>
          </div>

          {/* Copy customization */}
          <div className="rounded-xl bg-ash p-4">
            <p className="font-semibold text-kiln">页面文案定制</p>
            <p className="text-xs text-muted mt-1">修改顾客端展示的文案内容</p>
            <div className="mt-3 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1.5 block text-xs text-muted">下单面板英文标题</span>
                  <input className="input-field py-2 text-sm" value={batchSale.checkoutTitle} onChange={(e) => updateBatch({ checkoutTitle: e.target.value })} />
                </label>
                <label className="text-sm">
                  <span className="mb-1.5 block text-xs text-muted">下单面板中文副标题</span>
                  <input className="input-field py-2 text-sm" value={batchSale.checkoutSubtitle} onChange={(e) => updateBatch({ checkoutSubtitle: e.target.value })} />
                </label>
              </div>
              <label className="text-sm">
                <span className="mb-1.5 block text-xs text-muted">空购物车提示</span>
                <input className="input-field py-2 text-sm" value={batchSale.checkoutEmptyHint} onChange={(e) => updateBatch({ checkoutEmptyHint: e.target.value })} />
              </label>
              <label className="text-sm">
                <span className="mb-1.5 block text-xs text-muted">截单后提示文案</span>
                <input className="input-field py-2 text-sm" value={batchSale.closedMessage} onChange={(e) => updateBatch({ closedMessage: e.target.value })} />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1.5 block text-xs text-muted">会员区英文标签</span>
                  <input className="input-field py-2 text-sm" value={batchSale.memberLabel} onChange={(e) => updateBatch({ memberLabel: e.target.value })} />
                </label>
                <label className="text-sm">
                  <span className="mb-1.5 block text-xs text-muted">会员区提示文案</span>
                  <input className="input-field py-2 text-sm" value={batchSale.memberHint} onChange={(e) => updateBatch({ memberHint: e.target.value })} />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1.5 block text-xs text-muted">成功弹窗英文标题</span>
                  <input className="input-field py-2 text-sm" value={batchSale.successTitle} onChange={(e) => updateBatch({ successTitle: e.target.value })} />
                </label>
                <label className="text-sm">
                  <span className="mb-1.5 block text-xs text-muted">成功弹窗底部文案</span>
                  <input className="input-field py-2 text-sm" value={batchSale.successMessage} onChange={(e) => updateBatch({ successMessage: e.target.value })} />
                </label>
              </div>
              <label className="text-sm">
                <span className="mb-1.5 block text-xs text-muted">页脚标语</span>
                <input className="input-field py-2 text-sm" value={batchSale.footerTagline} onChange={(e) => updateBatch({ footerTagline: e.target.value })} />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <div>
          <p className="text-sm font-semibold text-ember">门店</p>
          <h2 className="mt-1 font-brush text-3xl text-kiln">门店与账号</h2>
        </div>
        <div className="mt-5 grid gap-3">
          {stores.map((s) => (
            <div key={s.id} className="rounded-xl bg-ash p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase">{s.id}</span>
                <span className="rounded-full bg-white px-3 py-1 text-xs text-muted">{s.role === "central" ? "中央厨房" : "自提点"}</span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1.2fr_auto] md:items-center">
                <input className="input-field" value={s.name} onChange={(e) => updateStore(s.id, { name: e.target.value })} placeholder="门店名称" />
                <input className="input-field" value={s.address} onChange={(e) => updateStore(s.id, { address: e.target.value })} placeholder="地址" />
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                  <input type="checkbox" checked={s.pickupOpen} onChange={(e) => updateStore(s.id, { pickupOpen: e.target.checked })} className="h-4 w-4 accent-ember" />
                  开放
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
