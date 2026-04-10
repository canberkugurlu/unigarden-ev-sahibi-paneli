import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const { icerik } = await req.json();
  if (!icerik?.trim()) return NextResponse.json({ error: "Yorum boş olamaz." }, { status: 400 });

  const yorum = await prisma.bakimTalebiYorum.create({
    data: {
      icerik,
      yazarTip: "EvSahibi",
      yazarId: session.id,
      yazarAd: `${session.ad} ${session.soyad}`,
      bakimTalebiId: id,
      daireSahibiId: session.id,
    },
  });
  return NextResponse.json(yorum, { status: 201 });
}
