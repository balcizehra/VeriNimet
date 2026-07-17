import { useState } from "react";
import { useRouter } from "next/router";
import { MapPin, Shield, ChevronRight } from "lucide-react";
import { S } from "../components/styles";

export default function Login() {
  const router = useRouter();
  const [tip, setTip] = useState("il"); // "il" | "admin"
  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function girisYap(e) {
    e.preventDefault();
    setHata("");
    setYukleniyor(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tip, kullaniciAdi, sifre }),
    });
    const data = await res.json();
    setYukleniyor(false);
    if (!res.ok) return setHata(data.error || "Giriş başarısız.");
    router.push(tip === "admin" ? "/admin" : "/rapor");
  }

  return (
    <div style={S.page}>
      <div style={{ ...S.shell, maxWidth: 380, marginTop: 60 }}>
        <div style={S.header}>
          <div style={S.headerTop}>
            <div style={S.brandRow}>
              <div style={S.logoDot} />
              <span style={S.brandText}>GENÇ İHH</span>
            </div>
          </div>
        </div>

        <div style={S.body} className="fade">
          <div style={S.eyebrow}>RAPORLAMA SİSTEMİ</div>
          <h1 style={S.h1}>Giriş yap</h1>
          <p style={S.sub}>İl hesabınla ya da genel merkez hesabınla giriş yap.</p>

          <div style={{ display: "flex", gap: 10, marginTop: 18, marginBottom: 6 }}>
            <button
              type="button"
              onClick={() => setTip("il")}
              style={{ ...S.chip, flex: 1, justifyContent: "center", ...(tip === "il" ? S.chipActive : {}) }}
            >
              <MapPin size={16} /> İl Başkanı
            </button>
            <button
              type="button"
              onClick={() => setTip("admin")}
              style={{ ...S.chip, flex: 1, justifyContent: "center", ...(tip === "admin" ? S.chipActive : {}) }}
            >
              <Shield size={16} /> Genel Merkez
            </button>
          </div>

          <form onSubmit={girisYap}>
            <label style={S.label}>{tip === "il" ? "İl adı" : "Kullanıcı adı"}</label>
            <input
              style={S.input}
              value={kullaniciAdi}
              onChange={(e) => setKullaniciAdi(e.target.value)}
              placeholder={tip === "il" ? "Örn. Konya" : "genelmerkez"}
              autoComplete="username"
            />

            <label style={S.label}>Şifre</label>
            <input
              style={S.input}
              type="password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            {hata && <div style={S.errorBox}>{hata}</div>}

            <button type="submit" disabled={yukleniyor} style={{ ...S.primaryBtn, marginTop: 22, opacity: yukleniyor ? 0.6 : 1 }}>
              {yukleniyor ? "Giriş yapılıyor…" : "Giriş yap"} <ChevronRight size={17} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
