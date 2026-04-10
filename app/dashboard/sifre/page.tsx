"use client";

import { useState } from "react";
import { KeyRound, Eye, EyeOff } from "lucide-react";

export default function SifrePage() {
  const [form, setForm] = useState({ mevcutSifre: "", yeniSifre: "", tekrar: "" });
  const [showMevcut, setShowMevcut] = useState(false);
  const [showYeni, setShowYeni] = useState(false);
  const [durum, setDurum] = useState<"idle" | "ok" | "hata">("idle");
  const [mesaj, setMesaj] = useState("");
  const [loading, setLoading] = useState(false);

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mevcutSifre || !form.yeniSifre) { setDurum("hata"); setMesaj("Tüm alanlar zorunludur."); return; }
    if (form.yeniSifre.length < 6) { setDurum("hata"); setMesaj("Yeni şifre en az 6 karakter olmalı."); return; }
    if (form.yeniSifre !== form.tekrar) { setDurum("hata"); setMesaj("Yeni şifreler eşleşmiyor."); return; }

    setLoading(true); setDurum("idle");
    const res = await fetch("/api/portal/sifre", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mevcutSifre: form.mevcutSifre, yeniSifre: form.yeniSifre }),
    });
    setLoading(false);
    if (res.ok) {
      setDurum("ok"); setMesaj("Şifreniz başarıyla güncellendi.");
      setForm({ mevcutSifre: "", yeniSifre: "", tekrar: "" });
    } else {
      const j = await res.json(); setDurum("hata"); setMesaj(j.error ?? "Hata oluştu.");
    }
  };

  return (
    <div className="max-w-md space-y-4">
      <div className="flex items-center gap-3">
        <KeyRound size={20} className="text-blue-600" />
        <div>
          <h2 className="text-lg font-bold text-gray-800">Şifre Değiştir</h2>
          <p className="text-xs text-gray-400">Güvenliğiniz için düzenli olarak şifrenizi güncelleyin</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Mevcut Şifre</label>
            <div className="relative">
              <input type={showMevcut ? "text" : "password"} value={form.mevcutSifre} onChange={f("mevcutSifre")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" onClick={() => setShowMevcut(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showMevcut ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Yeni Şifre (min. 6 karakter)</label>
            <div className="relative">
              <input type={showYeni ? "text" : "password"} value={form.yeniSifre} onChange={f("yeniSifre")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" onClick={() => setShowYeni(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showYeni ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Yeni Şifre Tekrar</label>
            <input type="password" value={form.tekrar} onChange={f("tekrar")}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {durum === "hata" && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600">{mesaj}</div>}
          {durum === "ok" && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-600">{mesaj}</div>}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
            {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </form>
      </div>
    </div>
  );
}
