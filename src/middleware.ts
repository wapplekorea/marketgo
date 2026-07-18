import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 상인 전용 경로 보호
  const merchantPaths = ["/merchant"];
  const isMerchantPath = merchantPaths.some(p => request.nextUrl.pathname.startsWith(p));

  if (isMerchantPath && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // 로그인 상태에서 auth 페이지 접근 시 대시보드로
  if (request.nextUrl.pathname.startsWith("/auth") && user) {
    return NextResponse.redirect(new URL("/merchant/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/merchant/:path*", "/auth/:path*"],
};
