"use client";

import { useState, useEffect, useCallback } from "react";

type OrderItem = {
  id: string;
  quantity: number;
  unit_price: number;
  menu_items: { name: string } | null;
};

type Order = {
  id: string;
  status: "pending" | "confirmed" | "ready" | "done" | "cancelled";
  customer_name: string | null;
  total_amount: number;
  created_at: string;
  order_items: OrderItem[];
};

type Store = {
  id: string;
  name: string;
  is_open: boolean;
};

const STATUS_CONFIG = {
  pending:   { label: "접수 대기",  color: "bg-yellow-100 text-yellow-700", next: "confirmed" as const, nextLabel: "접수하기" },
  confirmed: { label: "준비 중",    color: "bg-blue-100 text-blue-700",     next: "ready"     as const, nextLabel: "준비 완료" },
  ready:     { label: "준비 완료",  color: "bg-green-100 text-green-700",   next: "done"      as const, nextLabel: "완료 처리" },
  done:      { label: "완료",       color: "bg-gray-100 text-gray-500",     next: null,                  nextLabel: "" },
  cancelled: { label: "취소",       color: "bg-red-100 text-red-500",       next: null,                  nextLabel: "" },
};

export default function DashboardClient({
  store,
  initialOrders,
}: {
  store: Store;
  initialOrders: Order[];
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isOpen, setIsOpen] = useState(store.is_open);
  const [togglingOpen, setTogglingOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // 폴링 (5초마다)
  const fetchOrders = useCallback(async () => {
    const res = await fetch(`/api/stores/${store.id}/orders`);
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  }, [store.id]);

  useEffect(() => {
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  async function toggleOpen() {
    setTogglingOpen(true);
    const res = await fetch(`/api/stores/${store.id}/open`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_open: !isOpen }),
    });
    if (res.ok) setIsOpen(o => !o);
    setTogglingOpen(false);
  }

  async function updateStatus(orderId: string, status: string) {
    setUpdatingId(orderId);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await fetchOrders();
    setUpdatingId(null);
  }

  const pendingCount = orders.filter(o => o.status === "pending").length;

  return (
    <div className="px-4 py-5 pb-24">
      {/* 가게 상태 토글 */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">{store.name}</p>
          <p className={`text-sm font-medium ${isOpen ? "text-green-600" : "text-gray-400"}`}>
            {isOpen ? "🟢 영업 중" : "⚫ 준비 중"}
          </p>
        </div>
        <button
          onClick={toggleOpen}
          disabled={togglingOpen}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isOpen
              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
              : "bg-orange-500 text-white hover:bg-orange-600"
          } disabled:opacity-50`}
        >
          {togglingOpen ? "..." : isOpen ? "영업 종료" : "영업 시작"}
        </button>
      </div>

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-bold text-gray-900">주문 수신</h1>
        {pendingCount > 0 && (
          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            신규 {pendingCount}건
          </span>
        )}
      </div>

      {/* 주문 목록 */}
      <div className="space-y-3">
        {orders.map(order => {
          const cfg = STATUS_CONFIG[order.status];
          return (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-4">
              {/* 주문 헤더 */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {order.customer_name ?? "익명"} 님
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    {order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                  {cfg.label}
                </span>
              </div>

              {/* 메뉴 */}
              <div className="space-y-1 mb-3">
                {order.order_items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-700">
                    <span>{item.menu_items?.name} × {item.quantity}</span>
                    <span>{(item.unit_price * item.quantity).toLocaleString()}원</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="font-bold text-orange-500">{order.total_amount.toLocaleString()}원</span>
                <div className="flex gap-2">
                  {order.status !== "done" && order.status !== "cancelled" && (
                    <button
                      onClick={() => updateStatus(order.id, "cancelled")}
                      disabled={updatingId === order.id}
                      className="text-xs text-gray-400 hover:text-red-500 px-2 py-1"
                    >
                      취소
                    </button>
                  )}
                  {cfg.next && (
                    <button
                      onClick={() => updateStatus(order.id, cfg.next!)}
                      disabled={updatingId === order.id}
                      className="bg-orange-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                      {updatingId === order.id ? "..." : cfg.nextLabel}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {orders.length === 0 && (
        <div className="text-center text-gray-400 py-20">
          <div className="text-5xl mb-3">📋</div>
          <p>현재 처리 중인 주문이 없습니다</p>
          <p className="text-xs mt-1">새 주문이 오면 여기에 표시됩니다 (5초마다 자동 갱신)</p>
        </div>
      )}
    </div>
  );
}
