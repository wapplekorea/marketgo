import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PaymentClient from "./PaymentClient";

export default async function PayPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, stores(name)")
    .eq("id", orderId)
    .single();

  if (!order) notFound();

  return (
    <PaymentClient
      orderId={orderId}
      amount={order.total_amount}
      storeName={(order.stores as { name: string } | null)?.name ?? ""}
      customerName={order.customer_name ?? ""}
    />
  );
}
