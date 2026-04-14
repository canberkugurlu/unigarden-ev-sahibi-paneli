import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, COOKIE } from "@/lib/auth";
import { verifyImpersonationToken } from "@/lib/impersonate";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token eksik" }, { status: 400 });

  const p = await verifyImpersonationToken(token);
  if (!p) return NextResponse.json({ error: "Geçersiz/eski token" }, { status: 401 });
  if (p.targetPanel !== "ev-sahibi") return NextResponse.json({ error: "Token bu panel için değil" }, { status: 400 });

  const sahip = await prisma.daireSahibi.findUnique({ where: { id: p.targetUserId } });
  if (!sahip) return NextResponse.json({ error: "Ev sahibi bulunamadı" }, { status: 404 });

  const authToken = await signToken({
    id: sahip.id, ad: sahip.ad, soyad: sahip.soyad, email: sahip.email ?? "",
  });

  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  res.cookies.set(COOKIE, authToken, {
    httpOnly: true, path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
