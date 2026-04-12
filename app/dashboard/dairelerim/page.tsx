"use client";

import { useEffect, useState, useCallback } from "react";
import { Building2, User, TrendingUp, X, Calendar, Coins } from "lucide-react";

interface Sozlesme {
  id: string;
  ogrenci: { ad: string; soyad: string; telefon: string; email: string };
}
interface SahiplikKaydi {
  id: string;
  alisTarihi: string;
  satisTarihi?: string | null;
  alisFiyati?: number | null;
  satisFiyati?: number | null;
  notlar?: string | null;
}
interface Konut {
  id: string; blok: string; katNo: number; daireNo: string;
  tip: string; metrekare: number; kiraBedeli: number;
  durum: string; etap: number; sozlesmeler: Sozlesme[];
  sahiplikler?: SahiplikKaydi[];
}
const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleDateString("tr-TR") : "—";
const fmtPara = (n?: number | null) => n != null ? `₺${n.toLocaleString("tr-TR")}` : "—";

const DURUM_RENK: Record<string, string> = {
  Dolu: "bg-red-100 text-red-700",
  Bos: "bg-green-100 text-green-700",
  Bakimda: "bg-yellow-100 text-yellow-700",
};

function KiraGuncelleModal({ konut, onClose, onSaved }: { konut: Konut; onClose: () => void; onSaved: () => void }) {
  const [kira, setKira] = useState(konut.kiraBedeli.toString());
  const [hata, setHata] = useState("");
  const [saving, setSaving] = useState(false);

  const kaydet = async () => {
    const val = parseFloat(kira);
    if (isNaN(val) || val <= 0) { setHata("Geçerli bir kira bedeli girin."); return; }
    setSaving(true);
    const res = await fetch("/api/portal/kira-guncelle", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ konutId: konut.id, kiraBedeli: val }),
    });
    setSaving(false);
    if (res.ok) { onSaved(); onClose(); }
    else { const j = await res.json(); setHata(j.error ?? "Hata oluştu"); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Kira Bedeli Güncelle</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Daire: <strong>{konut.daireNo}</strong></p>
        <div>
          <label className="text-xs text-gray-500">Yeni Kira Bedeli (₺)</label>
          <input type="number" value={kira} onChange={e => setKira(e.target.value)} min="0"
            className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
        </div>
        {hata && <p className="text-red-600 text-xs mt-2">{hata}</p>}
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
          <button onClick={kaydet} disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DairelerimPage() {
  const [konutlar, setKonutlar] = useState<Konut[]>([]);
  const [kiraModal, setKiraModal] = useState<Konut | null>(null);

  const load = useCallback(() => fetch("/api/portal/dairelerim").then(r => r.json()).then(setKonutlar), []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800">Dairelerim</h2>
        <p className="text-xs text-gray-400">{konutlar.length} daire</p>
      </div>

      {konutlar.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Building2 size={40} className="mx-auto mb-3 opacity-30" />
          <p>Henüz daire atanmamış</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {konutlar.map(k => {
          const kiraci = k.sozlesmeler[0]?.ogrenci ?? null;
          return (
            <div key={k.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Daire {k.daireNo}</h3>
                    <p className="text-xs text-gray-400">{k.blok} Blok · {k.katNo}. Kat · {k.etap}. Etap</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DURUM_RENK[k.durum] ?? "bg-gray-100 text-gray-500"}`}>
                  {k.durum === "Bos" ? "Boş" : k.durum === "Bakimda" ? "Bakımda" : k.durum}
                </span>
              </div>

              <div className="text-sm text-gray-500 space-y-1 mb-3">
                <p>{k.tip} · {k.metrekare} m²</p>
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5"><TrendingUp size={13} className="text-emerald-500" />
                    <strong className="text-gray-700">{k.kiraBedeli.toLocaleString("tr-TR")} ₺</strong> / ay
                  </p>
                  <button onClick={() => setKiraModal(k)} className="text-xs text-blue-600 hover:underline">Güncelle</button>
                </div>
              </div>

              {kiraci ? (
                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                  <User size={14} className="text-gray-400" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">{kiraci.ad} {kiraci.soyad}</p>
                    <p className="text-xs text-gray-400">{kiraci.telefon} · {kiraci.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-300 italic">Kiracı yok</p>
              )}

              {/* Sahiplik Geçmişi */}
              {k.sahiplikler && k.sahiplikler.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sahiplik</p>
                  <div className="space-y-1.5">
                    {k.sahiplikler.map(s => (
                      <div key={s.id} className="bg-blue-50/40 rounded-lg px-3 py-2 text-xs border border-blue-100">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="flex items-center gap-1 text-gray-600">
                            <Calendar size={10} /> {fmtDate(s.alisTarihi)} → {fmtDate(s.satisTarihi)}
                          </span>
                          {s.satisTarihi
                            ? <span className="px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600">Satıldı</span>
                            : <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Aktif</span>}
                        </div>
                        <div className="flex items-center gap-3 text-gray-500">
                          <span className="flex items-center gap-1"><Coins size={10} /> Alış: {fmtPara(s.alisFiyati)}</span>
                          {s.satisFiyati != null && <span>Satış: {fmtPara(s.satisFiyati)}</span>}
                        </div>
                        {s.notlar && <p className="text-gray-400 mt-0.5">{s.notlar}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {kiraModal && <KiraGuncelleModal konut={kiraModal} onClose={() => setKiraModal(null)} onSaved={load} />}
    </div>
  );
}
