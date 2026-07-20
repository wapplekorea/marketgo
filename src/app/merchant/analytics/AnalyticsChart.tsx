"use client";

import { useState } from "react";

type DayData = { day: string; amount: number };

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
      <p className="text-[12px] mb-5" style={{ color: "var(--sys-label3)" }}>
        막대를 눌러 금액 확인
      </p>

      {/* 툴팁 */}
      <div className="h-9 flex items-center justify-center mb-2">
        {active !== null ? (
          <div
            className="px-3 py-1.5 rounded-[10px] text-[13px] font-semibold"
            style={{ background: "var(--brand)", color: "#fff" }}
          >
            {daily[active].day} · {daily[active].amount.toLocaleString()}원
          </div>
        ) : (
          <p className="text-[12px]" style={{ color: "var(--sys-label4)" }}>
            —
          </p>
        )}
      </div>

      {/* 바 차트 */}
      <div className="flex items-end gap-2 h-36">
        {daily.map((d, i) => {
          const heightPct = maxAmount > 0 ? (d.amount / maxAmount) * 100 : 0;
          const isActive = active === i;
          const hasData = d.amount > 0;

          return (
            <div
              key={d.day}
              className="flex-1 flex flex-col items-center gap-2 cursor-pointer select-none"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onTouchStart={() => setActive(i)}
              onTouchEnd={() => setTimeout(() => setActive(null), 1200)}
            >
              {/* 바 컨테이너 */}
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t-[6px] transition-all duration-150"
                  style={{
                    height: hasData ? `${Math.max(heightPct, 4)}%` : "3px",
                    background: isActive
                      ? "var(--brand)"
                      : hasData
                      ? "rgba(255,107,0,0.30)"
                      : "var(--sys-fill)",
                    borderRadius: hasData ? "6px 6px 0 0" : "3px",
                    transform: isActive ? "scaleY(1.03)" : "scaleY(1)",
                    transformOrigin: "bottom",
                  }}
                />
              </div>

              {/* 날짜 레이블 */}
              <span
                className="text-[10px] whitespace-nowrap font-medium"
                style={{ color: isActive ? "var(--brand)" : "var(--sys-label3)" }}
              >
                {d.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Y축 최대값 힌트 */}
      {maxAmount > 1 && (
        <div
          className="text-right text-[10px] mt-2"
          style={{ color: "var(--sys-label4)" }}
        >
          최대 {maxAmount.toLocaleString()}원
        </div>
      )}
    </div>
  );
}
