"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MenuItem = {
  id: string;
  name: string;
  name_en?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
};

type Store = {
  id: string;
  name: string;
  category: string;
  description?: string;
  is_open: boolean;
  markets?: { name: string };
};

type CartItem = MenuItem & { qty: number };

export default function StoreClient({
  store,
  menu,
  marketId,
}: {
  store: Store;
  menu: MenuItem[];
  marketId: string;
}) {
  const router = useRouter();
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [customerName, setCustomerName] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const cartItems = Object.values(cart).filter(i => i.qty > 0);
  const totalCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  function addItem(item: MenuItem) {
    setCart(c => ({
      ...c,
      [item.id]: { ...item, qty: (c[item.id]?.qty ?? 0) + 1 },
    }));
  }

  function removeItem(id: string) {
    setCart(c => {
      const qty = (c[id]?.qty ?? 0) - 1;
      if (qty <= 0) {
        const next = { ...c };
        delete next[id];
        return next;
      }
      return { ...c, [id]: { ...c[id], qty } };
    });
  }

  async function placeOrder() {
    if (!customerName.trim()) {
      alert("성함을 입력해주세요");
      return;
    }
    if (cartItems.length === 0) return;

    setOrdering(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: store.id,
          customer_name: customerName.trim(),
          items: cartItems.map(i => ({
            menu_item_id: i.id,
            quantity: i.qty,
            unit_price: i.price,
          })),
          total_amount: totalPrice,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/order/${data.id}/pay`);
    } catch {
      alert("주문에 실패했습니다. 다시 시도해주세요.");
      setOrdering(false);
    }
  }

  return (
    <div className="min-h-dvh pb-36" style={{ background: "var(--sys-bg)" }}>

      {/* iOS Navigation Bar */}
      <div
        className="sticky top-0 z-10 px-4 pt-safe"
        style={{
          background: "rgba(242,242,247,0.88)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "0.5px solid var(--sys-sep2)",
        }}
      >
        <div className="flex items-center h-11 gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-0.5 -ml-1 active:opacity-50 transition-opacity"
            style={{ color: "var(--brand)" }}
          >
            <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
              <path d="M8.5 1.5L1.5 8.5L8.5 15.5" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[17px] ml-1">{store.markets?.name}</span>
          </button>
        </div>

        <div className="pb-3 pt-1">
          <h1 className="text-[22px] font-bold leading-tight" style={{ color: "var(--sys-label)" }}>
            {store.name}
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--sys-label2)" }}>
            {store.category}
          </p>
          {!store.is_open && (
            <div
              className="mt-2 text-[13px] font-medium px-3 py-2 rounded-[10px]"
              style={{ background: "rgba(255,59,48,0.1)", color: "var(--sys-red)" }}
            >
              현재 준비 중입니다. 주문이 제한될 수 있습니다.
            </div>
          )}
        </div>
      </div>

      {/* 메뉴 목록 */}
      <div className="px-4 py-3 space-y-2">
        {menu.map(item => (
          <div
            key={item.id}
            className="flex gap-3 p-4"
            style={{
              background: "var(--sys-bg2)",
              borderRadius: "16px",
              opacity: item.is_available ? 1 : 0.45,
            }}
          >
            {/* 이미지 */}
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-[80px] h-[80px] object-cover shrink-0"
                style={{ borderRadius: "12px" }}
              />
            ) : (
              <div
                className="w-[80px] h-[80px] shrink-0 flex items-center justify-center text-3xl"
                style={{
                  background: "var(--brand-light)",
                  borderRadius: "12px",
                }}
              >
                🍽️
              </div>
            )}

            {/* 텍스트 */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <p className="font-semibold text-[16px] leading-snug" style={{ color: "var(--sys-label)" }}>
                  {item.name}
                </p>
                {item.name_en && (
                  <p className="text-[12px] mt-0.5" style={{ color: "var(--sys-label3)" }}>
                    {item.name_en}
                  </p>
                )}
                <p className="text-[15px] font-semibold mt-1" style={{ color: "var(--brand)" }}>
                  {item.price.toLocaleString()}원
                </p>
              </div>

              {/* 수량 조절 */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={!cart[item.id]?.qty}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none transition-opacity disabled:opacity-25"
                  style={{
                    background: "var(--sys-fill)",
                    color: "var(--sys-label)",
                  }}
                >
                  −
                </button>
                <span
                  className="text-[15px] font-semibold w-5 text-center tabular-nums"
                  style={{ color: "var(--sys-label)" }}
                >
                  {cart[item.id]?.qty ?? 0}
                </span>
                <button
                  onClick={() => addItem(item)}
                  disabled={!item.is_available}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none transition-opacity disabled:opacity-30"
                  style={{ background: "var(--brand)", color: "#fff" }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}

        {menu.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🍽️</div>
            <p className="text-[15px]" style={{ color: "var(--sys-label3)" }}>
              등록된 메뉴가 없습니다
            </p>
          </div>
        )}
      </div>

      {/* 장바구니 플로팅 버튼 */}
      {totalCount > 0 && !showCart && (
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pb-safe z-20 pointer-events-none">
          <button
            onClick={() => setShowCart(true)}
            className="w-full pointer-events-auto flex items-center justify-between px-5 py-4 transition-transform active:scale-[0.97]"
            style={{
              background: "var(--brand)",
              borderRadius: "18px",
              boxShadow: "0 8px 30px rgba(255,107,0,0.40)",
            }}
          >
            <span
              className="text-white text-[13px] font-bold w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.2)" }}
            >
              {totalCount}
            </span>
            <span className="text-white font-semibold text-[16px]">주문하기</span>
            <span className="text-white font-bold text-[16px]">{totalPrice.toLocaleString()}원</span>
          </button>
        </div>
      )}

      {/* 장바구니 바텀 시트 */}
      {showCart && (
        <div className="fixed inset-0 z-30 flex flex-col justify-end">
          {/* 딤 배경 */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setShowCart(false)}
          />

          {/* 시트 */}
          <div
            className="relative ios-scroll overflow-y-auto"
            style={{
              background: "var(--sys-bg2)",
              borderRadius: "20px 20px 0 0",
              maxHeight: "82dvh",
              paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
            }}
          >
            {/* 드래그 핸들 */}
            <div className="flex justify-center pt-3 pb-1">
              <div
                className="w-9 h-1"
                style={{ background: "var(--sys-label4)", borderRadius: "100px" }}
              />
            </div>

            <div className="px-5 pt-2 pb-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[20px] font-bold" style={{ color: "var(--sys-label)" }}>
                  주문 확인
                </h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[15px] font-semibold transition-opacity active:opacity-50"
                  style={{ background: "var(--sys-fill)", color: "var(--sys-label2)" }}
                >
                  ✕
                </button>
              </div>

              {/* 주문 아이템 */}
              <div className="space-y-3 mb-5">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div>
                      <p className="text-[15px] font-medium" style={{ color: "var(--sys-label)" }}>
                        {item.name}
                      </p>
                      <p className="text-[13px] mt-0.5" style={{ color: "var(--sys-label3)" }}>
                        {item.price.toLocaleString()}원 × {item.qty}
                      </p>
                    </div>
                    <p className="text-[15px] font-semibold" style={{ color: "var(--sys-label)" }}>
                      {(item.price * item.qty).toLocaleString()}원
                    </p>
                  </div>
                ))}
              </div>

              {/* 구분선 + 합계 */}
              <div
                className="pt-4 pb-4 mb-4"
                style={{ borderTop: "0.5px solid var(--sys-sep2)" }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[17px] font-bold" style={{ color: "var(--sys-label)" }}>
                    합계
                  </span>
                  <span className="text-[20px] font-bold" style={{ color: "var(--brand)" }}>
                    {totalPrice.toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* 이름 입력 */}
              <div className="mb-5">
                <p className="text-[13px] font-medium mb-2" style={{ color: "var(--sys-label2)" }}>
                  주문자 성함
                </p>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full text-[16px] px-4 py-3 outline-none"
                  style={{
                    background: "var(--sys-bg)",
                    borderRadius: "12px",
                    color: "var(--sys-label)",
                    border: "none",
                  }}
                />
              </div>

              {/* CTA 버튼 */}
              <button
                onClick={placeOrder}
                disabled={ordering}
                className="w-full py-4 text-white text-[17px] font-semibold transition-opacity active:opacity-80 disabled:opacity-50"
                style={{
                  background: ordering ? "var(--sys-label3)" : "var(--brand)",
                  borderRadius: "16px",
                }}
              >
                {ordering ? "주문 중..." : `${totalPrice.toLocaleString()}원 결제하기`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
