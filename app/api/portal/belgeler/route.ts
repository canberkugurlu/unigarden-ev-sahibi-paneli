import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const konutlar = await prisma.konut.findMany({
    where: { daireSahibiId: session.id },
    select: { id: true },
  });
  const konutIds = konutlar.map(k => k.id);

  const belgeler = await prisma.belge.findMany({
    where: { konutId: { in: konutIds } },
    include: { konut: { select: { daireNo: true, blok: true } } },
    orderBy: { olusturmaTar: "desc" },
  });
  return NextResponse.json(belgeler);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const formData = await req.formData();
  const dosya = formData.get("dosya") as File | null;
  const konutId = formData.get("konutId") as string;
  const ad = formData.get("ad") as string;
  const tip = (formData.get("tip") as string) || "Diger";

  if (!dosya || !konutId || !ad) {
    return NextResponse.json({ error: "Dosya, konutId ve ad zorunludur." }, { status: 400 });
  }

  // Verify this konut belongs to this owner
  const konut = await prisma.konut.findFirst({ where: { id: konutId, daireSahibiId: session.id } });
  if (!konut) return NextResponse.json({ error: "Bu daireye erişim yetkiniz yok." }, { status: 403 });

  const ext = dosya.name.split(".").pop() ?? "bin";
  const dosyaAdi = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const dosyaYolu = `/uploads/belgeler/${dosyaAdi}`;

  // Save to admin panel's public directory (shared static files)
  const adminPublicPath = path.join(process.cwd(), "..", "ogrenci-kira-paneli", "public", "uploads", "belgeler", dosyaAdi);
  const buf = Buffer.from(await dosya.arrayBuffer());
  await writeFile(adminPublicPath, buf);

  const belge = await prisma.belge.create({
    data: { ad, tip, dosyaYolu, konutId, yukleyenTip: "EvSahibi", yukleyenId: session.id, daireSahibiId: session.id },
  });
  return NextResponse.json(belge, { status: 201 });
}
