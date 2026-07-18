import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: store } = await supabase
    .from("stores")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!store) redirect("/merchant/setup");

  // 최근 30일 주문
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data: orders } = await supabase
    .from("orders")
    .select("total_amount, status, created_at")
    .eq("store_id", store.id)
    .neq("status", "cancelled")
    .gte("created_at", since.toISOString());

  const totalRevenue = (orders ?? []).reduce((s, o) => s + o.total_amount, 0);
  const totalOrders = (orders ?? []).length;
  const doneOrders = (orders ?? []).filter(o => o.status === "done").length;

  // 일별 매출 (최근 7일)
  const dailyMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyMap[d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })] = 0;
  }
  (orders ?? []).forEach(o => {
    const day = new Date(o.created_at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
    if (day in dailyMap) dailyMap[day] += o.total_amount;
  });
  const daily = Object.entries(dailyMap);
  const maxDaily = Math.max(...daily.map(([, v]) => v), 1);

  return (
    <div className="px-4 py-5 pb-24">
      <h1 className="text-lg font-bold text-gray-900 mb-4">매출 분석</h1>
      <p className="text-xs text-gray-400 mb-4">최근 30일 기준</p>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: "총 매출", value: `${totalRevenue.toLocaleString()}원`, color: "text-orange-500" },
          { label: "총 주문", value: `${totalOrders}건`,                    color: "text-blue-500" },
          { label: "완료 주문", value: `${doneOrders}건`,                   color: "text-green-600" },
          { label: "완료율", value: totalOrders ? `${Math.round(doneOrders / totalOrders * 100)}%` : "—", color: "text-purple-600" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* 일별 매출 차트 */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">최근 7일 매출</h2>
        <div className="flex items-end gap-1.5 h-28">
          {daily.map(([day, amount]) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-orange-100 rounded-t-sm relative"
                style={{ height: `${(amount / maxDaily) * 100}%`, minHeight: amount > 0 ? "4px" : "2px" }}
              >
                {amount > 0 && (
                  <div
                    className="absolute inset-0 bg-orange-400 rounded-t-sm"
                    title={`${amount.toLocaleString()}원`}
                  />
                )}
              </div>
              <span className="text-[9px] text-gray-400 whitespace-nowrap">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {totalOrders === 0 && (
        <div className="text-center text-gray-400 py-8">
          <p className="text-sm">아직 주문 데이터가 없습니다</p>
        </div>
      )}
    </div>
  );
}
