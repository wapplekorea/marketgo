import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { paymentKey, orderId, amount } = await req.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: "필수 파라미터 누락" }, { status: 400 });
    }

    // Toss Payments 서버 확인 요청
    const secretKey = process.env.TOSS_SECRET_KEY!;
    const encoded = Buffer.from(`${secretKey}:`).toString("base64");

    const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const tossData = await tossRes.json();

    if (!tossRes.ok) {
      return NextResponse.json({ error: tossData.message ?? "결제 실패" }, { status: 400 });
    }

    // Supabase에 결제 기록
    const supabase = await createClient();
    const { error } = await supabase.from("payments").upsert({
      order_id: orderId,
      method: tossData.method ?? "카드",
      amount: tossData.totalAmount ?? amount,
      status: "completed",
      pg_transaction_id: paymentKey,
      paid_at: tossData.approvedAt ?? new Date().toISOString(),
    }, { onConflict: "order_id" });

    if (error) console.error("Payment DB error:", error);

    // 주문 상태를 confirmed로
    await supabase.from("orders").update({ status: "confirmed" }).eq("id", orderId);

    return NextResponse.json({ ok: true, data: tossData });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
