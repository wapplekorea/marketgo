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
          items: cartItems.map(i => ({ menu_item_id: i.id, quantity: i.qty, unit_price: i.price })),
          total_amount: totalPrice,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // 결제 페이지로 이동
      router.push(`/order/${data.id}/pay`);
    } catch (err) {
      alert("주문에 실패했습니다. 다시 시도해주세요.");
      setOrdering(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-4 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-400 mb-2 flex items-center gap-1"
        >
          ← {store.markets?.name}
        </button>
        <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
        <p className="text-sm text-gray-500">{store.category}</p>
        {!store.is_open && (
          <div className="mt-2 text-xs bg-red-50 text-red-500 rounded-lg px-3 py-1.5">
            현재 준비 중입니다. 주문이 제한될 수 있습니다.
          </div>
        )}
      </div>

      {/* 메뉴 */}
      <div className="px-4 py-4 space-y-3">
        {menu.map(item => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-lg shrink-0" />
            ) : (
              <div className="w-20 h-20 bg-orange-50 rounded-lg flex items-center justify-center text-2xl shrink-0">
                🍽️
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{item.name}</p>
              {item.name_en && <p className="text-xs text-gray-400">{item.name_en}</p>}
              <p className="text-orange-500 font-bold mt-1">{item.price.toLocaleString()}원</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={!cart[item.id]?.qty}
                  className="w-7 h-7 rounded-full border border-gray-200 text-gray-600 flex items-center justify-center disabled:opacity-30 text-lg leading-none"
                >
                  −
                </button>
                <span className="text-sm font-medium w-5 text-center">{cart[item.id]?.qty ?? 0}</span>
                <button
                  onClick={() => addItem(item)}
                  className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-lg leading-none"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}

        {menu.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            <div className="text-4xl mb-2">🍽️</div>
            <p>등록된 메뉴가 없습니다</p>
          </div>
        )}
      </div>

      {/* 장바구니 플로팅 버튼 */}
      {totalCount > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 left-4 right-4 bg-orange-500 text-white rounded-xl py-4 flex items-center justify-between px-5 shadow-lg z-20"
        >
          <span className="bg-orange-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {totalCount}
          </span>
          <span className="font-semibold">주문하기</span>
          <span className="font-bold">{totalPrice.toLocaleString()}원</span>
        </button>
      )}

      {/* 장바구니 패널 */}
      {showCart && (
        <div className="fixed inset-0 z-30 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="relative bg-white rounded-t-2xl px-4 pt-4 pb-8 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">주문 확인</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 text-xl">✕</button>
            </div>

            {/* 주문 아이템 */}
            <div className="space-y-2 mb-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.price.toLocaleString()}원 × {item.qty}</p>
                  </div>
                  <p className="font-semibold">{(item.price * item.qty).toLocaleString()}원</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 mb-4">
              <div className="flex justify-between font-bold text-lg">
                <span>합계</span>
                <span className="text-orange-500">{totalPrice.toLocaleString()}원</span>
              </div>
            </div>

            {/* 이름 입력 */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-1 block">주문자 성함</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="홍길동"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <button
              onClick={placeOrder}
              disabled={ordering}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {ordering ? "주문 중..." : `${totalPrice.toLocaleString()}원 결제하기`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
