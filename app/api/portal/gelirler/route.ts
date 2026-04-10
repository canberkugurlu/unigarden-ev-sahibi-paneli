import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  // Find all konut IDs belonging to this owner
  const konutlar = await prisma.konut.findMany({
    where: { daireSahibiId: session.id },
    select: { id: true, daireNo: true, blok: true },
  });
  const konutIds = konutlar.map(k => k.id);

  const sozlesmeler = await prisma.sozlesme.findMany({
    where: { konutId: { in: konutIds } },
    select: { id: true },
  });
  const sozlesmeIds = sozlesmeler.map(s => s.id);

  const odemeler = await prisma.odeme.findMany({
    where: { sozlesmeId: { in: sozlesmeIds } },
    include: {
      sozlesme: {
        select: {
          sozlesmeNo: true,
          konut: { select: { daireNo: true, blok: true } },
          ogrenci: { select: { ad: true, soyad: true } },
        },
      },
    },
    orderBy: { odenmeTarihi: "desc" },
  });
  return NextResponse.json(odemeler);
}
