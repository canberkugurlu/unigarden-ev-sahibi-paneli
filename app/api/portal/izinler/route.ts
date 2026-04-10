import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const DEFAULT_IZINLER = {
  sayfalar: ["dairelerim", "gelirler", "sozlesmeler", "bakim", "belgeler", "sifre"],
  eylemler: ["kira_guncelle", "yorum_ekle", "belge_yukle"],
};

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const kayit = await prisma.kullaniciIzin.findUnique({
    where: { kullaniciTip_kullaniciId: { kullaniciTip: "EvSahibi", kullaniciId: session.id } },
  });

  if (!kayit || kayit.izinler === "{}") return NextResponse.json(DEFAULT_IZINLER);
  try {
    return NextResponse.json(JSON.parse(kayit.izinler));
  } catch {
    return NextResponse.json(DEFAULT_IZINLER);
  }
}
