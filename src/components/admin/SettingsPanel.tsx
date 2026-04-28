import { useState, useCallback } from "react";
import type { BatchSale, StoreLocation, Product } from "../../types";
import { api } from "../../lib/api";
import { useUIStore } from "../../stores/uiStore";
import { useAppStore } from "../../stores/appStore";
import { SaveButton, type SaveState } from "./settings/SaveButton";
import { BatchSettings } from "./settings/BatchSettings";
import { OvenBatchesSettings } from "./settings/OvenBatchesSettings";
import { PaymentSettings } from "./settings/PaymentSettings";
import { CopySettings } from "./settings/CopySettings";
import { PrintSettings } from "./settings/PrintSettings";
import { StoreSettings } from "./settings/StoreSettings";

interface SettingsPanelProps {
  batchSale: BatchSale;
  stores: StoreLocation[];
  products: Product[];
  onUpdate: () => void;
}

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

  // ── Module F: Print template ──
  const [printDraft, setPrintDraft] = useState({
    printLogoUrl: batchSale.printLogoUrl || "",
    printPrimaryColor: batchSale.printPrimaryColor || "#E84A2E",
  });
  const [printSave, setPrintSave] = useState<SaveState>("idle");

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
    setter("saving");
    try {
      const updated = await action();
      setter("saved");
      addToast({ type: "success", message: `${label} 已保存` });
      // 静默更新全局 store，不触发 isLoading
      useAppStore.getState().setBatchSale(updated);
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

  // Save module F
  const savePrint = () =>
    doSave(setPrintSave, () => api.updateBatchSale(printDraft), "打印模板");

  // Save module E
  const saveStores = async () => {
    setStoresSave("saving");
    try {
      const updatedStores: StoreLocation[] = [];
      for (const s of storesDraft) {
        const updated = await api.updateStore(s.id, { name: s.name, address: s.address, pickupOpen: s.pickupOpen });
        updatedStores.push(updated);
      }
      setStoresSave("saved");
      addToast({ type: "success", message: "门店设置 已保存" });
      // 静默更新全局 store
      useAppStore.getState().setStores((prev) =>
        prev.map((s) => updatedStores.find((u) => u.id === s.id) || s)
      );
      setTimeout(() => setStoresSave("idle"), 1500);
    } catch {
      setStoresSave("idle");
      addToast({ type: "error", message: "门店设置 保存失败，请重试" });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* ── Left Column ── */}
      <div className="space-y-6">
        <BatchSettings draft={batchDraft} setDraft={setBatchDraft} saveState={batchSave} onSave={saveBatch} />
        <OvenBatchesSettings
          draft={batchesDraft}
          setDraft={setBatchesDraft}
          products={products}
          saveState={batchesSave}
          onSave={saveBatches}
        />
        <PaymentSettings draft={paymentDraft} setDraft={setPaymentDraft} saveState={paymentSave} onSave={savePayment} />
      </div>

      {/* ── Right Column ── */}
      <div className="space-y-6">
        <CopySettings draft={copyDraft} setDraft={setCopyDraft} saveState={copySave} onSave={saveCopy} />
        <PrintSettings draft={printDraft} setDraft={setPrintDraft} saveState={printSave} onSave={savePrint} />
        <StoreSettings
          draft={storesDraft}
          setDraft={setStoresDraft}
          saveState={storesSave}
          onSave={saveStores}
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
}
