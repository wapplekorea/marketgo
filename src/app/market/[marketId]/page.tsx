import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function MarketPage({ params }: { params: Promise<{ marketId: string }> }) {
  const { marketId } = await params;
  const supabase = await createClient();

  const [{ data: market }, { data: stores }] = await Promise.all([
    supabase.from("markets").select("*").eq("id", marketId).single(),
    supabase.from("stores").select("*").eq("market_id", marketId).order("name"),
  ]);

  if (!market) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-orange-500 text-white px-4 pt-10 pb-6">
        <p className="text-sm opacity-80 mb-1">🛍️ MarketGo</p>
        <h1 className="text-2xl font-bold">{market.name}</h1>
        <p className="text-sm opacity-75 mt-1">{market.address}</p>
      </div>

      {/* 가게 목록 */}
      <div className="px-4 py-5">
        <p className="text-sm text-gray-500 mb-3">가게 {stores?.length ?? 0}곳</p>
        <div className="grid grid-cols-2 gap-3">
          {stores?.map(store => (
            <Link
              key={store.id}
              href={`/market/${marketId}/store/${store.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2 active:scale-95 transition-transform"
            >
              {store.image_url ? (
                <img src={store.image_url} alt={store.name} className="w-full h-28 object-cover rounded-lg" />
              ) : (
                <div className="w-full h-28 bg-orange-50 rounded-lg flex items-center justify-center text-3xl">
                  🍽️
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 text-sm">{store.name}</p>
                <p className="text-xs text-gray-500">{store.category}</p>
              </div>
              <div className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${
                store.is_open ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
              }`}>
                {store.is_open ? "영업 중" : "준비 중"}
              </div>
            </Link>
          ))}
        </div>

        {!stores?.length && (
          <div className="text-center text-gray-400 py-16">
            <div className="text-4xl mb-2">🏪</div>
            <p>등록된 가게가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
