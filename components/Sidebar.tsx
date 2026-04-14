"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Building2, TrendingUp, FileText, Wrench, FolderOpen, KeyRound, LogOut , CheckSquare} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/dairelerim", label: "Dairelerim", icon: Building2 },
  { href: "/dashboard/gelirler", label: "Kira Gelirleri", icon: TrendingUp },
  { href: "/dashboard/sozlesmeler", label: "Sözleşmeler", icon: FileText },
  { href: "/dashboard/bakim", label: "Bakım Talepleri", icon: Wrench },
  { href: "/dashboard/belgeler", label: "Belgeler", icon: FolderOpen },
  { href: "/dashboard/sifre", label: "Şifre Değiştir", icon: KeyRound },
  { href: "/dashboard/gorevlerim", label: "Görevlerim", icon: CheckSquare, color: "bg-blue-500/20 text-blue-400" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const cikis = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/giris");
  };

  return (
    <aside className="w-64 h-full bg-gray-900 text-white flex flex-col">
      <div className="p-5 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-blue-400">UNIGARDEN</h1>
          <p className="text-xs text-gray-400 mt-0.5">Ev Sahibi Portalı</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={cikis}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-full px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          <LogOut size={16} /> Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
