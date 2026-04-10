"use client";

import { useEffect, useState } from "react";
import { Wrench, ChevronDown, ChevronUp, Send } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Yorum { id: string; icerik: string; yazarTip: string; yazarAd: string; olusturmaTar: string; }
interface BakimTalebi {
  id: string; baslik: string; aciklama: string; durum: string; oncelik: string;
  olusturmaTar: string; tamamlanmaTar?: string;
  konut: { daireNo: string; blok: string };
  ogrenci: { ad: string; soyad: string };
  yorumlar: Yorum[];
}

const DURUM_RENK: Record<string, string> = {
  Bekliyor: "bg-yellow-100 text-yellow-700",
  Islemde: "bg-blue-100 text-blue-700",
  Tamamlandi: "bg-green-100 text-green-700",
  Iptal: "bg-gray-100 text-gray-500",
};
const DURUM_LABEL: Record<string, string> = { Bekliyor: "Bekliyor", Islemde: "İşlemde", Tamamlandi: "Tamamlandı", Iptal: "İptal" };
const ONCELIK_RENK: Record<string, string> = {
  Dusuk: "bg-gray-100 text-gray-500", Normal: "bg-blue-100 text-blue-600",
  Yuksek: "bg-orange-100 text-orange-700", Acil: "bg-red-100 text-red-700",
};
const ONCELIK_LABEL: Record<string, string> = { Dusuk: "Düşük", Normal: "Normal", Yuksek: "Yüksek", Acil: "Acil" };

export default function BakimPage() {
  const [talepler, setTalepler] = useState<BakimTalebi[]>([]);
  const [acik, setAcik] = useState<string | null>(null);
  const [yorumlar, setYorumlar] = useState<Record<string, string>>({});
  const [gonderiliyor, setGonderiliyor] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/portal/bakim").then(r => r.json()).then(setTalepler);
  }, []);

  const yorumGonder = async (talebiId: string) => {
    const icerik = yorumlar[talebiId]?.trim();
    if (!icerik) return;
    setGonderiliyor(talebiId);
    const res = await fetch(`/api/portal/bakim/${talebiId}/yorumlar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icerik }),
    });
    if (res.ok) {
      const yeniYorum = await res.json();
      setTalepler(prev => prev.map(t =>
        t.id === talebiId ? { ...t, yorumlar: [...t.yorumlar, yeniYorum] } : t
      ));
      setYorumlar(prev => ({ ...prev, [talebiId]: "" }));
    }
    setGonderiliyor(null);
  };

  const fmt = (d: string) => format(new Date(d), "d MMM yyyy HH:mm", { locale: tr });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800">Bakım Talepleri</h2>
        <p className="text-xs text-gray-400">{talepler.length} talep</p>
      </div>

      {talepler.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Wrench size={40} className="mx-auto mb-3 opacity-30" />
          <p>Açık bakım talebi yok</p>
        </div>
      )}

      <div className="space-y-3">
        {talepler.map(t => (
          <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between p-4 cursor-pointer" onClick={() => setAcik(acik === t.id ? null : t.id)}>
              <div className="flex items-start gap-3">
                <Wrench size={15} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-gray-800">{t.baslik}</p>
                  <p className="text-xs text-gray-400">Daire {t.konut.daireNo} · {t.ogrenci.ad} {t.ogrenci.soyad}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ONCELIK_RENK[t.oncelik] ?? ""}`}>{ONCELIK_LABEL[t.oncelik] ?? t.oncelik}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DURUM_RENK[t.durum] ?? ""}`}>{DURUM_LABEL[t.durum] ?? t.durum}</span>
                {acik === t.id ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
              </div>
            </div>

            {acik === t.id && (
              <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
                <p className="text-sm text-gray-600">{t.aciklama}</p>
                <p className="text-xs text-gray-400">Oluşturulma: {fmt(t.olusturmaTar)}</p>

                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">Yorumlar ({t.yorumlar.length})</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
                    {t.yorumlar.length === 0 && <p className="text-xs text-gray-300 italic">Henüz yorum yok</p>}
                    {t.yorumlar.map(y => (
                      <div key={y.id} className={`rounded-lg px-3 py-2 text-xs ${y.yazarTip === "EvSahibi" ? "bg-blue-50 text-blue-800 ml-6" : "bg-gray-50 text-gray-700 mr-6"}`}>
                        <p className="font-medium mb-0.5">{y.yazarAd} <span className="font-normal text-gray-400">· {fmt(y.olusturmaTar)}</span></p>
                        <p>{y.icerik}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={yorumlar[t.id] ?? ""}
                      onChange={e => setYorumlar(prev => ({ ...prev, [t.id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); yorumGonder(t.id); } }}
                      placeholder="Yorum yaz..."
                      className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => yorumGonder(t.id)}
                      disabled={gonderiliyor === t.id || !yorumlar[t.id]?.trim()}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
