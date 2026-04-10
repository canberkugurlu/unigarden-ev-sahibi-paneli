import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { konutId, kiraBedeli } = await req.json();
  if (!konutId || typeof kiraBedeli !== "number" || kiraBedeli <= 0) {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }

  // Verify ownership
  const konut = await prisma.konut.findFirst({ where: { id: konutId, daireSahibiId: session.id } });
  if (!konut) return NextResponse.json({ error: "Bu daireye erişim yetkiniz yok." }, { status: 403 });

  const updated = await prisma.konut.update({ where: { id: konutId }, data: { kiraBedeli } });
  return NextResponse.json(updated);
}
