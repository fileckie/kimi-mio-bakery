import { useState } from "react";
import { Plus, Upload, Camera, ToggleLeft, ToggleRight } from "lucide-react";
import type { Product, InventoryMap, StoreLocation, Category } from "../../types";
import { api } from "../../lib/api";
import { readImageFile } from "../../lib/utils";

const categories: Category[] = ["欧包/坚果", "吐司", "恰巴塔", "贝果/海盐卷", "软欧包"];

interface ProductsPanelProps {
  products: Product[];
  inventory: InventoryMap;
  stores: StoreLocation[];
  isHq: boolean;
  onUpdate: () => void;
}

export function ProductsPanel({ products, inventory, stores, isHq, onUpdate }: ProductsPanelProps) {
  const [newProduct, setNewProduct] = useState({
    name: "", category: "欧包/坚果" as Category, weight: "280克", price: 28,
    description: "", ingredients: "", imageUrl: "", isPublished: true, featured: false,
  });

  const updateProduct = async (id: string, patch: Partial<Product>) => {
    if (!isHq) return;
    try { await api.updateProduct(id, patch); onUpdate(); } catch (e) { alert("保存失败"); }
  };

  const createProduct = async () => {
    if (!isHq || !newProduct.name.trim()) return;
    try {
      await api.createProduct({
        ...newProduct,
        ingredients: newProduct.ingredients.split(/[，,]/).map((s) => s.trim()).filter(Boolean),
        imageTone: "from-amber-100 via-stone-100 to-yellow-50",
      });
      setNewProduct({ name: "", category: "欧包/坚果", weight: "280克", price: 28, description: "", ingredients: "", imageUrl: "", isPublished: true, featured: false });
      onUpdate();
    } catch (e) { alert("新增失败"); }
  };

  const uploadImage = async (productId: string, file?: File) => {
    if (!file) return;
    try { const url = await readImageFile(file); await updateProduct(productId, { imageUrl: url }); } catch { alert("图片上传失败"); }
  };

  return (
    <div className="space-y-8">
      {/* Product list */}
      <div className="admin-panel">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ember">商品库</p>
            <h2 className="mt-1 font-brush text-3xl text-kiln">商品管理</h2>
          </div>
          <span className="text-sm text-muted">{isHq ? "总部可编辑" : "门店只读"}</span>
        </div>

        {isHq && (
          <div className="mt-5 rounded-2xl border border-dashed border-border bg-ash p-5">
            <p className="font-semibold text-kiln flex items-center gap-2"><Plus className="h-4 w-4 text-ember" />新增产品</p>
            <div className="mt-4 grid gap-3">
              <input className="input-field" value={newProduct.name} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} placeholder="产品名称" />
              <div className="grid gap-3 sm:grid-cols-3">
                <select className="input-field" value={newProduct.category} onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value as Category }))}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input className="input-field" value={newProduct.weight} onChange={(e) => setNewProduct((p) => ({ ...p, weight: e.target.value }))} placeholder="克重" />
                <input className="input-field" type="number" value={newProduct.price} onChange={(e) => setNewProduct((p) => ({ ...p, price: Number(e.target.value) }))} placeholder="价格" />
              </div>
              <input className="input-field" value={newProduct.ingredients} onChange={(e) => setNewProduct((p) => ({ ...p, ingredients: e.target.value }))} placeholder="配料，逗号分隔" />
              <textarea className="input-field min-h-20 resize-none" value={newProduct.description} onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))} placeholder="产品介绍" />
              <div className="flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-kiln shadow-soft">
                  <Camera className="h-4 w-4" />选择图片<input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && readImageFile(e.target.files[0]).then((url) => setNewProduct((p) => ({ ...p, imageUrl: url })))} />
                </label>
                {newProduct.imageUrl && <span className="text-xs text-green-700">图片已选择</span>}
              </div>
              <button onClick={createProduct} className="inline-flex items-center justify-center gap-2 rounded-full bg-kiln px-5 py-3 text-sm font-semibold text-ash hover:bg-kiln-light transition">
                <Plus className="h-4 w-4" />添加到商品库
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 space-y-3">
          {products.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-ash p-4">
              <div className="grid gap-4 sm:grid-cols-[80px_1fr_auto]">
                <div className={`h-20 rounded-xl bg-gradient-to-br ${p.imageTone} flex items-center justify-center overflow-hidden`}>
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" /> : <span className="text-2xl">🍞</span>}
                </div>
                <div className="min-w-0">
                  {isHq ? (
                    <div className="grid gap-2">
                      <input className="input-field py-2 text-sm" value={p.name} onChange={(e) => updateProduct(p.id, { name: e.target.value })} />
                      <div className="grid gap-2 sm:grid-cols-3">
                        <select className="input-field py-2 text-sm" value={p.category} onChange={(e) => updateProduct(p.id, { category: e.target.value as Category })}>
                          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input className="input-field py-2 text-sm" value={p.weight} onChange={(e) => updateProduct(p.id, { weight: e.target.value })} />
                        <input className="input-field py-2 text-sm" type="number" value={p.price} onChange={(e) => updateProduct(p.id, { price: Number(e.target.value) })} />
                      </div>
                      <input className="input-field text-sm" value={p.description} onChange={(e) => updateProduct(p.id, { description: e.target.value })} placeholder="介绍" />
                      <div className="flex flex-wrap gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-soft">
                          <Upload className="h-3.5 w-3.5" />上传图片<input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(p.id, e.target.files?.[0])} />
                        </label>
                        {p.imageUrl && <button onClick={() => updateProduct(p.id, { imageUrl: "" })} className="text-xs text-muted hover:text-kiln">移除图片</button>}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-kiln">{p.name}</p>
                      <p className="text-sm text-muted">{p.weight} · ¥{p.price}</p>
                      <p className="text-xs text-muted mt-1">{p.description}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-start gap-3">
                  <button onClick={() => isHq && updateProduct(p.id, { isPublished: !p.isPublished })} className="flex items-center gap-1.5 text-sm text-muted">
                    {p.isPublished ? <ToggleRight className="h-5 w-5 text-green-600" /> : <ToggleLeft className="h-5 w-5 text-muted" />}
                    {p.isPublished ? "上架" : "下架"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
