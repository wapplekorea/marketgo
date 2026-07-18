import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // 가게 소유자 확인
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("id", body.store_id)
    .eq("owner_id", user.id)
    .single();

  if (!store) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabase
    .from("menu_items")
    .insert({
      store_id: body.store_id,
      name: body.name,
      name_en: body.name_en ?? null,
      price: body.price,
      is_available: body.is_available ?? true,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
