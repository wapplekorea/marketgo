import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import QRClient from "./QRClient";

export default async function QRPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: store } = await supabase
    .from("stores")
    .select("*, markets(id, name)")
    .eq("owner_id", user.id)
    .single();

  if (!store) redirect("/merchant/setup");

  const menuUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/market/${store.markets?.id}/store/${store.id}`;

  return <QRClient store={store} menuUrl={menuUrl} />;
}
