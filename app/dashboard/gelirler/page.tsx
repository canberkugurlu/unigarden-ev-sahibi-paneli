"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Odeme {
  id: string; tutar: number; tip: string; odenmeTarihi: string; aciklama?: string;
  sozlesme: {
    sozlesmeNo: string;
    konut: { daireNo: string; blok: string };
    ogrenci: { ad: string; soyad: string };
  };
}

export default function GelirlerPage() {
  const [odemeler, setOdemeler] = useState<Odeme[]>([]);

  useEffect(() => {
    fetch("/api/portal/gelirler").then(r => r.json()).then(setOdemeler);
  }, []);

  const toplam = odemeler.reduce((s, o) => s + o.tutar, 0);
  const buAy = new Date().getMonth();
  const buYil = new Date().getFullYear();
  const buAyOdeme = odemeler
    .filter(o => { const d = new Date(o.odenmeTarihi); return d.getMonth() === buAy && d.getFullYear() === buYil; })
    .reduce((s, o) => s + o.tutar, 0);

  const fmt = (d: string) => format(new Date(d), "d MMM yyyy", { locale: tr });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800">Kira Gelirleri</h2>
        <p className="text-xs text-gray-400">{odemeler.length} ödeme kaydı</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 rounded-xl p-5">
          <p className="text-xs text-emerald-600 font-medium mb-1">Bu Ay Toplam</p>
          <p className="text-2xl font-bold text-emerald-700">{buAyOdeme.toLocaleString("tr-TR")} ₺</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-5">
          <p className="text-xs text-blue-600 font-medium mb-1">Tüm Zamanlar</p>
          <p className="text-2xl font-bold text-blue-700">{toplam.toLocaleString("tr-TR")} ₺</p>
        </div>
      </div>

      {odemeler.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
          <p>Henüz ödeme kaydı yok</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Daire</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Kiracı</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Tip</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Tarih</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {odemeler.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700 font-medium">{o.sozlesme.konut.daireNo}</td>
                  <td className="px-4 py-3 text-gray-600">{o.sozlesme.ogrenci.ad} {o.sozlesme.ogrenci.soyad}</td>
                  <td className="px-4 py-3 text-gray-500">{o.tip}</td>
                  <td className="px-4 py-3 text-gray-500">{fmt(o.odenmeTarihi)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-700">{o.tutar.toLocaleString("tr-TR")} ₺</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
