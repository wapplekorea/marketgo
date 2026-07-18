import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

const STATUS_LABEL: Record<string, { label: string; emoji: string; color: string }> = {
  pending:   { label: "주문 접수 중",   emoji: "⏳", color: "text-yellow-600 bg-yellow-50" },
  confirmed: { label: "주문 확인됨",    emoji: "✅", color: "text-blue-600 bg-blue-50" },
  ready:     { label: "준비 완료",       emoji: "🍽️", color: "text-green-600 bg-green-50" },
  done:      { label: "완료",            emoji: "🎉", color: "text-gray-600 bg-gray-50" },
  cancelled: { label: "취소됨",          emoji: "❌", color: "text-red-600 bg-red-50" },
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

  const status = STATUS_LABEL[order.status] ?? STATUS_LABEL.pending;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-6">
          <span className="text-xl font-bold text-orange-500">🛍️ MarketGo</span>
        </div>

        {/* 상태 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 text-center">
          <div className="text-5xl mb-3">{status.emoji}</div>
          <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${status.color} mb-2`}>
            {status.label}
          </span>
          <p className="text-gray-500 text-sm mt-1">{order.stores?.name}</p>
          <p className="text-xs text-gray-400">{order.stores?.markets?.name}</p>
        </div>

        {/* 주문 상세 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">주문 내역</h2>
          <div className="space-y-2">
            {order.order_items?.map((item: {
              id: string;
              quantity: number;
              unit_price: number;
              menu_items: { name: string; price: number } | null;
            }) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.menu_items?.name} × {item.quantity}</span>
                <span className="font-medium">{(item.unit_price * item.quantity).toLocaleString()}원</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>합계</span>
            <span className="text-orange-500">{order.total_amount.toLocaleString()}원</span>
          </div>
        </div>

        {/* 주문번호 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">주문번호</span>
            <span className="text-gray-700 font-mono text-xs">{orderId.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">주문자</span>
            <span className="text-gray-700">{order.customer_name ?? "—"}</span>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">이 페이지를 새로고침하면 현재 상태를 확인할 수 있어요</p>
      </div>
    </div>
  );
}
