import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { S } from "../components/styles";

// Elle girilmiş örnek veri — arkadaşının grafiği bitince,
// bu sabit veri yerine gerçek `rapor` verisi (toplanti/ders) buraya bağlanacak.
const ORNEK_TOPLANTI = [
  { ad: "Adana Alparslan Türkeş Bilim ve Teknoloji Üniversitesi", katilim: 34 },
  { ad: "Çukurova Üniversitesi", katilim: 21 },
  { ad: "1. üniv", katilim: 12 },
  { ad: "2.üniv", katilim: 15 },
  { ad: "3.üniv", katilim: 17 },
];

const ORNEK_DERS = [
  { ad: "Adana Alparslan Türkeş Bilim ve Teknoloji Üniversitesi", katilim: 14 },
  { ad: "5.üniv", katilim: 6 },
  { ad: "Çukurova Üniversitesi", katilim: 19 },
];

export default function AiTest() {
  const [ozet, setOzet] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  async function analizYap() {
    setYukleniyor(true);
    setHata("");
    setOzet("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toplanti: ORNEK_TOPLANTI,
          ders: ORNEK_DERS,
          city: "Adana",
          birim: "Üniversite",
          hafta: "2026-W29",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bilinmeyen hata");
      setOzet(data.summary);
    } catch (e) {
      setHata(e.message);
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div style={S.page}>
      <div style={S.shell}>
        <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #EEF2F1" }}>
          <div style={S.brandRow}>
            <div style={S.logoDot} />
            <span style={{ ...S.brandText, color: "#17A673" }}>AI ANALİZ · TEST SAYFASI</span>
          </div>
          <div style={{ ...S.h1, marginTop: 8 }}>Gemini Özet Testi</div>
          <div style={S.sub}>
            Bu sayfa örnek verilerle Gemini API bağlantısını test eder. Gerçek grafik hazır olunca
            bu özet component'i oraya taşınacak.
          </div>
        </div>

        <div style={S.body}>
          <button
            style={{ ...S.primaryBtn, opacity: yukleniyor ? 0.7 : 1 }}
            onClick={analizYap}
            disabled={yukleniyor}
          >
            {yukleniyor ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
            {yukleniyor ? "Analiz oluşturuluyor…" : "AI Özet Oluştur"}
          </button>

          {hata && <div style={S.errorBox}>{hata}</div>}

          {ozet && (
            <div
              style={{
                marginTop: 18,
                padding: 16,
                background: "linear-gradient(180deg,#FBFCFC,#F5F8F7)",
                border: "1px solid #E1E8E7",
                borderRadius: 14,
                fontSize: 13.5,
                lineHeight: 1.6,
                color: "#0F3A44",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11.5,
                  fontWeight: 800,
                  color: "#17A673",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                <Sparkles size={13} /> AI Özet
              </div>
              {ozet}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}