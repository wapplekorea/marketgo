import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { store_id, customer_name, items, total_amount } = body;

    if (!store_id || !items?.length || !total_amount) {
      return NextResponse.json({ error: "필수 항목이 없습니다" }, { status: 400 });
    }

    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY)
      : await createServerClient();

    // 주문 생성
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ store_id, customer_name, total_amount, status: "pending" })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order insert error:", orderError);
      return NextResponse.json({ error: orderError?.message }, { status: 500 });
    }

    // 주문 아이템 생성
    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item: { menu_item_id: string; quantity: number; unit_price: number }) => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }))
    );

    if (itemsError) {
      // 주문 롤백
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
