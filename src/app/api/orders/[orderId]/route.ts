import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const { status } = await req.json();

  const valid = ["pending", "confirmed", "ready", "done", "cancelled"];
  if (!valid.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 해당 주문의 가게가 현재 사용자 소유인지 확인
  const { data: order } = await supabase
    .from("orders")
    .select("store_id, stores(owner_id)")
    .eq("id", orderId)
    .single();

  const storeOwner = (order?.stores as unknown as { owner_id: string } | null)?.owner_id;
  if (!order || storeOwner !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
