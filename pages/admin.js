import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MapPin, Building2, CalendarCheck, BookOpen, ChevronDown, X, Users, LogOut, TrendingUp, PieChart as PieIcon, Search } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { S } from "../components/styles";
import { BIRIMLER } from "../components/data";

function sum(arr) { return arr.reduce((s, x) => s + (Number(x.katilim) || 0), 0); }

function norm(s) {
  return (s || "").toLocaleLowerCase("tr").trim();
}

const BIRIM_RENK = {
  universite: "#17A673",
  lise: "#4C6FFF",
  ortaokul: "#F5A623",
  cocuk: "#D95B43",
};

export default function Admin() {
  const router = useRouter();
  const [oturum, setOturum] = useState(null);
  const [iller, setIller] = useState([]);
  const [city, setCity] = useState("");
  const [birim, setBirim] = useState("");
  const [haftalar, setHaftalar] = useState([]);
  const [hafta, setHafta] = useState("");

  // Level 0 / 1 (özet + grafikler)
  const [summary, setSummary] = useState(null);
  const [ozetYukleniyor, setOzetYukleniyor] = useState(false);

  // Level 2 (detay — mevcut davranış)
  const [rapor, setRapor] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then(({ session }) => {
      if (!session || session.role !== "admin") return router.replace("/login");
      setOturum(session);
      fetch("/api/il-list").then((r) => r.json()).then((d) => setIller(d.iller || []));
    });
  }, [router]);

  // Hafta listesi: seviyeye göre esnek
  useEffect(() => {
    const params = new URLSearchParams();
    if (city) params.set("il", city);
    if (birim) params.set("birim", birim);
    fetch(`/api/reports/weeks?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => { setHaftalar(d.haftalar || []); setHafta((d.haftalar || [])[0] || ""); });
  }, [city, birim]);

  // Seviye 0/1: Türkiye geneli ya da il özeti
  useEffect(() => {
    if (birim) { setSummary(null); return; }
    setOzetYukleniyor(true);
    const params = new URLSearchParams();
    if (city) params.set("il", city);
    if (hafta) params.set("hafta", hafta);
    fetch(`/api/reports/summary?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => { setSummary(d); if (!hafta) setHafta(d.hafta); })
      .finally(() => setOzetYukleniyor(false));
  }, [city, birim, hafta]);

  // Seviye 2: il + birim detay (mevcut davranış, değişmedi)
  useEffect(() => {
    if (!city || !birim) { setRapor(null); return; }
    setYukleniyor(true);
    const q = hafta ? `&hafta=${hafta}` : "";
    fetch(`/api/reports?il=${encodeURIComponent(city)}&birim=${birim}${q}`)
      .then((r) => r.json())
      .then((d) => { setRapor(d.rapor); if (!hafta) setHafta(d.hafta); })
      .finally(() => setYukleniyor(false));
  }, [city, birim, hafta]);

  async function cikisYap() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (!oturum) return null;

  const toplanti = rapor?.toplanti || [];
  const ders = rapor?.ders || [];
  const birimMeta = BIRIMLER.find((b) => b.key === birim);

  return (
    <div style={S.page}>
      <div style={S.shellWide}>
        <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #EEF2F1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={S.brandRow}>
              <div style={S.logoDot} />
              <span style={{ ...S.brandText, color: "#17A673" }}>GENÇ İHH · GENEL MERKEZ PANELİ</span>
            </div>
            <button onClick={cikisYap} style={{ ...S.ghostBtn, padding: 8 }} title="Çıkış yap"><LogOut size={14} /></button>
          </div>
          <div style={S.h1}>Haftalık Saha Raporları</div>
        </div>

        <div style={S.filterBar}>
          <FilterSelect icon={<MapPin size={14} />} placeholder="Tüm Türkiye" value={city}
            onChange={(v) => { setCity(v); setBirim(""); }} options={iller.map((c) => ({ value: c, label: c }))} />
          <FilterSelect icon={birimMeta ? <birimMeta.icon size={14} /> : <Building2 size={14} />}
            placeholder={city ? "Tüm birimler" : "Önce il seçin"} value={birim} onChange={setBirim} disabled={!city}
            options={BIRIMLER.map((b) => ({ value: b.key, label: b.label }))} />
          {haftalar.length > 0 && (
            <FilterSelect icon={<CalendarCheck size={14} />} placeholder="Hafta" value={hafta} onChange={setHafta}
              options={haftalar.map((h) => ({ value: h, label: h }))} />
          )}
          {(city || birim) && (
            <button style={S.clearBtn} onClick={() => { setCity(""); setBirim(""); }}><X size={13} /> Temizle</button>
          )}
        </div>

        {!birim && (
          <SummaryDashboard summary={summary} loading={ozetYukleniyor} il={city} hafta={hafta} />
        )}

        {city && birim && yukleniyor && <div style={{ padding: 30, textAlign: "center", color: "#7C8C90", fontSize: 13 }}>Yükleniyor…</div>}

        {city && birim && !yukleniyor && !rapor && (
          <div style={S.empty}>
            <div style={S.emptyIcon}><CalendarCheck size={22} color="#7C8C90" /></div>
            <div style={S.emptyTitle}>Bu hafta için henüz rapor girilmemiş</div>
            <div style={S.emptySub}>{city} — {birimMeta?.label} için {hafta || "bu hafta"} rapor bulunamadı.</div>
          </div>
        )}

        {city && birim && !yukleniyor && rapor && (
          <div className="fade">
            <div style={S.summaryRow}>
              <div style={S.summaryCard}>
                <div style={S.summaryLabel}><CalendarCheck size={13} /> Toplantı</div>
                <div style={S.summaryValue}>{sum(toplanti)}</div>
                <div style={S.summarySub}>{toplanti.length} lokasyon · {city} {birimMeta?.label} · {hafta}</div>
              </div>
              <div style={S.summaryCard}>
                <div style={S.summaryLabel}><BookOpen size={13} /> Haftalık Ders</div>
                <div style={S.summaryValue}>{sum(ders)}</div>
                <div style={S.summarySub}>{ders.length} lokasyon · {city} {birimMeta?.label} · {hafta}</div>
              </div>
            </div>

            <Section icon={<CalendarCheck size={16} />} title="Komisyon Toplantıları" rows={toplanti}
              emptyText="Bu hafta bu birim için toplantı yapılmadı."
              totalLabel={(n, kisi) => `Toplam ${n} lokasyonda, ${kisi} kişi ile toplantı yapıldı.`} />
            <Section icon={<BookOpen size={16} />} title="Haftalık Dersler" rows={ders}
              emptyText="Bu hafta bu birim için haftalık ders yapılmadı."
              totalLabel={(n, kisi) => `Toplam ${n} lokasyonda, ${kisi} kişi ile haftalık ders yapıldı.`} />
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryDashboard({ summary, loading, il, hafta }) {
  if (loading && !summary) {
    return <div style={{ padding: 30, textAlign: "center", color: "#7C8C90", fontSize: 13 }}>Yükleniyor…</div>;
  }
  if (!summary) return null;

  const { genel, birimOzet, trend, ilSayisi } = summary;
  const toplamKatilim = genel.toplantiKatilim + genel.dersKatilim;

  const pieData = Object.entries(birimOzet)
    .map(([key, v]) => ({
      key,
      label: BIRIMLER.find((b) => b.key === key)?.label || key,
      value: v.toplantiKatilim + v.dersKatilim,
    }))
    .filter((d) => d.value > 0);

  return (
    <div className="fade">
      <div style={S.summaryRow}>
        <div style={S.summaryCard}>
          <div style={S.summaryLabel}><CalendarCheck size={13} /> Toplam Toplantı</div>
          <div style={S.summaryValue}>{genel.toplantiKatilim}</div>
          <div style={S.summarySub}>{genel.toplantiLokasyon} lokasyon{!il ? ` · ${ilSayisi} il` : ""} · {hafta}</div>
        </div>
        <div style={S.summaryCard}>
          <div style={S.summaryLabel}><BookOpen size={13} /> Toplam Haftalık Ders</div>
          <div style={S.summaryValue}>{genel.dersKatilim}</div>
          <div style={S.summarySub}>{genel.dersLokasyon} lokasyon{!il ? ` · ${ilSayisi} il` : ""} · {hafta}</div>
        </div>
        <div style={S.summaryCard}>
          <div style={S.summaryLabel}><Users size={13} /> Toplam Katılımcı</div>
          <div style={S.summaryValue}>{toplamKatilim}</div>
          <div style={S.summarySub}>{il ? il : "Tüm Türkiye"} · {hafta}</div>
        </div>
      </div>

      <div style={S.chartsGrid}>
        <div style={S.chartCard}>
          <div style={S.chartTitle}><PieIcon size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Birim Dağılımı</div>
          {pieData.length === 0 ? (
            <div style={S.chartEmpty}>Bu hafta için veri yok.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="label" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {pieData.map((d) => <Cell key={d.key} fill={BIRIM_RENK[d.key] || "#7C8C90"} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={S.chartCard}>
          <div style={S.chartTitle}><TrendingUp size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Haftalık Katılım Trendi</div>
          {!trend || trend.length === 0 ? (
            <div style={S.chartEmpty}>Yeterli geçmiş veri yok.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F1" />
                <XAxis dataKey="hafta" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="toplanti" name="Toplantı" stroke="#17A673" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="ders" name="Haftalık Ders" stroke="#0F3A44" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ icon, placeholder, value, onChange, options, disabled }) {
  return (
    <div style={{ ...S.selectWrap, opacity: disabled ? 0.5 : 1 }}>
      <span style={S.selectIcon}>{icon}</span>
      <select style={S.selectField} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} style={S.selectChevron} />
    </div>
  );
}

function Section({ icon, title, rows, emptyText, totalLabel }) {
  const [arama, setArama] = useState("");
  const q = norm(arama);
  const filtered = !q ? rows : rows.filter((r) => norm(r.ad).includes(q));
  const kisi = sum(rows);

  return (
    <div style={S.section}>
      <div style={{ ...S.sectionHead, justifyContent: "space-between", marginBottom: rows.length > 0 ? 12 : undefined }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {icon}<span>{title}</span>
        </div>

        {rows.length > 0 && (
          <div style={{ position: "relative", width: 220, maxWidth: "45%" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#7C8C90", pointerEvents: "none" }} />
            <input
              style={{ ...S.input, padding: "7px 10px 7px 28px", fontSize: 12.5 }}
              placeholder="Üniversite ara…"
              value={arama}
              onChange={(e) => setArama(e.target.value)}
            />
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div style={S.sectionEmpty}>{emptyText}</div>
      ) : filtered.length === 0 ? (
        <div style={S.sectionEmpty}>"{arama}" ile eşleşen sonuç bulunamadı.</div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((r, i) => (
              <div key={i} style={S.rowCard}>
                <div style={S.rowMain}>
                  <div style={S.rowYer}>{r.ad}</div>
                  {r.tur && <div style={S.rowTur}>{r.tur}</div>}
                </div>
                <div style={S.rowKisi}><Users size={13} /> {r.katilim}</div>
              </div>
            ))}
          </div>
          <div style={S.totalBar}>{totalLabel(rows.length, kisi)}</div>
        </>
      )}
    </div>
  );
}