import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // 현재 사용자의 가게 조회
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!store) {
    redirect("/merchant/setup");
  }

  // 오늘 주문 (최근 50건)
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, menu_items(name))")
    .eq("store_id", store.id)
    .neq("status", "done")
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(50);

  return <DashboardClient store={store} initialOrders={orders ?? []} />;
}
