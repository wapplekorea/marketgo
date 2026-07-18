"use client";

import { useState } from "react";

type MenuItem = {
  id: string;
  name: string;
  name_en?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  sort_order: number;
};

type Store = { id: string; name: string };

const EMPTY: Omit<MenuItem, "id" | "sort_order"> = {
  name: "",
  name_en: "",
  price: 0,
  is_available: true,
};

export default function MenuClient({ store, initialMenu }: { store: Store; initialMenu: MenuItem[] }) {
  const [menu, setMenu] = useState<MenuItem[]>(initialMenu);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ ...EMPTY, price: "" as string | number });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  function setF(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  }

  async function saveItem() {
    if (!form.name.trim() || !form.price) return;
    setSaving(true);

    const body = {
      store_id: store.id,
      name: form.name.trim(),
      name_en: form.name_en?.trim() || null,
      price: Number(form.price),
      is_available: form.is_available,
      sort_order: menu.length,
    };

    const res = await fetch(
      editId ? `/api/menu/${editId}` : "/api/menu",
      {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();

    if (res.ok) {
      if (editId) {
        setMenu(m => m.map(item => item.id === editId ? { ...item, ...data } : item));
      } else {
        setMenu(m => [...m, data]);
      }
      setAdding(false);
      setEditId(null);
      setForm({ ...EMPTY, price: "" });
    }
    setSaving(false);
  }

  async function toggleAvailable(id: string, is_available: boolean) {
    await fetch(`/api/menu/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_available }),
    });
    setMenu(m => m.map(item => item.id === id ? { ...item, is_available } : item));
  }

  async function deleteItem(id: string) {
    if (!confirm("이 메뉴를 삭제할까요?")) return;
    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    setMenu(m => m.filter(item => item.id !== id));
  }

  function startEdit(item: MenuItem) {
    setForm({ name: item.name, name_en: item.name_en ?? "", price: item.price, is_available: item.is_available });
    setEditId(item.id);
    setAdding(true);
  }

  return (
    <div className="px-4 py-5 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-900">메뉴 관리</h1>
        <button
          onClick={() => { setAdding(true); setEditId(null); setForm({ ...EMPTY, price: "" }); }}
          className="bg-orange-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-orange-600"
        >
          + 추가
        </button>
      </div>

      {/* 추가/편집 폼 */}
      {adding && (
        <div className="bg-orange-50 rounded-xl p-4 mb-4 border border-orange-100">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            {editId ? "메뉴 수정" : "새 메뉴"}
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="메뉴명 (한국어) *"
              value={form.name}
              onChange={setF("name")}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              type="text"
              placeholder="Menu name (English) — 선택"
              value={form.name_en}
              onChange={setF("name_en")}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="가격 (원) *"
                value={form.price}
                onChange={setF("price")}
                min={0}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <label className="flex items-center gap-1.5 text-sm text-gray-600 shrink-0">
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))}
                  className="accent-orange-500"
                />
                판매 중
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveItem}
                disabled={saving || !form.name.trim() || !form.price}
                className="flex-1 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg disabled:opacity-50"
              >
                {saving ? "저장 중..." : "저장"}
              </button>
              <button
                onClick={() => { setAdding(false); setEditId(null); }}
                className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메뉴 목록 */}
      <div className="space-y-2">
        {menu.map(item => (
          <div key={item.id} className={`bg-white rounded-xl border p-4 flex items-center gap-3 ${!item.is_available ? "opacity-50" : "border-gray-100"}`}>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
              {item.name_en && <p className="text-xs text-gray-400">{item.name_en}</p>}
              <p className="text-orange-500 font-bold text-sm mt-0.5">{item.price.toLocaleString()}원</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleAvailable(item.id, !item.is_available)}
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  item.is_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                }`}
              >
                {item.is_available ? "판매 중" : "품절"}
              </button>
              <button onClick={() => startEdit(item)} className="text-gray-400 hover:text-gray-600 text-sm px-1">✏️</button>
              <button onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-red-500 text-sm px-1">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {menu.length === 0 && !adding && (
        <div className="text-center text-gray-400 py-16">
          <div className="text-4xl mb-2">🍽️</div>
          <p>메뉴를 추가해주세요</p>
        </div>
      )}
    </div>
  );
}
