import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 소유자 확인
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .eq("owner_id", user.id)
    .single();

  if (!store) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, menu_items(name))")
    .eq("store_id", storeId)
    .neq("status", "done")
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json(orders ?? []);
}
