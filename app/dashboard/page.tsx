export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Building2, TrendingUp, FileText, Wrench } from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/giris");

  const konutlar = await prisma.konut.findMany({
    where: { daireSahibiId: session.id },
    select: { id: true, durum: true },
  });
  const konutIds = konutlar.map(k => k.id);

  const [sozlesme, bakim] = await Promise.all([
    prisma.sozlesme.count({ where: { konutId: { in: konutIds }, durum: "Aktif" } }),
    prisma.bakimTalebi.count({ where: { konutId: { in: konutIds }, durum: { in: ["Bekliyor", "Islemde"] } } }),
  ]);

  const dolu = konutlar.filter(k => k.durum === "Dolu").length;

  const kartlar = [
    { label: "Toplam Daire", value: konutlar.length, icon: Building2, color: "bg-blue-50 text-blue-700", iconColor: "text-blue-600" },
    { label: "Aktif Kiracı", value: dolu, icon: FileText, color: "bg-emerald-50 text-emerald-700", iconColor: "text-emerald-600" },
    { label: "Aktif Sözleşme", value: sozlesme, icon: TrendingUp, color: "bg-purple-50 text-purple-700", iconColor: "text-purple-600" },
    { label: "Açık Bakım Talebi", value: bakim, icon: Wrench, color: "bg-orange-50 text-orange-700", iconColor: "text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Hoş Geldiniz, {session.ad}!</h2>
        <p className="text-sm text-gray-400 mt-1">Dairelerinizin genel durumu</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kartlar.map(k => (
          <div key={k.label} className={`${k.color} rounded-xl p-5`}>
            <div className="flex items-center gap-3 mb-2">
              <k.icon size={20} className={k.iconColor} />
              <p className="text-xs font-medium opacity-75">{k.label}</p>
            </div>
            <p className="text-3xl font-bold">{k.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
