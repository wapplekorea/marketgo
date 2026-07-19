"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/merchant/dashboard",
    label: "주문",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 5.55228 9.44772 6 10 6H14C14.5523 6 15 5.55228 15 5M9 5C9 4.44772 9.44772 4 10 4H14C14.5523 4 15 4.44772 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01"
          stroke={active ? "var(--brand)" : "var(--sys-label3)"}
          strokeWidth={active ? "2.2" : "1.8"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/merchant/menu",
    label: "메뉴",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C13.1046 2 14 2.89543 14 4V8.26756C15.1956 8.61337 16.2671 9.2668 17.1213 10.1213C18.3166 11.3166 19 12.9 19 14.5C19 17.5376 16.5376 20 13.5 20H10.5C7.46243 20 5 17.5376 5 14.5C5 12.9 5.68342 11.3166 6.87868 10.1213C7.73284 9.2668 8.80436 8.61337 10 8.26756V4C10 2.89543 10.8954 2 12 2Z"
          stroke={active ? "var(--brand)" : "var(--sys-label3)"}
          strokeWidth={active ? "2.2" : "1.8"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/merchant/qr",
    label: "QR",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5"
          stroke={active ? "var(--brand)" : "var(--sys-label3)"}
          strokeWidth={active ? "2.2" : "1.8"} />
        <rect x="14" y="3" width="7" height="7" rx="1.5"
          stroke={active ? "var(--brand)" : "var(--sys-label3)"}
          strokeWidth={active ? "2.2" : "1.8"} />
        <rect x="3" y="14" width="7" height="7" rx="1.5"
          stroke={active ? "var(--brand)" : "var(--sys-label3)"}
          strokeWidth={active ? "2.2" : "1.8"} />
        <path d="M14 14H17M17 14V17M17 17H20M20 17V20M14 17H14.01M14 20H17M20 14V14.01"
          stroke={active ? "var(--brand)" : "var(--sys-label3)"}
          strokeWidth={active ? "2.2" : "1.8"}
          strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/merchant/analytics",
    label: "매출",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 20V14M9 20V8M14 20V11M19 20V4"
          stroke={active ? "var(--brand)" : "var(--sys-label3)"}
          strokeWidth={active ? "2.5" : "2"}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function MerchantNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  return (
    <>
      {/* 상단 헤더 — iOS Navigation Bar 스타일 */}
      <header
        className="sticky top-0 z-20 px-4 h-14 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "0.5px solid var(--sys-sep2)",
        }}
      >
        <span
          className="font-bold text-[17px] tracking-tight"
          style={{ color: "var(--brand)" }}
        >
          MarketGo
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs hidden sm:block" style={{ color: "var(--sys-label3)" }}>
            {userEmail}
          </span>
          <form action="/api/auth/logout" method="POST">
            <button
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
              style={{ color: "var(--brand)", background: "var(--brand-light)" }}
            >
              로그아웃
            </button>
          </form>
        </div>
      </header>

      {/* 하단 탭 — iOS Tab Bar 스타일 */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 flex pb-safe"
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderTop: "0.5px solid var(--sys-sep2)",
          minHeight: "49px",
        }}
      >
        {TABS.map(tab => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center pt-2 pb-1 gap-0.5 transition-opacity active:opacity-60"
            >
              {tab.icon(isActive)}
              <span
                className="text-[10px] font-medium mt-0.5"
                style={{ color: isActive ? "var(--brand)" : "var(--sys-label3)" }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
