import { useState, useCallback } from "react";
import { Plus, QrCode, Save, Loader2, Store, Flame, CreditCard, Type } from "lucide-react";
import type { BatchSale, StoreLocation, Product } from "../../types";
import { api } from "../../lib/api";
import { readImageFile } from "../../lib/utils";
import { useUIStore } from "../../stores/uiStore";

interface SettingsPanelProps {
  batchSale: BatchSale;
  stores: StoreLocation[];
  products: Product[];
  onUpdate: () => void;
}

type SaveState = "idle" | "saving" | "saved";

export function SettingsPanel({ batchSale, stores, products, onUpdate }: SettingsPanelProps) {
  const addToast = useUIStore((s) => s.addToast);

  // ── Module A: Batch basics (local draft) ──
  const [batchDraft, setBatchDraft] = useState({
    isOpen: batchSale.isOpen,
    defaultDeadline: batchSale.defaultDeadline,
    deadline: batchSale.deadline,
    ovenBatch: batchSale.ovenBatch,
    freeShippingThreshold: batchSale.freeShippingThreshold,
    baseShippingFee: batchSale.baseShippingFee,
  });
  const [batchSave, setBatchSave] = useState<SaveState>("idle");

  // ── Module B: Oven batches ──
  const [batchesDraft, setBatchesDraft] = useState(batchSale.ovenBatches);
  const [batchesSave, setBatchesSave] = useState<SaveState>("idle");

  // ── Module C: Payment ──
  const [paymentDraft, setPaymentDraft] = useState({
    paymentWechatId: batchSale.paymentWechatId,
    paymentInstruction: batchSale.paymentInstruction,
    paymentQrUrl: batchSale.paymentQrUrl,
  });
  const [paymentSave, setPaymentSave] = useState<SaveState>("idle");

  // ── Module D: Copy customization ──
  const [copyDraft, setCopyDraft] = useState({
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
  const [copySave, setCopySave] = useState<SaveState>("idle");

  // ── Module E: Stores ──
  const [storesDraft, setStoresDraft] = useState<StoreLocation[]>(stores);
  const [storesSave, setStoresSave] = useState<SaveState>("idle");

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

  // Generic save helper
  const doSave = async (
    setter: (v: SaveState) => void,
    action: () => Promise<unknown>,
    label: string
  ) => {
    setter("saving");
    try {
      await action();
      setter("saved");
      addToast({ type: "success", message: `${label} 已保存` });
      onUpdate();
      setTimeout(() => setter("idle"), 1500);
    } catch {
      setter("idle");
      addToast({ type: "error", message: `${label} 保存失败，请重试` });
    }
  };

  // Save module A
  const saveBatch = () =>
    doSave(setBatchSave, () => api.updateBatchSale(batchDraft), "批次设置");

  // Save module B
  const saveBatches = () =>
    doSave(setBatchesSave, () => api.updateBatchSale({ ovenBatches: batchesDraft }), "出炉批次");

  // Save module C
  const savePayment = () =>
    doSave(setPaymentSave, () => api.updateBatchSale(paymentDraft), "付款设置");

  // Save module D
  const saveCopy = () =>
    doSave(setCopySave, () => api.updateBatchSale(copyDraft), "文案定制");

  // Save module E
  const saveStores = async () => {
    setStoresSave("saving");
    try {
      for (const s of storesDraft) {
        await api.updateStore(s.id, { name: s.name, address: s.address, pickupOpen: s.pickupOpen });
      }
      setStoresSave("saved");
      addToast({ type: "success", message: "门店设置 已保存" });
      onUpdate();
      setTimeout(() => setStoresSave("idle"), 1500);
    } catch {
      setStoresSave("idle");
      addToast({ type: "error", message: "门店设置 保存失败，请重试" });
    }
  };

  // Batch module helpers
  const addBatch = () => {
    setBatchesDraft((prev) => [
      ...prev,
      { id: `batch-${Date.now()}`, label: `第${prev.length + 1}炉`, time: "18:30", productIds: [] },
    ]);
  };
  const removeBatch = (id: string) => setBatchesDraft((prev) => prev.filter((b) => b.id !== id));
  const updateBatchField = (id: string, patch: Partial<(typeof batchesDraft)[0]>) => {
    setBatchesDraft((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };
  const toggleBatchProduct = (batchId: string, productId: string) => {
    setBatchesDraft((prev) =>
      prev.map((b) => {
        if (b.id !== batchId) return b;
        const has = b.productIds.includes(productId);
        return { ...b, productIds: has ? b.productIds.filter((id) => id !== productId) : [...b.productIds, productId] };
      })
    );
  };

  const SaveButton = ({ state, onClick }: { state: SaveState; onClick: () => void }) => {
    const base = "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition shadow-soft";
    if (state === "saved") {
      return (
        <span className={`${base} bg-green-50 text-green-700`}>
          <Save className="h-4 w-4" />已保存
        </span>
      );
    }
    if (state === "saving") {
      return (
        <span className={`${base} bg-ash text-muted cursor-not-allowed`}>
          <Loader2 className="h-4 w-4 animate-spin" />保存中...
        </span>
      );
    }
    return (
      <button onClick={onClick} className={`${base} bg-kiln text-ash hover:bg-kiln-light`}>
        <Save className="h-4 w-4" />保存
      </button>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* ── Left Column ── */}
      <div className="space-y-6">
        {/* Module A: Batch basics */}
        <div className="admin-panel">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-ember" />
              <div>
                <p className="text-sm font-semibold text-ember">批次</p>
                <h2 className="font-brush text-2xl text-kiln">本轮预订设置</h2>
              </div>
            </div>
            <SaveButton state={batchSave} onClick={saveBatch} />
          </div>

          <div className="mt-5 space-y-4">
            <label className="flex items-center justify-between rounded-xl bg-ash p-4 cursor-pointer">
              <span>
                <span className="block font-semibold text-kiln">开放顾客下单</span>
                <span className="font-hand text-sm text-muted">关闭后只能浏览产品</span>
              </span>
              <input type="checkbox" checked={batchDraft.isOpen} onChange={(e) => setBatchDraft((d) => ({ ...d, isOpen: e.target.checked }))} className="h-5 w-5 accent-ember" />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-2 block text-muted">默认截单时间</span>
                <input className="input-field" type="time" value={batchDraft.defaultDeadline} onChange={(e) => setBatchDraft((d) => ({ ...d, defaultDeadline: e.target.value }))} />
              </label>
              <label className="text-sm">
                <span className="mb-2 block text-muted">本轮截止时间文案</span>
                <input className="input-field" value={batchDraft.deadline} onChange={(e) => setBatchDraft((d) => ({ ...d, deadline: e.target.value }))} placeholder="如今晚 21:30" />
              </label>
            </div>

            <label className="text-sm">
              <span className="mb-2 block text-muted">出炉批次描述</span>
              <input className="input-field" value={batchDraft.ovenBatch} onChange={(e) => setBatchDraft((d) => ({ ...d, ovenBatch: e.target.value }))} placeholder="如明日 10:30 / 16:30 出炉" />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-2 block text-muted">免运门槛（元）</span>
                <input className="input-field" type="number" value={batchDraft.freeShippingThreshold} onChange={(e) => setBatchDraft((d) => ({ ...d, freeShippingThreshold: Number(e.target.value) }))} />
              </label>
              <label className="text-sm">
                <span className="mb-2 block text-muted">基础运费（元）</span>
                <input className="input-field" type="number" value={batchDraft.baseShippingFee} onChange={(e) => setBatchDraft((d) => ({ ...d, baseShippingFee: Number(e.target.value) }))} />
              </label>
            </div>
          </div>
        </div>

        {/* Module B: Oven batches */}
        <div className="admin-panel">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ember">炉次</p>
              <h2 className="font-brush text-2xl text-kiln">出炉批次管理</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={addBatch} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-soft border border-border hover:bg-ash transition"><Plus className="h-3 w-3" />增加</button>
              <SaveButton state={batchesSave} onClick={saveBatches} />
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {batchesDraft.map((batch) => (
              <div key={batch.id} className="rounded-xl border border-border bg-white p-3">
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <input className="input-field py-2 text-sm" value={batch.label} onChange={(e) => updateBatchField(batch.id, { label: e.target.value })} placeholder="炉次名称" />
                  <input className="input-field py-2 text-sm" value={batch.time} onChange={(e) => updateBatchField(batch.id, { time: e.target.value })} placeholder="时间" />
                  <button onClick={() => removeBatch(batch.id)} className="rounded-full bg-surface px-3 py-2 text-xs font-semibold text-muted hover:text-ember transition">删除</button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {products.map((p) => (
                    <button key={p.id} onClick={() => toggleBatchProduct(batch.id, p.id)} className={`rounded-full px-3 py-1 text-xs font-semibold transition ${batch.productIds.includes(p.id) ? "bg-kiln text-ash" : "bg-ash text-muted hover:bg-clay"}`}>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module C: Payment */}
        <div className="admin-panel">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-ember" />
              <div>
                <p className="text-sm font-semibold text-ember">付款</p>
                <h2 className="font-brush text-2xl text-kiln">付款设置</h2>
              </div>
            </div>
            <SaveButton state={paymentSave} onClick={savePayment} />
          </div>

          <div className="mt-4 grid gap-3">
            <label className="text-sm">
              <span className="mb-2 block text-muted">微信号</span>
              <input className="input-field" value={paymentDraft.paymentWechatId} onChange={(e) => setPaymentDraft((d) => ({ ...d, paymentWechatId: e.target.value }))} placeholder="mio220827" />
            </label>
            <label className="text-sm">
              <span className="mb-2 block text-muted">付款说明</span>
              <textarea className="input-field min-h-20 resize-none" value={paymentDraft.paymentInstruction} onChange={(e) => setPaymentDraft((d) => ({ ...d, paymentInstruction: e.target.value }))} placeholder="顾客下单后看到的付款指引" />
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-soft border border-border hover:bg-ash transition">
                <QrCode className="h-4 w-4" />上传微信二维码
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && readImageFile(e.target.files[0]).then((url) => setPaymentDraft((d) => ({ ...d, paymentQrUrl: url })))} />
              </label>
              {paymentDraft.paymentQrUrl && (
                <button onClick={() => setPaymentDraft((d) => ({ ...d, paymentQrUrl: "" }))} className="text-xs text-muted hover:text-ember transition">移除二维码</button>
              )}
            </div>
            {paymentDraft.paymentQrUrl && (
              <img src={paymentDraft.paymentQrUrl} alt="二维码预览" className="h-24 w-24 rounded-xl border border-border object-contain bg-white" />
            )}
          </div>
        </div>
      </div>

      {/* ── Right Column ── */}
      <div className="space-y-6">
        {/* Module D: Copy customization */}
        <div className="admin-panel">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5 text-ember" />
              <div>
                <p className="text-sm font-semibold text-ember">文案</p>
                <h2 className="font-brush text-2xl text-kiln">页面文案定制</h2>
              </div>
            </div>
            <SaveButton state={copySave} onClick={saveCopy} />
          </div>

          <div className="mt-4 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1.5 block text-xs text-muted">下单面板英文标题</span>
                <input className="input-field py-2 text-sm" value={copyDraft.checkoutTitle} onChange={(e) => setCopyDraft((d) => ({ ...d, checkoutTitle: e.target.value }))} />
              </label>
              <label className="text-sm">
                <span className="mb-1.5 block text-xs text-muted">下单面板中文副标题</span>
                <input className="input-field py-2 text-sm" value={copyDraft.checkoutSubtitle} onChange={(e) => setCopyDraft((d) => ({ ...d, checkoutSubtitle: e.target.value }))} />
              </label>
            </div>
            <label className="text-sm">
              <span className="mb-1.5 block text-xs text-muted">空购物车提示</span>
              <input className="input-field py-2 text-sm" value={copyDraft.checkoutEmptyHint} onChange={(e) => setCopyDraft((d) => ({ ...d, checkoutEmptyHint: e.target.value }))} />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-xs text-muted">截单后提示文案</span>
              <input className="input-field py-2 text-sm" value={copyDraft.closedMessage} onChange={(e) => setCopyDraft((d) => ({ ...d, closedMessage: e.target.value }))} />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1.5 block text-xs text-muted">会员区英文标签</span>
                <input className="input-field py-2 text-sm" value={copyDraft.memberLabel} onChange={(e) => setCopyDraft((d) => ({ ...d, memberLabel: e.target.value }))} />
              </label>
              <label className="text-sm">
                <span className="mb-1.5 block text-xs text-muted">会员区提示文案</span>
                <input className="input-field py-2 text-sm" value={copyDraft.memberHint} onChange={(e) => setCopyDraft((d) => ({ ...d, memberHint: e.target.value }))} />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1.5 block text-xs text-muted">成功弹窗英文标题</span>
                <input className="input-field py-2 text-sm" value={copyDraft.successTitle} onChange={(e) => setCopyDraft((d) => ({ ...d, successTitle: e.target.value }))} />
              </label>
              <label className="text-sm">
                <span className="mb-1.5 block text-xs text-muted">成功弹窗底部文案</span>
                <input className="input-field py-2 text-sm" value={copyDraft.successMessage} onChange={(e) => setCopyDraft((d) => ({ ...d, successMessage: e.target.value }))} />
              </label>
            </div>
            <label className="text-sm">
              <span className="mb-1.5 block text-xs text-muted">页脚标语</span>
              <input className="input-field py-2 text-sm" value={copyDraft.footerTagline} onChange={(e) => setCopyDraft((d) => ({ ...d, footerTagline: e.target.value }))} />
            </label>
          </div>
        </div>

        {/* Module E: Stores */}
        <div className="admin-panel">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-ember" />
              <div>
                <p className="text-sm font-semibold text-ember">门店</p>
                <h2 className="font-brush text-2xl text-kiln">门店与账号</h2>
              </div>
            </div>
            <SaveButton state={storesSave} onClick={saveStores} />
          </div>

          <div className="mt-5 grid gap-3">
            {storesDraft.map((s, i) => (
              <div key={s.id} className="rounded-xl bg-ash p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted uppercase">{s.id}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.role === "central" ? "bg-ember/10 text-ember" : "bg-white text-muted"}`}>{s.role === "central" ? "主门店" : "自提点"}</span>
                </div>
                <div className="grid gap-3">
                  <input className="input-field py-2 text-sm" value={s.name} onChange={(e) => setStoresDraft((prev) => prev.map((st, idx) => idx === i ? { ...st, name: e.target.value } : st))} placeholder="门店名称" />
                  <input className="input-field py-2 text-sm" value={s.address} onChange={(e) => setStoresDraft((prev) => prev.map((st, idx) => idx === i ? { ...st, address: e.target.value } : st))} placeholder="地址" />
                  <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                    <input type="checkbox" checked={s.pickupOpen} onChange={(e) => setStoresDraft((prev) => prev.map((st, idx) => idx === i ? { ...st, pickupOpen: e.target.checked } : st))} className="h-4 w-4 accent-ember" />
                    开放自提
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
