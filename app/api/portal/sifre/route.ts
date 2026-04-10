import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { mevcutSifre, yeniSifre } = await req.json();
  if (!mevcutSifre || !yeniSifre || yeniSifre.length < 6) {
    return NextResponse.json({ error: "En az 6 karakterli yeni şifre gerekli." }, { status: 400 });
  }

  const sahip = await prisma.daireSahibi.findUnique({ where: { id: session.id } });
  if (!sahip?.sifre) return NextResponse.json({ error: "Şifre bulunamadı." }, { status: 400 });

  const dogru = await bcrypt.compare(mevcutSifre, sahip.sifre);
  if (!dogru) return NextResponse.json({ error: "Mevcut şifre yanlış." }, { status: 400 });

  const hash = await bcrypt.hash(yeniSifre, 10);
  await prisma.daireSahibi.update({ where: { id: session.id }, data: { sifre: hash } });
  return NextResponse.json({ ok: true });
}
