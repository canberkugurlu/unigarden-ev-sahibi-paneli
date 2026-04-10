"use client";

import { useEffect, useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Odeme { id: string; tutar: number; tip: string; odenmeTarihi: string; }
interface Sozlesme {
  id: string; sozlesmeNo: string; baslangicTarihi: string; bitisTarihi: string;
  aylikKira: number; depozito: number; durum: string;
  konut: { daireNo: string; blok: string; katNo: number };
  ogrenci: { ad: string; soyad: string; telefon: string; email: string };
  odemeler: Odeme[];
}

const DURUM_RENK: Record<string, string> = {
  Aktif: "bg-green-100 text-green-700",
  Bitti: "bg-gray-100 text-gray-500",
  Iptal: "bg-red-100 text-red-600",
};

export default function SozlesmelerPage() {
  const [sozlesmeler, setSozlesmeler] = useState<Sozlesme[]>([]);
  const [acik, setAcik] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/portal/sozlesmeler").then(r => r.json()).then(setSozlesmeler);
  }, []);

  const fmt = (d: string) => format(new Date(d), "d MMM yyyy", { locale: tr });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800">Sözleşmeler</h2>
        <p className="text-xs text-gray-400">{sozlesmeler.length} sözleşme</p>
      </div>

      {sozlesmeler.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p>Henüz sözleşme yok</p>
        </div>
      )}

      <div className="space-y-3">
        {sozlesmeler.map(s => (
          <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => setAcik(acik === s.id ? null : s.id)}
            >
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-gray-400" />
                <div>
                  <p className="font-medium text-sm text-gray-800">{s.sozlesmeNo}</p>
                  <p className="text-xs text-gray-400">Daire {s.konut.daireNo} · {s.ogrenci.ad} {s.ogrenci.soyad}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DURUM_RENK[s.durum] ?? "bg-gray-100"}`}>{s.durum}</span>
                {acik === s.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
            </div>

            {acik === s.id && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-gray-400">Başlangıç</p><p className="font-medium">{fmt(s.baslangicTarihi)}</p></div>
                  <div><p className="text-xs text-gray-400">Bitiş</p><p className="font-medium">{fmt(s.bitisTarihi)}</p></div>
                  <div><p className="text-xs text-gray-400">Aylık Kira</p><p className="font-medium">{s.aylikKira.toLocaleString("tr-TR")} ₺</p></div>
                  <div><p className="text-xs text-gray-400">Depozito</p><p className="font-medium">{s.depozito.toLocaleString("tr-TR")} ₺</p></div>
                  <div><p className="text-xs text-gray-400">Telefon</p><p className="font-medium">{s.ogrenci.telefon}</p></div>
                  <div><p className="text-xs text-gray-400">E-posta</p><p className="font-medium">{s.ogrenci.email}</p></div>
                </div>

                {s.odemeler.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Son Ödemeler</p>
                    <div className="space-y-1">
                      {s.odemeler.map(o => (
                        <div key={o.id} className="flex justify-between text-xs text-gray-600 bg-gray-50 rounded px-3 py-1.5">
                          <span>{fmt(o.odenmeTarihi)} · {o.tip}</span>
                          <span className="font-medium text-emerald-700">{o.tutar.toLocaleString("tr-TR")} ₺</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
