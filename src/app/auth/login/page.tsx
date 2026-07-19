"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
    } else {
      router.push("/merchant/dashboard");
      router.refresh();
    }
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--sys-bg)" }}
    >
      {/* 로고 */}
      <div className="text-center mb-10">
        <div
          className="w-16 h-16 rounded-[18px] flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm"
          style={{ background: "var(--brand)" }}
        >
          🛍️
        </div>
        <h1 className="text-[28px] font-bold" style={{ color: "var(--sys-label)" }}>MarketGo</h1>
        <p className="text-[14px] mt-1" style={{ color: "var(--sys-label2)" }}>
          전통시장 스마트 주문 플랫폼
        </p>
      </div>

      {/* 로그인 폼 — iOS 그룹드 스타일 */}
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>

          {/* 입력 필드 그룹 */}
          <div
            className="overflow-hidden mb-4"
            style={{ background: "var(--sys-bg2)", borderRadius: "16px" }}
          >
            <div className="px-4 py-1">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="이메일"
                className="w-full py-3.5 text-[16px] outline-none bg-transparent"
                style={{ color: "var(--sys-label)", borderBottom: "0.5px solid var(--sys-sep)" }}
              />
            </div>
            <div className="px-4 py-1">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="비밀번호"
                className="w-full py-3.5 text-[16px] outline-none bg-transparent"
                style={{ color: "var(--sys-label)" }}
              />
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div
              className="px-4 py-3 mb-4 text-[14px] rounded-[12px]"
              style={{ background: "rgba(255,59,48,0.10)", color: "var(--sys-red)" }}
            >
              {error}
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white text-[17px] font-semibold rounded-[16px] transition-opacity active:opacity-80 disabled:opacity-50"
            style={{
              background: "var(--brand)",
              boxShadow: "0 4px 20px rgba(255,107,0,0.30)",
            }}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* 링크 */}
        <p className="text-center text-[14px] mt-5" style={{ color: "var(--sys-label2)" }}>
          계정이 없으신가요?{" "}
          <Link
            href="/auth/register"
            className="font-semibold"
            style={{ color: "var(--brand)" }}
          >
            회원가입
          </Link>
        </p>
        <p className="text-center text-[13px] mt-2">
          <Link
            href="/auth/forgot-password"
            style={{ color: "var(--sys-label3)" }}
          >
            비밀번호를 잊으셨나요?
          </Link>
        </p>
      </div>
    </div>
  );
}
