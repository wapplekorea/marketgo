import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function checkOwner(supabase: Awaited<ReturnType<typeof createClient>>, itemId: string, userId: string) {
  const { data } = await supabase
    .from("menu_items")
    .select("id, stores(owner_id)")
    .eq("id", itemId)
    .single();
  const storesField = data?.stores as unknown as { owner_id: string } | null;
  const owner = storesField?.owner_id;
  return owner === userId ? data : null;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const owned = await checkOwner(supabase, itemId, user.id);
  if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const allowed = ["name", "name_en", "price", "is_available", "sort_order", "image_url"];
  const update: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k in body) update[k] = body[k];
  }

  const { data, error } = await supabase
    .from("menu_items")
    .update(update)
    .eq("id", itemId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const owned = await checkOwner(supabase, itemId, user.id);
  if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await supabase.from("menu_items").delete().eq("id", itemId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
