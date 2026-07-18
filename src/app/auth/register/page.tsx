"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", storeName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { store_name: form.storeName } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user && !data.session) {
      // 이메일 확인 필요
      router.push("/auth/verify");
    } else {
      router.push("/merchant/setup");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-bold text-orange-500">
            🛍️ MarketGo
          </div>
          <p className="text-sm text-gray-500 mt-1">전통시장 스마트 주문 플랫폼</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-lg font-semibold text-gray-900 mb-5">상인 회원가입</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">가게명</label>
              <input
                type="text"
                value={form.storeName}
                onChange={set("storeName")}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="예: 김씨네 순대국"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">이메일</label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">비밀번호</label>
              <input
                type="password"
                value={form.password}
                onChange={set("password")}
                required
                minLength={6}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="6자 이상"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "가입 중..." : "가입하기"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            이미 계정이 있으신가요?{" "}
            <Link href="/auth/login" className="text-orange-500 font-medium hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
