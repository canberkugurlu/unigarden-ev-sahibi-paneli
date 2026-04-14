import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, sifre } = await req.json().catch(() => ({}));
  let sahip = null as Awaited<ReturnType<typeof prisma.daireSahibi.findFirst>> | null;

  if (!email || !sifre) {
    sahip = await prisma.daireSahibi.findFirst({
      where: { email: { not: null } },
      orderBy: [{ olusturmaTar: "asc" }],
    });
    if (!sahip) {
      return NextResponse.json({ error: "Sistemde ev sahibi bulunamadı." }, { status: 404 });
    }
  } else {
    sahip = await prisma.daireSahibi.findFirst({ where: { email } });
    if (!sahip || !sahip.sifre) {
      return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
    }
    const dogru = await bcrypt.compare(sifre, sahip.sifre);
    if (!dogru) {
      return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
    }
  }

  const token = await signToken({ id: sahip.id, ad: sahip.ad, soyad: sahip.soyad, email: sahip.email ?? "" });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
