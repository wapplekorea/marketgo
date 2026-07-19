import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type StatusConfig = {
  label: string;
  sub: string;
  icon: string;
  accent: string;
  bg: string;
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  pending:   { label: "주문 접수 중",  sub: "가게에서 주문을 확인하고 있어요",   icon: "⏳", accent: "#FF9500", bg: "rgba(255,149,0,0.10)" },
  confirmed: { label: "준비 중",       sub: "음식을 열심히 준비하고 있어요",      icon: "👨‍🍳", accent: "#007AFF", bg: "rgba(0,122,255,0.10)" },
  ready:     { label: "준비 완료",     sub: "음식이 준비됐어요! 가져가세요 🎉",   icon: "🍽️", accent: "#34C759", bg: "rgba(52,199,89,0.10)" },
  done:      { label: "완료",          sub: "맛있게 드세요!",                      icon: "✅", accent: "#8E8E93", bg: "rgba(142,142,147,0.10)" },
  cancelled: { label: "취소됨",        sub: "주문이 취소되었습니다",               icon: "✕",  accent: "#FF3B30", bg: "rgba(255,59,48,0.10)" },
};

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, stores(name, markets(name)), order_items(*, menu_items(name, price))")
    .eq("id", orderId)
    .single();

  if (!order) notFound();

  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--sys-bg)" }}>

      {/* 브랜드 헤더 */}
      <div
        className="h-11 flex items-center justify-center"
        style={{ borderBottom: "0.5px solid var(--sys-sep)" }}
      >
        <span className="text-[17px] font-bold" style={{ color: "var(--brand)" }}>MarketGo</span>
      </div>

      <div className="flex-1 px-4 py-6 max-w-sm mx-auto w-full">

        {/* 상태 카드 */}
        <div
          className="text-center px-6 py-8 mb-4"
          style={{ background: "var(--sys-bg2)", borderRadius: "20px" }}
        >
          {/* 아이콘 */}
          <div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4"
            style={{ background: cfg.bg }}
          >
            {cfg.icon}
          </div>

          {/* 상태 배지 */}
          <span
            className="inline-block text-[13px] font-semibold px-3 py-1 rounded-full mb-2"
            style={{ color: cfg.accent, background: cfg.bg }}
          >
            {cfg.label}
          </span>

          <p className="text-[15px] mt-1" style={{ color: "var(--sys-label2)" }}>
            {cfg.sub}
          </p>

          <div className="mt-4 pt-4" style={{ borderTop: "0.5px solid var(--sys-sep)" }}>
            <p className="text-[17px] font-semibold" style={{ color: "var(--sys-label)" }}>
              {order.stores?.name}
            </p>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--sys-label3)" }}>
              {(order.stores as { name: string; markets?: { name: string } } | null)?.markets?.name}
            </p>
          </div>
        </div>

        {/* 주문 내역 */}
        <div
          className="px-5 py-4 mb-4"
          style={{ background: "var(--sys-bg2)", borderRadius: "16px" }}
        >
          <p className="text-[15px] font-semibold mb-3" style={{ color: "var(--sys-label)" }}>
            주문 내역
          </p>
          <div className="space-y-2">
            {order.order_items?.map((item: {
              id: string;
              quantity: number;
              unit_price: number;
              menu_items: { name: string; price: number } | null;
            }) => (
              <div key={item.id} className="flex justify-between items-center">
                <span className="text-[14px]" style={{ color: "var(--sys-label2)" }}>
                  {item.menu_items?.name} × {item.quantity}
                </span>
                <span className="text-[14px] font-medium" style={{ color: "var(--sys-label)" }}>
                  {(item.unit_price * item.quantity).toLocaleString()}원
                </span>
              </div>
            ))}
          </div>
          <div
            className="flex justify-between items-center mt-3 pt-3"
            style={{ borderTop: "0.5px solid var(--sys-sep)" }}
          >
            <span className="text-[15px] font-bold" style={{ color: "var(--sys-label)" }}>합계</span>
            <span className="text-[17px] font-bold" style={{ color: "var(--brand)" }}>
              {order.total_amount.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 주문 정보 */}
        <div
          className="px-5 py-4"
          style={{ background: "var(--sys-bg2)", borderRadius: "16px" }}
        >
          <div className="flex justify-between items-center py-1">
            <span className="text-[14px]" style={{ color: "var(--sys-label2)" }}>주문번호</span>
            <span
              className="text-[13px] font-mono font-medium"
              style={{ color: "var(--sys-label)" }}
            >
              {orderId.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div
            className="flex justify-between items-center py-1"
            style={{ borderTop: "0.5px solid var(--sys-sep)" }}
          >
            <span className="text-[14px]" style={{ color: "var(--sys-label2)" }}>주문자</span>
            <span className="text-[14px] font-medium" style={{ color: "var(--sys-label)" }}>
              {order.customer_name ?? "—"}
            </span>
          </div>
        </div>

        <p
          className="text-center text-[12px] mt-5"
          style={{ color: "var(--sys-label4)" }}
        >
          새로고침하면 최신 상태를 확인할 수 있어요
        </p>
      </div>
    </div>
  );
}
