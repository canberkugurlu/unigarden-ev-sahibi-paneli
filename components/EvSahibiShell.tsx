"use client";

import Sidebar from "./Sidebar";
import MobileLayout from "./MobileLayout";

interface Props {
  ad: string; soyad: string;
  children: React.ReactNode;
}

export default function EvSahibiShell({ ad, soyad, children }: Props) {
  return (
    <>
      <div className="hidden md:flex h-screen overflow-hidden bg-gray-50">
        <div className="w-64 shrink-0">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-4 text-xs text-gray-400 text-right">
              Hoş geldiniz, <span className="font-medium text-gray-600">{ad} {soyad}</span>
            </div>
            {children}
          </div>
        </main>
      </div>
      <MobileLayout ad={ad} soyad={soyad}>{children}</MobileLayout>
    </>
  );
}
