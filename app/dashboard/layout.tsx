import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import EvSahibiShell from "@/components/EvSahibiShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/giris");

  return (
    <EvSahibiShell ad={session.ad} soyad={session.soyad}>
      {children}
    </EvSahibiShell>
  );
}
