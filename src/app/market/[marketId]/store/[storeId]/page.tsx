import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import StoreClient from "./StoreClient";

export default async function StorePage({ params }: { params: Promise<{ marketId: string; storeId: string }> }) {
  const { marketId, storeId } = await params;
  const supabase = await createClient();

  const [{ data: store }, { data: menu }] = await Promise.all([
    supabase.from("stores").select("*, markets(name)").eq("id", storeId).single(),
    supabase.from("menu_items").select("*").eq("store_id", storeId).eq("is_available", true).order("sort_order"),
  ]);

  if (!store) notFound();

  return <StoreClient store={store} menu={menu ?? []} marketId={marketId} />;
}
