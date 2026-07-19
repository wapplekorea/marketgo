"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TossPayments: any;
  }
}

export default function PaymentClient({
  orderId,
  amount,
  storeName,
  customerName,
}: {
  orderId: string;
  amount: number;
  storeName: string;
  customerName: string;
}) {
  const router = useRouter();
  const paymentRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) {
      // Toss 키 없으면 직접 주문 완료 처리 (개발 환경)
      setReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v2/standard";
    script.onload = async () => {
      try {
        const tossPayments = window.TossPayments(clientKey);
        const widgets = tossPayments.widgets({ customerKey: `customer_${orderId}` });
        widgetRef.current = widgets;

        await widgets.setAmount({ currency: "KRW", value: amount });
        await Promise.all([
          widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
          widgets.renderAgreement({ selector: "#payment-agreement", variantKey: "AGREEMENT" }),
        ]);
      } catch (e) {
        console.warn("Toss widget init failed, using fallback", e);
        widgetRef.current = null;
      }
      setReady(true);
    };
    script.onerror = () => setReady(true);
    document.head.appendChild(script);
  }, [orderId, amount]);

  async function handlePay() {
    if (!widgetRef.current) {
      // Toss 없는 개발 환경 — 바로 완료 페이지
      router.push(`/order/${orderId}`);
      return;
    }

    await widgetRef.current.requestPayment({
      orderId,
      orderName: `${storeName} 주문`,
      customerName,
      successUrl: `${window.location.origin}/api/payments/success?orderId=${orderId}`,
      failUrl: `${window.location.origin}/order/${orderId}/pay?fail=true`,
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-sm mx-auto">
        <button onClick={() => router.back()} className="text-sm text-gray-400 mb-4">← 뒤로</button>
        <h1 className="text-lg font-bold text-gray-900 mb-1">결제</h1>
        <p className="text-sm text-gray-500 mb-4">{storeName}</p>

        <div id="payment-method" className="mb-3" />
        <div id="payment-agreement" className="mb-4" />

        {!process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY && (
          <div className="bg-yellow-50 rounded-lg px-3 py-2 mb-4 text-xs text-yellow-700">
            개발 모드 — Toss 결제 키 미설정 (주문 완료로 바로 이동)
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={!ready}
          className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl disabled:opacity-50 transition-colors"
        >
          {ready ? `${amount.toLocaleString()}원 결제하기` : "결제 준비 중..."}
        </button>
      </div>
    </div>
  );
}
