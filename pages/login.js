import { useState } from "react";
import { useRouter } from "next/router";
import { ChevronRight, Eye, EyeOff } from "lucide-react"; // Göz ikonlarını ekledik
import { S } from "../components/styles";

export default function Login() {
  const router = useRouter();
  
  // Artik "tip" durumuna ihtiyacımız yok, tek bir ID alanı kullanıyoruz
  const [kullaniciId, setKullaniciId] = useState("");
  const [sifre, setSifre] = useState("");
  const [sifreGoster, setSifreGoster] = useState(false); // Şifre göz durumu
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function girisYap(e) {
    e.preventDefault();
    setHata("");
    setYukleniyor(true);

    // Arka taraftaki API'yi bozmamak için girilen ID değerini "kullaniciAdi" ismiyle gönderiyoruz
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kullaniciAdi: kullaniciId, sifre }),
    });
    
    const data = await res.json();
    setYukleniyor(false);

    if (!res.ok) return setHata(data.error || "Giriş başarısız.");

    // Arka plandaki yönlendirme mantığı: 
    // Eğer girilen ID admin/genelmerkez kodu ise admin paneline, değilse rapor sayfasına gidecek
    // (Bunu backend veritabanından dönen veriye göre de yönlendirebiliriz, şimdilik mantığı kurduk)
    if (kullaniciId === "999" || data.isAdmin) {
      router.push("/admin");
    } else {
      router.push("/rapor");
    }
  }

  return (
    <div style={S.page}>
      <div id="app-shell" style={{ ...S.shell, maxWidth: 380, marginTop: 60 }}>
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
          <p style={S.sub}>Kullanıcı ID'niz ve şifrenizle sisteme giriş yapın.</p>

          <form onSubmit={girisYap} style={{ marginTop: 20 }}>
            {/* 1. ÖZELLİK: SADECE KULLANICI ID ALANI */}
            <label style={S.label}>Kullanıcı ID</label>
            <input
              style={S.input}
              value={kullaniciId}
              onChange={(e) => setKullaniciId(e.target.value)}
              placeholder="Örn. 001"
              autoComplete="username"
            />

            <label style={S.label}>Şifre</label>
            {/* 2. ÖZELLİK: GÖZ İKONLU ŞİFRE ALANI */}
            <div style={{ position: "relative" }}>
              <input
                style={{ ...S.input, paddingRight: 40 }} // İkonun üzerine binmemesi için sağdan boşluk verdik
                type={sifreGoster ? "text" : "password"}
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setSifreGoster(!sifreGoster)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {sifreGoster ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

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