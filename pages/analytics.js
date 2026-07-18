import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { MapPin, ArrowLeft, TrendingUp, TrendingDown, Search, LogOut, Users } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { S } from "../components/styles";
import { BIRIMLER, BIRIM_RENK } from "../components/data";

const IL_PALETTE = ["#17A673", "#4C6FFF", "#F5A623", "#D95B43", "#8E44AD", "#00A8CC", "#C2185B"];

function norm(s) { return (s || "").toLocaleLowerCase("tr").trim(); }

export default function Analytics() {
  const router = useRouter();
  const [oturum, setOturum] = useState(null);
  const [iller, setIller] = useState([]);
  const [modul, setModul] = useState("toplanti");
  const [seciliIller, setSeciliIller] = useState([]);
  const [seciliBirimler, setSeciliBirimler] = useState([]);
  const [boyut, setBoyut] = useState("birim");
  const [data, setData] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [arama, setArama] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then(({ session }) => {
      if (!session || session.role !== "admin") return router.replace("/login");
      setOturum(session);
      fetch("/api/il-list").then((r) => r.json()).then((d) => setIller(d.iller || []));
    });
  }, [router]);

  useEffect(() => {
    if (!router.isReady) return;
    const { modul: m, il, birim } = router.query;
    if (m === "ders" || m === "lokasyon") setModul(m);
    if (il) setSeciliIller([il]);
    if (birim) { setSeciliBirimler([birim]); setBoyut("il"); }
  }, [router.isReady]);

  useEffect(() => {
    if (!oturum) return;
    setYukleniyor(true);
    const params = new URLSearchParams();
    params.set("modul", modul);
    if (seciliIller.length) params.set("il", seciliIller.join(","));
    if (seciliBirimler.length) params.set("birim", seciliBirimler.join(","));
    fetch(`/api/reports/analytics?${params.toString()}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setYukleniyor(false));
  }, [oturum, modul, seciliIller, seciliBirimler]);

  async function cikisYap() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  function toggle(list, setList, value) {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  const trendData = useMemo(() => {
    if (!data?.trend) return [];
    return data.trend.map((t) => ({ hafta: t.hafta, ...(boyut === "birim" ? t.birim : t.il) }));
  }, [data, boyut]);

  const lineKeys = boyut === "birim"
    ? BIRIMLER.map((b) => b.key)
    : (data?.ilKarsilastirma || []).slice(0, 5).map((x) => x.il);

  if (!oturum) return null;

  return (
    <div style={S.page}>
      <div style={S.shellWide}>
        <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #EEF2F1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <button style={{ ...S.ghostBtn, padding: "8px 12px" }} onClick={() => router.push("/admin")}>
              <ArrowLeft size={14} /> Panele Dön
            </button>
            <button onClick={cikisYap} style={{ ...S.ghostBtn, padding: 8 }} title="Çıkış yap"><LogOut size={14} /></button>
          </div>
          <div style={S.h1}>Analitik ve Karşılaştırma</div>
        </div>

        <div style={S.moduleTabs}>
          {[
            { key: "toplanti", label: "Komisyon Toplantıları" },
            { key: "ders", label: "Haftalık Dersler" },
            { key: "lokasyon", label: "Lokasyon Analitiği" },
          ].map((m) => (
            <button key={m.key} style={{ ...S.moduleTab, ...(modul === m.key ? S.moduleTabActive : {}) }}
              onClick={() => setModul(m.key)}>{m.label}</button>
          ))}
        </div>

        <div style={{ padding: "0 22px 16px" }}>
          <label style={S.miniLabel}>İl (karşılaştırmak için birden fazla seçin)</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10, marginBottom: 14 }}>
            {iller.map((c) => (
              <div key={c} style={{ ...S.chip, ...(seciliIller.includes(c) ? S.chipActive : {}) }}
                onClick={() => toggle(seciliIller, setSeciliIller, c)}>{c}</div>
            ))}
          </div>
          <label style={S.miniLabel}>Birim</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
            {BIRIMLER.map((b) => (
              <div key={b.key} style={{ ...S.chip, ...(seciliBirimler.includes(b.key) ? S.chipActive : {}) }}
                onClick={() => toggle(seciliBirimler, setSeciliBirimler, b.key)}>
                <b.icon size={14} /> {b.label}
              </div>
            ))}
          </div>
        </div>

        {yukleniyor && <div style={{ padding: 30, textAlign: "center", color: "#7C8C90", fontSize: 13 }}>Yükleniyor…</div>}

        {!yukleniyor && data && modul !== "lokasyon" && (
          <ToplantiDersGorunumu data={data} boyut={boyut} setBoyut={setBoyut} lineKeys={lineKeys} trendData={trendData}
            seciliSayisi={seciliIller.length + seciliBirimler.length} />
        )}

        {!yukleniyor && data && modul === "lokasyon" && (
          <LokasyonGorunumu data={data} arama={arama} setArama={setArama} />
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, sub }) {
  return (
    <div style={S.summaryCard}>
      <div style={S.summaryLabel}>{label}</div>
      <div style={S.summaryValue}>{value}</div>
      {sub && <div style={S.summarySub}>{sub}</div>}
    </div>
  );
}

function ToplantiDersGorunumu({ data, boyut, setBoyut, lineKeys, trendData, seciliSayisi }) {
  const { toplamKatilim, toplamLokasyon, ortalamaKatilimLokasyon, degisimYuzde, ilKarsilastirma, birimKarsilastirma } = data;

  const rankData = boyut === "birim"
    ? birimKarsilastirma.map((b) => ({ ad: BIRIMLER.find((x) => x.key === b.birim)?.label || b.birim, katilim: b.katilim }))
    : ilKarsilastirma.map((i) => ({ ad: i.il, katilim: i.katilim }));

  const karsilastirmaData = boyut === "birim"
    ? birimKarsilastirma.map((b) => ({ ad: BIRIMLER.find((x) => x.key === b.birim)?.label || b.birim, katilim: b.katilim, lokasyon: b.lokasyon }))
    : ilKarsilastirma.map((i) => ({ ad: i.il, katilim: i.katilim, lokasyon: i.lokasyon }));

  return (
    <div className="fade">
      <div style={S.summaryRow}>
        <Kpi label="Toplam Katılım" value={toplamKatilim} sub={`${toplamLokasyon} lokasyon`} />
        <Kpi label="Ortalama Katılım / Lokasyon" value={ortalamaKatilimLokasyon} />
        <Kpi label="Haftalık Değişim"
          value={degisimYuzde === null ? "—" : `${degisimYuzde > 0 ? "+" : ""}${degisimYuzde}%`}
          sub={degisimYuzde === null ? "Yeterli veri yok" : (
            <span style={degisimYuzde >= 0 ? S.kpiDeltaUp : S.kpiDeltaDown}>
              {degisimYuzde >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} önceki haftaya göre
            </span>
          )} />
      </div>

      <div style={{ padding: "0 22px 10px", display: "flex", gap: 8 }}>
        <button style={{ ...S.moduleTab, ...(boyut === "birim" ? S.moduleTabActive : {}) }} onClick={() => setBoyut("birim")}>Birimlere göre</button>
        <button style={{ ...S.moduleTab, ...(boyut === "il" ? S.moduleTabActive : {}) }} onClick={() => setBoyut("il")}>İllere göre</button>
      </div>

      <div style={S.chartsGrid}>
        <div style={S.chartCard}>
          <div style={S.chartTitle}>Haftalık Katılım Trendi</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F1" />
              <XAxis dataKey="hafta" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {lineKeys.map((k, i) => (
                <Line key={k} type="monotone" dataKey={k}
                  name={boyut === "birim" ? (BIRIMLER.find((b) => b.key === k)?.label || k) : k}
                  stroke={boyut === "birim" ? (BIRIM_RENK[k] || "#7C8C90") : IL_PALETTE[i % IL_PALETTE.length]}
                  strokeWidth={2.5} dot={false} connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={S.chartCard}>
          <div style={S.chartTitle}>{boyut === "birim" ? "Birim Sıralaması" : "İl Sıralaması (İlk 10)"}</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={rankData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F1" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="ad" width={110} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="katilim" fill="#17A673" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ padding: "0 22px 22px" }}>
        {seciliSayisi >= 2 ? (
          <div style={S.chartCard}>
            <div style={S.chartTitle}>Seçili Karşılaştırma</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={karsilastirmaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F1" />
                <XAxis dataKey="ad" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="katilim" name="Katılım" fill="#17A673" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lokasyon" name="Lokasyon" fill="#0F3A44" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={S.sectionEmpty}>Doğrudan karşılaştırma için üstten 2 veya daha fazla il/birim seçin.</div>
        )}
      </div>
    </div>
  );
}

function LokasyonGorunumu({ data, arama, setArama }) {
  const { toplamLokasyon, toplamKatilim, ortalamaKatilimLokasyon, enAktif, lokasyonlar, turKarsilastirma } = data;
  const q = norm(arama);
  const filtered = !q ? lokasyonlar : lokasyonlar.filter((l) => norm(l.ad).includes(q));
  const top10 = lokasyonlar.slice(0, 10).map((l) => ({ ad: l.ad, katilim: l.katilim }));

  return (
    <div className="fade">
      <div style={S.summaryRow}>
        <Kpi label="Toplam Lokasyon" value={toplamLokasyon} />
        <Kpi label="Toplam Katılım" value={toplamKatilim} />
        <Kpi label="Ortalama Katılım / Lokasyon" value={ortalamaKatilimLokasyon} />
        <Kpi label="En Aktif Lokasyon" value={enAktif ? enAktif.katilim : "—"} sub={enAktif ? `${enAktif.ad} · ${enAktif.il}` : "Veri yok"} />
      </div>

      <div style={S.chartsGrid}>
        <div style={S.chartCard}>
          <div style={S.chartTitle}>En Aktif 10 Lokasyon</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={top10} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F1" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="ad" width={140} tick={{ fontSize: 10.5 }} />
              <Tooltip />
              <Bar dataKey="katilim" fill="#17A673" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {turKarsilastirma.length > 0 && (
          <div style={S.chartCard}>
            <div style={S.chartTitle}>Okul Türüne Göre Ortalama Katılım</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={turKarsilastirma} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F1" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="tur" width={140} tick={{ fontSize: 10.5 }} />
                <Tooltip />
                <Bar dataKey="ortalama" fill="#4C6FFF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div style={S.section}>
        <div style={{ ...S.sectionHeadRow, marginBottom: 12 }}>
          <div style={S.sectionHead}><MapPin size={16} /><span>Tüm Lokasyonlar</span></div>
          <div style={{ position: "relative", width: 220 }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#7C8C90", pointerEvents: "none" }} />
            <input style={{ ...S.input, padding: "7px 10px 7px 28px", fontSize: 12.5 }}
              placeholder="Lokasyon ara…" value={arama} onChange={(e) => setArama(e.target.value)} />
          </div>
        </div>
        {filtered.length === 0 ? (
          <div style={S.sectionEmpty}>Sonuç bulunamadı.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((l, i) => (
              <div key={i} style={S.rowCard}>
                <div style={S.rowMain}>
                  <div style={S.rowYer}>{l.ad}</div>
                  <div style={S.rowTur}>{l.il} · {BIRIMLER.find((b) => b.key === l.birim)?.label || l.birim}{l.tur ? ` · ${l.tur}` : ""}</div>
                </div>
                <div style={S.rowKisi}><Users size={13} /> {l.katilim}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}