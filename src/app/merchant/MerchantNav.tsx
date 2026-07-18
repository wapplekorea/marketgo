"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/merchant/dashboard", label: "주문 수신", icon: "📋" },
  { href: "/merchant/menu",      label: "메뉴 관리", icon: "🍽️" },
  { href: "/merchant/qr",        label: "QR 코드",   icon: "📱" },
  { href: "/merchant/analytics", label: "매출",       icon: "📊" },
];

export default function MerchantNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  return (
    <>
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between sticky top-0 z-20">
        <span className="font-bold text-orange-500">🛍️ MarketGo</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:block">{userEmail}</span>
          <form action="/api/auth/logout" method="POST">
            <button className="text-xs text-gray-400 hover:text-gray-600">로그아웃</button>
          </form>
        </div>
      </header>

      {/* 하단 탭 네비 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-20">
        {TABS.map(tab => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors ${
                isActive ? "text-orange-500" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
