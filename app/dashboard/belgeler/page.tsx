"use client";

import { useEffect, useState, useCallback } from "react";
import { FolderOpen, Upload, X, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Konut { id: string; daireNo: string; blok: string; }
interface Belge {
  id: string; ad: string; tip: string; dosyaYolu: string; olusturmaTar: string; yukleyenTip: string;
  konut: { daireNo: string; blok: string };
}

const TIP_SECENEKLERI = ["Kira Sozlesmesi", "Kimlik", "Makbuz", "Tadilat", "Sigorta", "Diger"];

function YuklemeModal({ konutlar, onClose, onSaved }: { konutlar: Konut[]; onClose: () => void; onSaved: () => void }) {
  const [konutId, setKonutId] = useState(konutlar[0]?.id ?? "");
  const [ad, setAd] = useState("");
  const [tip, setTip] = useState("Diger");
  const [dosya, setDosya] = useState<File | null>(null);
  const [hata, setHata] = useState("");
  const [saving, setSaving] = useState(false);

  const yukle = async () => {
    if (!dosya || !konutId || !ad) { setHata("Tüm alanlar zorunludur."); return; }
    setSaving(true); setHata("");
    const fd = new FormData();
    fd.append("dosya", dosya);
    fd.append("konutId", konutId);
    fd.append("ad", ad);
    fd.append("tip", tip);
    const res = await fetch("/api/portal/belgeler", { method: "POST", body: fd });
    setSaving(false);
    if (res.ok) { onSaved(); onClose(); }
    else { const j = await res.json(); setHata(j.error ?? "Yükleme başarısız"); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Belge Yükle</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Daire</label>
            <select value={konutId} onChange={e => setKonutId(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
              {konutlar.map(k => <option key={k.id} value={k.id}>{k.daireNo} ({k.blok} Blok)</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Belge Adı</label>
            <input value={ad} onChange={e => setAd(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Tip</label>
            <select value={tip} onChange={e => setTip(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
              {TIP_SECENEKLERI.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Dosya</label>
            <input type="file" onChange={e => setDosya(e.target.files?.[0] ?? null)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
          </div>
          {hata && <p className="text-red-600 text-xs bg-red-50 rounded px-3 py-2">{hata}</p>}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
          <button onClick={yukle} disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
            {saving ? "Yükleniyor..." : "Yükle"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BelgelerPage() {
  const [belgeler, setBelgeler] = useState<Belge[]>([]);
  const [konutlar, setKonutlar] = useState<Konut[]>([]);
  const [modal, setModal] = useState(false);

  const load = useCallback(() => fetch("/api/portal/belgeler").then(r => r.json()).then(setBelgeler), []);
  useEffect(() => {
    load();
    fetch("/api/portal/dairelerim").then(r => r.json()).then((k: Konut[]) => setKonutlar(k));
  }, [load]);

  const fmt = (d: string) => format(new Date(d), "d MMM yyyy", { locale: tr });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Belgeler</h2>
          <p className="text-xs text-gray-400">{belgeler.length} belge</p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Upload size={15} /> Belge Yükle
        </button>
      </div>

      {belgeler.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FolderOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>Henüz belge yüklenmemiş</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Belge Adı</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Daire</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Tip</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Yükleyen</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Tarih</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">İndir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {belgeler.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-gray-400" />
                      <span className="font-medium text-gray-800">{b.ad}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.konut.daireNo}</td>
                  <td className="px-4 py-3 text-gray-500">{b.tip}</td>
                  <td className="px-4 py-3 text-gray-500">{b.yukleyenTip === "EvSahibi" ? "Ben" : "Admin"}</td>
                  <td className="px-4 py-3 text-gray-500">{fmt(b.olusturmaTar)}</td>
                  <td className="px-4 py-3 text-right">
                    <a href={`http://localhost:3000${b.dosyaYolu}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                      <Download size={13} /> İndir
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && konutlar.length > 0 && <YuklemeModal konutlar={konutlar} onClose={() => setModal(false)} onSaved={load} />}
    </div>
  );
}
