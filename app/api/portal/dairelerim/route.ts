import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const konutlar = await prisma.konut.findMany({
    where: { daireSahibiId: session.id },
    include: {
      sozlesmeler: {
        where: { durum: "Aktif" },
        include: { ogrenci: { select: { ad: true, soyad: true, telefon: true, email: true } } },
        orderBy: { baslangicTarihi: "desc" },
        take: 1,
      },
    },
  });
  return NextResponse.json(konutlar);
}
