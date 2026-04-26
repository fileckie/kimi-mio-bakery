import type { StoreLocation, StoreId } from "../types";

export function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function getStoreName(stores: StoreLocation[], storeId: StoreId): string {
  return stores.find((s) => s.id === storeId)?.name ?? storeId;
}

export function formatPrice(n: number): string {
  return `¥${n}`;
}

export function generateId(prefix: string): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${random}`;
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
  if (hours > 0) return `${hours}小时${minutes}分`;
  return `${minutes}分`;
}

export function classNames(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
