import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "unigarden-evsahibi-jwt-gizli-2024"
);

function girisUrl(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/giris";
  return url;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/giris") || pathname.startsWith("/api/auth") || pathname === "/") {
    return NextResponse.next();
  }

  const token = req.cookies.get("ev_sahibi_token")?.value;
  if (!token) {
    return NextResponse.redirect(girisUrl(req));
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(girisUrl(req));
    res.cookies.delete("ev_sahibi_token");
    return res;
  }
}

export const config = {
  matcher: ["/dashboard/(.*)", "/api/portal/(.*)"],
};
