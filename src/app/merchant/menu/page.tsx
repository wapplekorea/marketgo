import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MenuClient from "./MenuClient";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!store) redirect("/merchant/setup");

  const { data: menu } = await supabase
    .from("menu_items")
    .select("*")
    .eq("store_id", store.id)
    .order("sort_order");

  return <MenuClient store={store} initialMenu={menu ?? []} />;
}
