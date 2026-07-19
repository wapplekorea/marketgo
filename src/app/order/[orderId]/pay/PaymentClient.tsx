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
  const [ready, setReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) {
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
    <div className="min-h-dvh" style={{ background: "var(--sys-bg)" }}>

      {/* iOS Navigation Bar */}
      <div
        className="sticky top-0 z-10"
        style={{
          background: "rgba(242,242,247,0.88)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "0.5px solid var(--sys-sep2)",
        }}
      >
        <div className="flex items-center h-11 px-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-0.5 -ml-1 active:opacity-50 transition-opacity"
            style={{ color: "var(--brand)" }}
          >
            <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
              <path d="M8.5 1.5L1.5 8.5L8.5 15.5" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[17px] ml-1">뒤로</span>
          </button>
          <h1
            className="absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold"
            style={{ color: "var(--sys-label)" }}
          >
            결제
          </h1>
        </div>
      </div>

      <div className="px-4 py-5 max-w-sm mx-auto">

        {/* 가게 정보 카드 */}
        <div
          className="px-5 py-4 mb-4"
          style={{ background: "var(--sys-bg2)", borderRadius: "16px" }}
        >
          <p className="text-[13px] mb-1" style={{ color: "var(--sys-label2)" }}>결제 대상</p>
          <p className="text-[17px] font-semibold" style={{ color: "var(--sys-label)" }}>{storeName}</p>
          <p className="text-[32px] font-bold mt-2 tabular-nums" style={{ color: "var(--sys-label)" }}>
            {amount.toLocaleString()}원
          </p>
        </div>

        {/* Toss 위젯 영역 */}
        <div
          className="mb-4 overflow-hidden"
          style={{ background: "var(--sys-bg2)", borderRadius: "16px" }}
        >
          <div id="payment-method" />
          <div id="payment-agreement" />
        </div>

        {/* 개발 모드 안내 */}
        {!process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY && (
          <div
            className="px-4 py-3 mb-4 text-[13px] rounded-[12px]"
            style={{ background: "rgba(255,149,0,0.1)", color: "var(--sys-orange)" }}
          >
            개발 모드 — Toss 결제 키 미설정 (주문 완료로 바로 이동)
          </div>
        )}

        {/* 결제 버튼 */}
        <button
          onClick={handlePay}
          disabled={!ready}
          className="w-full py-4 text-white text-[17px] font-semibold transition-opacity active:opacity-80 disabled:opacity-40"
          style={{
            background: "var(--brand)",
            borderRadius: "16px",
            boxShadow: ready ? "0 4px 20px rgba(255,107,0,0.35)" : "none",
          }}
        >
          {ready ? `${amount.toLocaleString()}원 결제하기` : "결제 준비 중..."}
        </button>
      </div>
    </div>
  );
}
