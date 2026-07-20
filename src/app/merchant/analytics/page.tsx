import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AnalyticsChart from "./AnalyticsChart";

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

  const all = orders ?? [];
  const totalRevenue = all.reduce((s, o) => s + o.total_amount, 0);
  const totalOrders  = all.length;
  const doneOrders   = all.filter(o => o.status === "done").length;
  const completionRate = totalOrders ? Math.round(doneOrders / totalOrders * 100) : 0;

  // 일별 매출 (최근 7일)
  const dailyMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyMap[d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })] = 0;
  }
  all.forEach(o => {
    const day = new Date(o.created_at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
    if (day in dailyMap) dailyMap[day] += o.total_amount;
  });
  const daily = Object.entries(dailyMap).map(([day, amount]) => ({ day, amount }));

  const kpis = [
    { label: "총 매출",   value: `${totalRevenue.toLocaleString()}원`, accent: "var(--brand)" },
    { label: "총 주문",   value: `${totalOrders}건`,                    accent: "var(--sys-blue)" },
    { label: "완료 주문", value: `${doneOrders}건`,                     accent: "var(--sys-green)" },
    { label: "완료율",    value: totalOrders ? `${completionRate}%` : "—", accent: "#AF52DE" },
  ];

  return (
    <div className="px-4 py-5 pb-28" style={{ background: "var(--sys-bg)" }}>

      {/* 헤더 */}
      <h1 className="text-[22px] font-bold mb-1" style={{ color: "var(--sys-label)" }}>
        매출 분석
      </h1>
      <p className="text-[13px] mb-5" style={{ color: "var(--sys-label3)" }}>최근 30일 기준</p>

      {/* KPI 카드 2×2 */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {kpis.map(kpi => (
          <div
            key={kpi.label}
            className="px-4 py-4"
            style={{ background: "var(--sys-bg2)", borderRadius: "16px" }}
          >
            <p className="text-[12px] mb-1.5" style={{ color: "var(--sys-label3)" }}>{kpi.label}</p>
            <p className="text-[22px] font-bold tabular-nums" style={{ color: kpi.accent }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* 인터랙티브 바 차트 */}
      <AnalyticsChart daily={daily} />

      {totalOrders === 0 && (
        <div className="text-center py-10">
          <p className="text-[15px]" style={{ color: "var(--sys-label3)" }}>
            아직 주문 데이터가 없습니다
          </p>
        </div>
      )}
    </div>
  );
}
