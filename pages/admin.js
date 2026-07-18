import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MapPin, Building2, CalendarCheck, BookOpen, ChevronDown, X, Users, LogOut } from "lucide-react";
import { S } from "../components/styles";
import { BIRIMLER } from "../components/data";
import { haftaEtiketiGoster } from "../lib/hafta";

function sum(arr) { return arr.reduce((s, x) => s + (Number(x.katilim) || 0), 0); }

export default function Admin() {
  const router = useRouter();
  const [oturum, setOturum] = useState(null);
  const [iller, setIller] = useState([]);
  const [city, setCity] = useState("");
  const [birim, setBirim] = useState("");
  const [haftalar, setHaftalar] = useState([]);
  const [hafta, setHafta] = useState("");
  const [rapor, setRapor] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then(({ session }) => {
      if (!session || session.role !== "admin") return router.replace("/login");
      setOturum(session);
      fetch("/api/il-list").then((r) => r.json()).then((d) => setIller(d.iller || []));
    });
  }, [router]);

  useEffect(() => {
    if (!city || !birim) { setHaftalar([]); setHafta(""); setRapor(null); return; }
    fetch(`/api/reports/weeks?il=${encodeURIComponent(city)}&birim=${birim}`)
      .then((r) => r.json())
      .then((d) => { setHaftalar(d.haftalar || []); setHafta((d.haftalar || [])[0] || ""); });
  }, [city, birim]);

  useEffect(() => {
    if (!city || !birim) return;
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
          <FilterSelect icon={<MapPin size={14} />} placeholder="İl seçiniz…" value={city}
            onChange={(v) => { setCity(v); setBirim(""); }} options={iller.map((c) => ({ value: c, label: c }))} />
          <FilterSelect icon={birimMeta ? <birimMeta.icon size={14} /> : <Building2 size={14} />}
            placeholder={city ? "Birim seçiniz…" : "Önce il seçin"} value={birim} onChange={setBirim} disabled={!city}
            options={BIRIMLER.map((b) => ({ value: b.key, label: b.label }))} />
          {haftalar.length > 0 && (
            <FilterSelect icon={<CalendarCheck size={14} />} placeholder="Hafta" value={hafta} onChange={setHafta}
              options={haftalar.map((h) => ({ value: h, label: haftaEtiketiGoster(h) }))} />
          )}
          {(city || birim) && (
            <button style={S.clearBtn} onClick={() => { setCity(""); setBirim(""); }}><X size={13} /> Temizle</button>
          )}
        </div>

        {(!city || !birim) && (
          <div style={S.empty}>
            <div style={S.emptyIcon}><CalendarCheck size={22} color="#7C8C90" /></div>
            <div style={S.emptyTitle}>Rapor görüntülemek için il ve birim seç</div>
            <div style={S.emptySub}>Seçim yapıldığında o ile ve birime ait haftalık toplantı ve ders verileri burada listelenecek.</div>
          </div>
        )}

        {city && birim && yukleniyor && <div style={{ padding: 30, textAlign: "center", color: "#7C8C90", fontSize: 13 }}>Yükleniyor…</div>}

        {city && birim && !yukleniyor && !rapor && (
          <div style={S.empty}>
            <div style={S.emptyIcon}><CalendarCheck size={22} color="#7C8C90" /></div>
            <div style={S.emptyTitle}>Bu hafta için henüz rapor girilmemiş</div>
            <div style={S.emptySub}>{city} — {birimMeta?.label} için {hafta ? haftaEtiketiGoster(hafta) : "bu hafta"} rapor bulunamadı.</div>
          </div>
        )}

        {city && birim && !yukleniyor && rapor && (
          <div className="fade">
            <div style={S.summaryRow}>
              <div style={S.summaryCard}>
                <div style={S.summaryLabel}><CalendarCheck size={13} /> Toplantı</div>
                <div style={S.summaryValue}>{sum(toplanti)}</div>
                <div style={S.summarySub}>{toplanti.length} lokasyon · {city} {birimMeta?.label} · {hafta && haftaEtiketiGoster(hafta)}</div>
              </div>
              <div style={S.summaryCard}>
                <div style={S.summaryLabel}><BookOpen size={13} /> Haftalık Ders</div>
                <div style={S.summaryValue}>{sum(ders)}</div>
                <div style={S.summarySub}>{ders.length} lokasyon · {city} {birimMeta?.label} · {hafta && haftaEtiketiGoster(hafta)}</div>
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
  const kisi = sum(rows);
  return (
    <div style={S.section}>
      <div style={S.sectionHead}>{icon}<span>{title}</span></div>
      {rows.length === 0 ? (
        <div style={S.sectionEmpty}>{emptyText}</div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r, i) => (
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