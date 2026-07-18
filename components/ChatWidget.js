import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Send, ChevronUp, ChevronDown, Loader2, Bot, User } from "lucide-react";
import { S } from "./styles";

const ONERILEN_SORULAR = [
  "Hangi il en yüksek katılıma sahip?",
  "Hangi ilde en fazla lokasyonda en fazla toplantı gerçekleştirildi?",
];

// Gemini bazen markdown işaretleriyle cevap veriyor (**kalın**, ### başlık,
// ```kod bloğu``` gibi). Bu fonksiyon ekrana basmadan önce bunları temizler.
function markdownTemizle(metin) {
  if (!metin) return metin;
  return metin
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/#{1,6}\s?/g, "")
    .replace(/\|/g, " ")
    .replace(/:---+:?/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function ChatWidget() {
  const [acik, setAcik] = useState(false);
  const [mesajlar, setMesajlar] = useState([]);
  const [soru, setSoru] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const sonRef = useRef(null);

  useEffect(() => {
    if (acik) sonRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mesajlar, acik]);

  async function sorSor(metin) {
    const soruMetni = (metin ?? soru).trim();
    if (!soruMetni || yukleniyor) return;

    setMesajlar((m) => [...m, { rol: "user", metin: soruMetni }]);
    setSoru("");
    setYukleniyor(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: soruMetni }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bilinmeyen hata");
      setMesajlar((m) => [...m, { rol: "ai", metin: markdownTemizle(data.answer) }]);
    } catch (e) {
      setMesajlar((m) => [...m, { rol: "ai", metin: "Üzgünüm, bir hata oluştu: " + e.message, hata: true }]);
    } finally {
      setYukleniyor(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sorSor();
    }
  }

  return (
    <div style={{ margin: "0 22px 22px", border: "1px solid #E1E8E7", borderRadius: 14, overflow: "hidden" }}>
      <button
        onClick={() => setAcik((a) => !a)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "13px 16px",
          background: "linear-gradient(135deg, #EEF6F3, #FBFCFC)",
          border: "none",
          cursor: "pointer",
          fontSize: 13.5,
          fontWeight: 700,
          color: "#0F3A44",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={15} color="#17A673" /> AI Asistan'a Sor
        </span>
        {acik ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {acik && (
        <div style={{ borderTop: "1px solid #E1E8E7" }}>
          <div style={{ maxHeight: 320, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {mesajlar.length === 0 && (
              <div>
                <div style={{ fontSize: 12.5, color: "#7C8C90", marginBottom: 10 }}>
                  Verilerle ilgili bir soru sorabilirsin, örneğin:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {ONERILEN_SORULAR.map((s) => (
                    <button
                      key={s}
                      onClick={() => sorSor(s)}
                      style={{
                        textAlign: "left",
                        padding: "9px 12px",
                        border: "1px solid #E1E8E7",
                        borderRadius: 10,
                        background: "#FBFCFC",
                        color: "#0F3A44",
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mesajlar.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexDirection: m.rol === "user" ? "row-reverse" : "row" }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: m.rol === "user" ? "#0F3A44" : "#17A673",
                    color: "#fff",
                  }}
                >
                  {m.rol === "user" ? <User size={13} /> : <Bot size={13} />}
                </div>
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "9px 13px",
                    borderRadius: 12,
                    fontSize: 13,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                    background: m.rol === "user" ? "#0F3A44" : m.hata ? "#FCEEE9" : "#EEF6F3",
                    color: m.rol === "user" ? "#fff" : m.hata ? "#D95B43" : "#0F3A44",
                  }}
                >
                  {m.metin}
                </div>
              </div>
            ))}

            {yukleniyor && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#7C8C90", fontSize: 12.5 }}>
                <Loader2 size={14} className="spin" /> Düşünüyor…
              </div>
            )}
            <div ref={sonRef} />
          </div>

          <div style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #EEF2F1" }}>
            <input
              style={{ ...S.input, flex: 1 }}
              placeholder="Bir soru yaz…"
              value={soru}
              onChange={(e) => setSoru(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={yukleniyor}
            />
            <button
              onClick={() => sorSor()}
              disabled={yukleniyor || !soru.trim()}
              style={{
                width: 42,
                borderRadius: 10,
                border: "none",
                background: "#17A673",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: yukleniyor || !soru.trim() ? "not-allowed" : "pointer",
                opacity: yukleniyor || !soru.trim() ? 0.5 : 1,
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

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