import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const konutlar = await prisma.konut.findMany({
    where: { daireSahibiId: session.id },
    select: { id: true },
  });
  const konutIds = konutlar.map(k => k.id);

  const talepler = await prisma.bakimTalebi.findMany({
    where: { konutId: { in: konutIds } },
    include: {
      konut: { select: { daireNo: true, blok: true } },
      ogrenci: { select: { ad: true, soyad: true } },
      yorumlar: { orderBy: { olusturmaTar: "asc" } },
    },
    orderBy: { olusturmaTar: "desc" },
  });
  return NextResponse.json(talepler);
}
