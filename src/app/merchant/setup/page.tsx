"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Market = { id: string; name: string };

export default function SetupPage() {
  const router = useRouter();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [form, setForm] = useState({ name: "", category: "음식", market_id: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/markets").then(r => r.json()).then((data: Market[]) => {
      setMarkets(data ?? []);
      if (data?.[0]) setForm(f => ({ ...f, market_id: data[0].id }));
    });
  }, []);

  function setF(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const { error } = await supabase.from("stores").insert({
      name: form.name.trim(),
      category: form.category,
      market_id: form.market_id,
      owner_id: user.id,
      is_open: false,
    });

    if (error) {
      setError(error.message);
      setSaving(false);
    } else {
      router.push("/merchant/dashboard");
      router.refresh();
    }
  }

  const CATEGORIES = ["음식", "간식/디저트", "음료", "농산물", "수산물", "정육", "기타"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-xl font-bold text-orange-500">🛍️ MarketGo</span>
          <h1 className="text-lg font-semibold text-gray-900 mt-3">가게 정보 등록</h1>
          <p className="text-sm text-gray-500 mt-1">주문을 받기 위한 가게 정보를 입력해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">시장 선택 *</label>
            <select
              value={form.market_id}
              onChange={setF("market_id")}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            >
              {markets.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">가게명 *</label>
            <input
              type="text"
              value={form.name}
              onChange={setF("name")}
              required
              placeholder="예: 김씨네 순대국"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">업종 *</label>
            <select
              value={form.category}
              onChange={setF("category")}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={saving || !form.name.trim() || !form.market_id}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg disabled:opacity-50"
          >
            {saving ? "저장 중..." : "시작하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
