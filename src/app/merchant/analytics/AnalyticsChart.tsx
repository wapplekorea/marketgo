"use client";

import { useState } from "react";

type DayData = { day: string; amount: number };

const MAX_BAR_PX = 120;

export default function AnalyticsChart({ daily }: { daily: DayData[] }) {
  const [active, setActive] = useState<number | null>(null);
  const maxAmount = Math.max(...daily.map(d => d.amount), 1);

  return (
    <div
      className="px-4 pt-4 pb-5"
      style={{ background: "var(--sys-bg2)", borderRadius: "16px" }}
    >
      <p className="text-[15px] font-semibold mb-1" style={{ color: "var(--sys-label)" }}>
        최근 7일 매출
      </p>
      <p className="text-[12px] mb-4" style={{ color: "var(--sys-label3)" }}>
        막대를 눌러 금액 확인
      </p>

      {/* 툴팁 */}
      <div className="h-8 flex items-center justify-center mb-3">
        {active !== null ? (
          <div
            className="px-3 py-1.5 rounded-[10px] text-[13px] font-semibold"
            style={{ background: "var(--brand)", color: "#fff" }}
          >
            {daily[active].day} · {daily[active].amount.toLocaleString()}원
          </div>
        ) : (
          <p className="text-[12px]" style={{ color: "var(--sys-label4)" }}>—</p>
        )}
      </div>

      {/* 바 차트 */}
      <div className="flex items-end gap-2" style={{ height: `${MAX_BAR_PX + 24}px` }}>
        {daily.map((d, i) => {
          const barPx = d.amount > 0
            ? Math.max(Math.round((d.amount / maxAmount) * MAX_BAR_PX), 6)
            : 3;
          const isActive = active === i;

          return (
            <div
              key={d.day}
              className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer select-none"
              style={{ height: `${MAX_BAR_PX + 24}px` }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onTouchStart={() => setActive(i)}
              onTouchEnd={() => setTimeout(() => setActive(null), 1500)}
            >
              {/* 스페이서 — 막대를 하단 정렬 */}
              <div className="flex-1" />

              {/* 막대 */}
              <div
                className="w-full transition-all duration-200"
                style={{
                  height: `${barPx}px`,
                  background: isActive
                    ? "var(--brand)"
                    : d.amount > 0
                    ? "rgba(255,107,0,0.28)"
                    : "var(--sys-fill)",
                  borderRadius: d.amount > 0 ? "6px 6px 0 0" : "3px",
                }}
              />

              {/* 날짜 */}
              <span
                className="text-[10px] font-medium whitespace-nowrap"
                style={{ color: isActive ? "var(--brand)" : "var(--sys-label3)" }}
              >
                {d.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* 최대값 힌트 */}
      {maxAmount > 1 && (
        <p className="text-right text-[10px] mt-2" style={{ color: "var(--sys-label4)" }}>
          최대 {maxAmount.toLocaleString()}원
        </p>
      )}
    </div>
  );
}
