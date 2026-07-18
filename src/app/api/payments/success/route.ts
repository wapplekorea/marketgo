import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const paymentKey = url.searchParams.get("paymentKey")!;
  const orderId = url.searchParams.get("orderId")!;
  const amount = Number(url.searchParams.get("amount"));

  // 결제 확인
  const confirmRes = await fetch(`${url.origin}/api/payments/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  if (confirmRes.ok) {
    return NextResponse.redirect(new URL(`/order/${orderId}`, req.url));
  } else {
    return NextResponse.redirect(new URL(`/order/${orderId}/pay?fail=true`, req.url));
  }
}
