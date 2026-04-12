import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  // Geçmişte sahibi olduğu ama satmış olduğu daireleri de dahil etmek için DaireSahipligi üzerinden de gider
  const sahiplikler = await prisma.daireSahipligi.findMany({
    where: { daireSahibiId: session.id },
    include: {
      konut: {
        include: {
          sozlesmeler: {
            where: { durum: "Aktif" },
            include: { ogrenci: { select: { ad: true, soyad: true, telefon: true, email: true } } },
            orderBy: { baslangicTarihi: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: [{ alisTarihi: "desc" }],
  });

  // Güncel sahibi olduğu daireler (hiç sahiplik kaydı olmayabilir — eski veriler için)
  const guncel = await prisma.konut.findMany({
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

  // Konut bazında birleştir: her daire tek satır, sahiplikler listesi eklenmiş
  type Row = typeof guncel[number] & {
    sahiplikler: { id: string; alisTarihi: Date; satisTarihi: Date | null; alisFiyati: number | null; satisFiyati: number | null; notlar: string | null }[];
  };
  const byKonut = new Map<string, Row>();
  for (const k of guncel) byKonut.set(k.id, { ...k, sahiplikler: [] });
  for (const s of sahiplikler) {
    const key = s.konut.id;
    if (!byKonut.has(key)) byKonut.set(key, { ...s.konut, sahiplikler: [] });
    byKonut.get(key)!.sahiplikler.push({
      id: s.id,
      alisTarihi:  s.alisTarihi,
      satisTarihi: s.satisTarihi,
      alisFiyati:  s.alisFiyati,
      satisFiyati: s.satisFiyati,
      notlar:      s.notlar,
    });
  }
  return NextResponse.json([...byKonut.values()]);
}
