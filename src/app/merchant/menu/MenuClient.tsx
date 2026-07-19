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

  function inputStyle(focused = false) {
    return {
      background: "var(--sys-bg)",
      borderRadius: "10px",
      border: "none",
      color: "var(--sys-label)",
      outline: "none",
      fontSize: "16px",
    } as React.CSSProperties;
  }

  return (
    <div className="px-4 py-4 pb-28">

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-bold" style={{ color: "var(--sys-label)" }}>메뉴 관리</h1>
        <button
          onClick={() => { setAdding(true); setEditId(null); setForm({ ...EMPTY, price: "" }); }}
          className="flex items-center gap-1.5 text-[15px] font-semibold px-4 py-2 rounded-full transition-opacity active:opacity-60"
          style={{ color: "#fff", background: "var(--brand)" }}
        >
          <span className="text-[18px] leading-none">+</span>
          추가
        </button>
      </div>

      {/* 추가/편집 폼 — iOS 그룹드 폼 스타일 */}
      {adding && (
        <div
          className="mb-5 overflow-hidden"
          style={{ background: "var(--sys-bg2)", borderRadius: "16px" }}
        >
          <div className="px-4 py-3" style={{ borderBottom: "0.5px solid var(--sys-sep)" }}>
            <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: "var(--sys-label3)" }}>
              {editId ? "메뉴 수정" : "새 메뉴"}
            </p>
          </div>

          {/* 메뉴명 */}
          <div className="px-4 py-1">
            <input
              type="text"
              placeholder="메뉴명 (한국어) *"
              value={form.name}
              onChange={setF("name")}
              className="w-full px-3 py-3 my-1"
              style={inputStyle()}
            />
          </div>
          <div className="mx-4" style={{ height: "0.5px", background: "var(--sys-sep)" }} />
          <div className="px-4 py-1">
            <input
              type="text"
              placeholder="Menu name (English) — 선택"
              value={form.name_en}
              onChange={setF("name_en")}
              className="w-full px-3 py-3 my-1"
              style={inputStyle()}
            />
          </div>
          <div className="mx-4" style={{ height: "0.5px", background: "var(--sys-sep)" }} />
          <div className="px-4 py-1 flex items-center gap-3">
            <input
              type="number"
              placeholder="가격 (원) *"
              value={form.price}
              onChange={setF("price")}
              min={0}
              className="flex-1 px-3 py-3 my-1"
              style={inputStyle()}
            />
            <label
              className="flex items-center gap-2 text-[14px] shrink-0 cursor-pointer"
              style={{ color: "var(--sys-label)" }}
            >
              <div
                className="relative w-11 h-6 rounded-full transition-all"
                style={{
                  background: form.is_available ? "var(--sys-green)" : "var(--sys-fill2, rgba(120,120,128,0.16))",
                }}
                onClick={() => setForm(f => ({ ...f, is_available: !f.is_available }))}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                  style={{ left: form.is_available ? "calc(100% - 22px)" : "2px" }}
                />
              </div>
              판매 중
            </label>
          </div>

          {/* 버튼 */}
          <div
            className="flex gap-2 px-4 py-3"
            style={{ borderTop: "0.5px solid var(--sys-sep)" }}
          >
            <button
              onClick={saveItem}
              disabled={saving || !form.name.trim() || !form.price}
              className="flex-1 py-3 text-white text-[15px] font-semibold rounded-[12px] transition-opacity active:opacity-80 disabled:opacity-40"
              style={{ background: "var(--brand)" }}
            >
              {saving ? "저장 중..." : "저장"}
            </button>
            <button
              onClick={() => { setAdding(false); setEditId(null); }}
              className="px-5 py-3 text-[15px] font-medium rounded-[12px]"
              style={{ background: "var(--sys-fill)", color: "var(--sys-label2)" }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 메뉴 목록 */}
      {menu.length > 0 && (
        <div
          className="overflow-hidden"
          style={{ background: "var(--sys-bg2)", borderRadius: "16px" }}
        >
          {menu.map((item, idx) => (
            <div key={item.id}>
              {idx > 0 && (
                <div className="ml-4" style={{ height: "0.5px", background: "var(--sys-sep)" }} />
              )}
              <div
                className="flex items-center gap-3 px-4 py-3.5 transition-opacity"
                style={{ opacity: item.is_available ? 1 : 0.45 }}
              >
                {/* 텍스트 */}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium" style={{ color: "var(--sys-label)" }}>
                    {item.name}
                  </p>
                  {item.name_en && (
                    <p className="text-[12px] mt-0.5" style={{ color: "var(--sys-label3)" }}>
                      {item.name_en}
                    </p>
                  )}
                  <p className="text-[14px] font-semibold mt-1" style={{ color: "var(--brand)" }}>
                    {item.price.toLocaleString()}원
                  </p>
                </div>

                {/* 액션 */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleAvailable(item.id, !item.is_available)}
                    className="text-[12px] font-semibold px-2.5 py-1 rounded-full"
                    style={item.is_available
                      ? { color: "var(--sys-green)", background: "rgba(52,199,89,0.12)" }
                      : { color: "var(--sys-label3)", background: "var(--sys-fill)" }
                    }
                  >
                    {item.is_available ? "판매 중" : "품절"}
                  </button>
                  <button
                    onClick={() => startEdit(item)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] transition-opacity active:opacity-50"
                    style={{ background: "var(--sys-fill)", color: "var(--sys-label2)" }}
                  >
                    ✏
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] transition-opacity active:opacity-50"
                    style={{ background: "rgba(255,59,48,0.10)", color: "var(--sys-red)" }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {menu.length === 0 && !adding && (
        <div className="text-center py-24">
          <div className="text-[52px] mb-3">🍽️</div>
          <p className="text-[16px] font-medium" style={{ color: "var(--sys-label2)" }}>
            메뉴를 추가해주세요
          </p>
          <p className="text-[13px] mt-1" style={{ color: "var(--sys-label3)" }}>
            + 추가 버튼을 눌러 첫 메뉴를 등록하세요
          </p>
        </div>
      )}
    </div>
  );
}
