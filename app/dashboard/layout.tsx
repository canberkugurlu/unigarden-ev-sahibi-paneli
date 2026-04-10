import Sidebar from "@/components/Sidebar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/giris");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4 text-xs text-gray-400 text-right">
            Hoş geldiniz, <span className="font-medium text-gray-600">{session.ad} {session.soyad}</span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
