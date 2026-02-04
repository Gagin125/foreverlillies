import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const checkoutEnabled = process.env.CHECKOUT_ENABLED === "true";
  if (checkoutEnabled) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("checkout", "disabled");
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/checkout/:path*", "/payment-success/:path*", "/api/paypal/:path*"]
};
