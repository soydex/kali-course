import { type NextRequest, NextResponse } from "next/server";
import { defaultLocale, isValidLocale, locales } from "@/lib/i18n";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`,
  );

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (hasLocale) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const acceptLang = request.headers.get("accept-language") ?? "";
  const preferred = acceptLang.split(",")[0]?.split("-")[0]?.toLowerCase();
  const locale = isValidLocale(preferred ?? "") ? preferred : defaultLocale;

  return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
}

export const config = {
  matcher: ["/((?!_next|api|favicon\\.ico|icon\\.svg).*)"],
};
