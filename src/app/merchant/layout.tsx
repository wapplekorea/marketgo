import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MerchantNav from "./MerchantNav";

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MerchantNav userEmail={user.email ?? ""} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
