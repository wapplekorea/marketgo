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
  pending:   { label: "접수 대기",  accent: "#FF9500", bg: "rgba(255,149,0,0.12)",   next: "confirmed" as const, nextLabel: "접수" },
  confirmed: { label: "준비 중",    accent: "#007AFF", bg: "rgba(0,122,255,0.12)",    next: "ready"     as const, nextLabel: "준비 완료" },
  ready:     { label: "준비 완료",  accent: "#34C759", bg: "rgba(52,199,89,0.12)",    next: "done"      as const, nextLabel: "완료" },
  done:      { label: "완료",       accent: "#8E8E93", bg: "rgba(142,142,147,0.12)", next: null,                  nextLabel: "" },
  cancelled: { label: "취소",       accent: "#FF3B30", bg: "rgba(255,59,48,0.12)",   next: null,                  nextLabel: "" },
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

  const fetchOrders = useCallback(async () => {
    const res = await fetch(`/api/stores/${store.id}/orders`);
    if (res.ok) setOrders(await res.json());
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

  const pendingOrders = orders.filter(o => o.status === "pending");
  const activeOrders = orders.filter(o => o.status === "confirmed" || o.status === "ready");
  const doneOrders   = orders.filter(o => o.status === "done" || o.status === "cancelled");

  function OrderCard({ order }: { order: Order }) {
    const cfg = STATUS_CONFIG[order.status];
    return (
      <div
        className="overflow-hidden"
        style={{ background: "var(--sys-bg2)", borderRadius: "16px" }}
      >
        {/* 카드 헤더 */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div>
            <p className="text-[16px] font-semibold" style={{ color: "var(--sys-label)" }}>
              {order.customer_name ?? "익명"} 님
            </p>
            <p className="text-[12px] font-mono mt-0.5" style={{ color: "var(--sys-label3)" }}>
              {order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <span
            className="text-[12px] font-semibold px-2.5 py-1 rounded-full"
            style={{ color: cfg.accent, background: cfg.bg }}
          >
            {cfg.label}
          </span>
        </div>

        {/* 메뉴 항목 */}
        <div
          className="mx-4 py-3 space-y-1.5"
          style={{ borderTop: "0.5px solid var(--sys-sep)" }}
        >
          {order.order_items.map(item => (
            <div key={item.id} className="flex justify-between items-center">
              <span className="text-[14px]" style={{ color: "var(--sys-label)" }}>
                {item.menu_items?.name} × {item.quantity}
              </span>
              <span className="text-[14px]" style={{ color: "var(--sys-label2)" }}>
                {(item.unit_price * item.quantity).toLocaleString()}원
              </span>
            </div>
          ))}
        </div>

        {/* 푸터 */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderTop: "0.5px solid var(--sys-sep)" }}
        >
          <span className="text-[16px] font-bold" style={{ color: "var(--brand)" }}>
            {order.total_amount.toLocaleString()}원
          </span>
          <div className="flex items-center gap-2">
            {order.status !== "done" && order.status !== "cancelled" && (
              <button
                onClick={() => updateStatus(order.id, "cancelled")}
                disabled={updatingId === order.id}
                className="text-[13px] px-3 py-1.5 rounded-[10px] font-medium transition-opacity active:opacity-60 disabled:opacity-40"
                style={{
                  color: "var(--sys-red)",
                  background: "rgba(255,59,48,0.10)",
                }}
              >
                취소
              </button>
            )}
            {cfg.next && (
              <button
                onClick={() => updateStatus(order.id, cfg.next!)}
                disabled={updatingId === order.id}
                className="text-[14px] font-semibold px-4 py-1.5 rounded-[10px] text-white transition-opacity active:opacity-80 disabled:opacity-40"
                style={{ background: "var(--brand)" }}
              >
                {updatingId === order.id ? "..." : cfg.nextLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 pb-28">

      {/* 가게 상태 카드 */}
      <div
        className="flex items-center justify-between px-4 py-4 mb-5"
        style={{ background: "var(--sys-bg2)", borderRadius: "16px" }}
      >
        <div>
          <p className="text-[16px] font-semibold" style={{ color: "var(--sys-label)" }}>
            {store.name}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: isOpen ? "var(--sys-green)" : "var(--sys-label3)" }}
            />
            <p className="text-[13px] font-medium" style={{ color: isOpen ? "var(--sys-green)" : "var(--sys-label3)" }}>
              {isOpen ? "영업 중" : "준비 중"}
            </p>
          </div>
        </div>
        <button
          onClick={toggleOpen}
          disabled={togglingOpen}
          className="text-[14px] font-semibold px-4 py-2 rounded-[12px] transition-opacity active:opacity-70 disabled:opacity-40"
          style={isOpen
            ? { color: "var(--sys-label2)", background: "var(--sys-fill)" }
            : { color: "#fff", background: "var(--brand)" }
          }
        >
          {togglingOpen ? "..." : isOpen ? "영업 종료" : "영업 시작"}
        </button>
      </div>

      {/* 접수 대기 */}
      {pendingOrders.length > 0 && (
        <section className="mb-5">
          <div className="flex items-center gap-2 mb-3 px-1">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: "var(--sys-label3)" }}>
              접수 대기
            </h2>
            <span
              className="text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center text-white"
              style={{ background: "var(--sys-red)" }}
            >
              {pendingOrders.length}
            </span>
          </div>
          <div className="space-y-2">
            {pendingOrders.map(o => <OrderCard key={o.id} order={o} />)}
          </div>
        </section>
      )}

      {/* 진행 중 */}
      {activeOrders.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide mb-3 px-1" style={{ color: "var(--sys-label3)" }}>
            진행 중
          </h2>
          <div className="space-y-2">
            {activeOrders.map(o => <OrderCard key={o.id} order={o} />)}
          </div>
        </section>
      )}

      {/* 완료 */}
      {doneOrders.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide mb-3 px-1" style={{ color: "var(--sys-label3)" }}>
            완료
          </h2>
          <div className="space-y-2 opacity-60">
            {doneOrders.map(o => <OrderCard key={o.id} order={o} />)}
          </div>
        </section>
      )}

      {orders.length === 0 && (
        <div className="text-center py-24">
          <div className="text-[52px] mb-4">📋</div>
          <p className="text-[16px] font-medium" style={{ color: "var(--sys-label2)" }}>
            처리 중인 주문이 없습니다
          </p>
          <p className="text-[13px] mt-1" style={{ color: "var(--sys-label3)" }}>
            새 주문은 5초마다 자동으로 갱신됩니다
          </p>
        </div>
      )}
    </div>
  );
}
