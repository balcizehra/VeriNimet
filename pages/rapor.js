import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { ChevronLeft, ChevronRight, Check, MapPin, Plus, Minus, Sparkles, Send, LogOut } from "lucide-react";
import { S } from "../components/styles";
import { BIRIMLER, genericUni, OKUL_TUR } from "../components/data";
import SearchableSelect from "../components/SearchableSelect";
import { guncelHaftaEtiketi, haftaEtiketiGoster } from "../lib/hafta";

function emptyAnswer(birim) {
  return { birim, toplantiYapildi: null, toplantiLokasyonlar: [], dersYapildi: null, dersLokasyonlar: [] };
}
function emptyLoc(birim) {
  return birim === "universite" ? { ad: "", digerMi: false, katilim: "" } : { tur: "", ad: "", katilim: "" };
}
function normName(s) {
  return (s || "").trim().toLocaleLowerCase("tr");
}
function hasNoDuplicateAd(locs) {
  const seen = new Set();
  for (const l of locs) {
    const key = normName(l.ad);
    if (!key) continue;
    if (seen.has(key)) return false;
    seen.add(key);
  }
  return true;
}

export default function Rapor() {
  const router = useRouter();
  const [oturum, setOturum] = useState(null); // { role: "il", il: "Konya" }
  const [phase, setPhase] = useState("setup"); // setup | flow | review | done | gonderiliyor
  const [birimler, setBirimler] = useState([]);
  const [answers, setAnswers] = useState({});
  const [stepIdx, setStepIdx] = useState(0);
  const [subStep, setSubStep] = useState(0);
  const [hataMesaji, setHataMesaji] = useState("");
  const haftaGosterim = useMemo(() => haftaEtiketiGoster(guncelHaftaEtiketi()), []);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then(({ session }) => {
      if (!session || session.role !== "il") return router.replace("/login");
      setOturum(session);
    });
  }, [router]);

  const flowSteps = birimler;
  const currentBirim = flowSteps[stepIdx];
  const currentAnswer = answers[currentBirim] || emptyAnswer(currentBirim);
  const totalSubSteps = 6;

  const globalProgress = useMemo(() => {
    if (phase !== "flow" || flowSteps.length === 0) return 0;
    const done = stepIdx * totalSubSteps + subStep;
    return Math.min(100, Math.round((done / (flowSteps.length * totalSubSteps)) * 100));
  }, [phase, stepIdx, subStep, flowSteps.length]);

  function toggleBirim(key) {
    setBirimler((prev) => (prev.includes(key) ? prev.filter((b) => b !== key) : [...prev, key]));
  }
  function updateAnswer(birim, patch) {
    setAnswers((prev) => ({ ...prev, [birim]: { ...emptyAnswer(birim), ...prev[birim], ...patch } }));
  }
  function setLocCount(field, n) {
    const arr = Array.from({ length: n }, (_, i) => currentAnswer[field][i] || emptyLoc(currentBirim));
    updateAnswer(currentBirim, { [field]: arr });
  }
  function setLocValue(field, i, patch) {
  const arr = [...currentAnswer[field]];
  arr[i] = { ...arr[i], ...patch };
  updateAnswer(currentBirim, { [field]: arr });
}

  function startFlow() {
    if (birimler.length === 0) return;
    const init = {};
    birimler.forEach((b) => (init[b] = emptyAnswer(b)));
    setAnswers(init);
    setStepIdx(0);
    setSubStep(0);
    setPhase("flow");
  }

  function nextSub() {
    let ns = subStep + 1;
    if (ns === 1 && currentAnswer.toplantiYapildi !== true) ns = 3;
    if (ns === 2 && (currentAnswer.toplantiLokasyonlar || []).length === 0) ns = 3;
    if (ns === 4 && currentAnswer.dersYapildi !== true) ns = 6;
    if (ns === 5 && (currentAnswer.dersLokasyonlar || []).length === 0) ns = 6;

    if (ns >= 6) {
      if (stepIdx + 1 < flowSteps.length) { setStepIdx(stepIdx + 1); setSubStep(0); }
      else setPhase("review");
    } else setSubStep(ns);
  }
  function prevSub() {
    let ps = subStep - 1;
    if (ps === 2 && (currentAnswer.toplantiLokasyonlar || []).length === 0) ps = 1;
    if (ps === 1 && currentAnswer.toplantiYapildi !== true) ps = 0;
    if (ps === 5 && (currentAnswer.dersLokasyonlar || []).length === 0) ps = 4;
    if (ps === 4 && currentAnswer.dersYapildi !== true) ps = 3;

    if (ps < 0) {
      if (stepIdx > 0) { setStepIdx(stepIdx - 1); setSubStep(5); }
      else setPhase("setup");
    } else setSubStep(ps);
  }

  async function gonder() {
    setPhase("gonderiliyor");
    setHataMesaji("");
    try {
      for (const birim of birimler) {
        const a = answers[birim];
        const res = await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            birim,
            toplantiYapildi: !!a.toplantiYapildi,
            toplantiLokasyonlar: a.toplantiLokasyonlar,
            dersYapildi: !!a.dersYapildi,
            dersLokasyonlar: a.dersLokasyonlar,
          }),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || "Gönderim başarısız.");
        }
      }
      setPhase("done");
    } catch (err) {
      setHataMesaji(err.message);
      setPhase("review");
    }
  }

  async function cikisYap() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (!oturum) return null;

  const birimMeta = BIRIMLER.find((b) => b.key === currentBirim) || {};
  const BirimIcon = birimMeta.icon;
  const canAdvance = (() => {
    if (phase !== "flow") return true;
    if (subStep === 0) return currentAnswer.toplantiYapildi !== null;
    if (subStep === 1) return (currentAnswer.toplantiLokasyonlar || []).length > 0;
    if (subStep === 2) return currentAnswer.toplantiLokasyonlar.every((l) => l.ad && l.katilim !== "" && (currentBirim === "universite" || l.tur)) && hasNoDuplicateAd(currentAnswer.toplantiLokasyonlar);
    if (subStep === 3) return currentAnswer.dersYapildi !== null;
    if (subStep === 4) return (currentAnswer.dersLokasyonlar || []).length > 0;
    if (subStep === 5) return currentAnswer.dersLokasyonlar.every((l) => l.ad && l.katilim !== "" && (currentBirim === "universite" || l.tur)) && hasNoDuplicateAd(currentAnswer.dersLokasyonlar);    
  return true;
  })();

  return (
    <div style={S.page}>
      <div id="app-shell" style={S.shell}>
        <div style={S.header}>
          <div style={S.headerTop}>
            <div style={S.brandRow}>
              <div style={S.logoDot} />
              <span style={S.brandText}>GENÇ İHH</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ ...S.cityPill, cursor: "default" }} title="Rapor bu haftaya kaydedilecek">{haftaGosterim}</div>
              <div style={S.cityPill}><MapPin size={13} /> {oturum.il}</div>
              <button onClick={cikisYap} title="Çıkış yap" style={{ ...S.ghostBtn, padding: 8 }}><LogOut size={14} /></button>
            </div>
          </div>
          {phase === "flow" && (
            <div style={S.progressTrack}><div style={{ ...S.progressFill, width: `${globalProgress}%` }} /></div>
          )}
        </div>

        {phase === "setup" && (
          <div style={S.body} className="fade">
            <div style={S.eyebrow}>HAFTALIK SAHA RAPORU</div>
            <h1 style={S.h1}>Bu haftaki çalışmanı bildir</h1>
            <p style={S.sub}>Rapor edeceğin birimleri seç. Aynı hafta içinde tekrar gönderirsen kayıt güncellenir.</p>

            <label style={{ ...S.label, marginTop: 22 }}>Birimler <span style={S.req}>*</span></label>
            <div style={S.chipGrid}>
              {BIRIMLER.map(({ key, label, icon: Icon }) => {
                const active = birimler.includes(key);
                return (
                  <button key={key} onClick={() => toggleBirim(key)} style={{ ...S.chip, ...(active ? S.chipActive : {}) }}>
                    <Icon size={18} strokeWidth={2.2} color={active ? "#fff" : "#0F3A44"} />
                    <span>{label}</span>
                    {active && <Check size={14} style={{ marginLeft: "auto" }} />}
                  </button>
                );
              })}
            </div>

            <button disabled={birimler.length === 0} onClick={startFlow} style={{ ...S.primaryBtn, marginTop: 30, opacity: birimler.length === 0 ? 0.4 : 1 }}>
              Rapora Başla <ChevronRight size={17} />
            </button>
          </div>
        )}

        {phase === "flow" && currentBirim && (
          <div style={S.body} className="fade" key={currentBirim + subStep}>
            <div style={S.birimTag}><BirimIcon size={15} /> {birimMeta.label} <span style={S.stepLabel}>· {stepIdx + 1}/{flowSteps.length}</span></div>

            {subStep === 0 && (
              <YesNo title={`Bu hafta ${birimMeta.label.toLowerCase()} komisyon toplantısı yapıldı mı?`} hint="Yapıldı / Yapılmadı şeklinde seçiniz."
                value={currentAnswer.toplantiYapildi}
                onChange={(v) => updateAnswer(currentBirim, { toplantiYapildi: v, toplantiLokasyonlar: v ? currentAnswer.toplantiLokasyonlar : [] })} />
            )}
            {subStep === 1 && (
              <Count title={`Bu hafta ${birimMeta.label.toLowerCase()} için yapılan toplantı kaç lokasyonda yapıldı?`}
                value={currentAnswer.toplantiLokasyonlar.length} onChange={(n) => setLocCount("toplantiLokasyonlar", n)} />
            )}
            {subStep === 2 && (
            <LocDetails birim={currentBirim} city={oturum.il} title="Toplantı detaylarını gir"
              locs={currentAnswer.toplantiLokasyonlar} setLocValue={(i, patch) => setLocValue("toplantiLokasyonlar", i, patch)} />
            )}
            {subStep === 3 && (
              <YesNo title={`Bu hafta ${birimMeta.label.toLowerCase()} için haftalık ders yapıldı mı?`} hint="Yapıldı / Yapılmadı şeklinde seçiniz."
                value={currentAnswer.dersYapildi}
                onChange={(v) => updateAnswer(currentBirim, { dersYapildi: v, dersLokasyonlar: v ? currentAnswer.dersLokasyonlar : [] })} />
            )}
            {subStep === 4 && (
              <Count title={`${birimMeta.label} için yapılan haftalık ders kaç lokasyonda yapıldı?`}
                value={currentAnswer.dersLokasyonlar.length} onChange={(n) => setLocCount("dersLokasyonlar", n)} />
            )}
            {subStep === 5 && (
            <LocDetails birim={currentBirim} city={oturum.il} title="Haftalık ders detaylarını gir"
              locs={currentAnswer.dersLokasyonlar} setLocValue={(i, patch) => setLocValue("dersLokasyonlar", i, patch)} />
            )}

            <div style={S.navRow}>
              <button onClick={prevSub} style={S.ghostBtn}><ChevronLeft size={17} /> Geri</button>
              <button onClick={nextSub} disabled={!canAdvance} style={{ ...S.primaryBtn, opacity: canAdvance ? 1 : 0.4 }}>Devam <ChevronRight size={17} /></button>
            </div>
          </div>
        )}

        {phase === "review" && (
          <div style={S.body} className="fade">
            <div style={S.eyebrow}>ÖZET</div>
            <h1 style={S.h1}>Göndermeden önce kontrol et</h1>
            <p style={S.sub}>{oturum.il} · {birimler.length} birim raporlandı</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}>
              {birimler.map((b) => {
                const a = answers[b];
                const meta = BIRIMLER.find((x) => x.key === b);
                const toplamT = a.toplantiLokasyonlar.reduce((s, l) => s + (Number(l.katilim) || 0), 0);
                const toplamD = a.dersLokasyonlar.reduce((s, l) => s + (Number(l.katilim) || 0), 0);
                return (
                  <div key={b} style={S.reviewCard}>
                    <div style={S.reviewCardHead}><meta.icon size={16} color="#17A673" /> {meta.label}</div>
                    <div style={S.reviewLine}>
                      <span style={S.reviewLineLabel}>Komisyon toplantısı</span>
                      <span style={S.reviewLineValue}>
                        {a.toplantiYapildi ? `Yapıldı · ${a.toplantiLokasyonlar.length} lok. · ${toplamT} kişi` : "Yapılmadı"}
                      </span>
                    </div>
                    {a.toplantiYapildi && a.toplantiLokasyonlar.length > 0 && (
                      <div style={{ marginTop: 6, paddingLeft: 4, display: "flex", flexDirection: "column", gap: 3 }}>
                        {a.toplantiLokasyonlar.map((l, i) => (
                          <div key={i} style={{ fontSize: 12.5, color: "#5C6B70" }}>
                            · {l.ad}{l.tur ? ` (${l.tur})` : ""} — {l.katilim || 0} kişi
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ ...S.reviewLine, marginTop: 8 }}>
                      <span style={S.reviewLineLabel}>Haftalık ders</span>
                      <span style={S.reviewLineValue}>
                        {a.dersYapildi ? `Yapıldı · ${a.dersLokasyonlar.length} lok. · ${toplamD} kişi` : "Yapılmadı"}
                      </span>
                    </div>
                    {a.dersYapildi && a.dersLokasyonlar.length > 0 && (
                      <div style={{ marginTop: 6, paddingLeft: 4, display: "flex", flexDirection: "column", gap: 3 }}>
                        {a.dersLokasyonlar.map((l, i) => (
                          <div key={i} style={{ fontSize: 12.5, color: "#5C6B70" }}>
                            · {l.ad}{l.tur ? ` (${l.tur})` : ""} — {l.katilim || 0} kişi
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {hataMesaji && <div style={S.errorBox}>{hataMesaji}</div>}

            <div style={S.navRow}>
              <button onClick={() => { setStepIdx(0); setSubStep(0); setPhase("flow"); }} style={S.ghostBtn}><ChevronLeft size={17} /> Düzenle</button>
              <button onClick={gonder} style={S.primaryBtn}>Raporu Gönder <Send size={16} /></button>
            </div>
          </div>
        )}

        {phase === "gonderiliyor" && (
          <div style={{ ...S.body, textAlign: "center", padding: "60px 30px" }}>Gönderiliyor…</div>
        )}

        {phase === "done" && (
          <div style={{ ...S.body, textAlign: "center", paddingTop: 50 }} className="fade">
            <div style={S.doneBadge}><Check size={26} strokeWidth={3} color="#fff" /></div>
            <h1 style={{ ...S.h1, marginTop: 18 }}>Rapor gönderildi</h1>
            <p style={S.sub}>{oturum.il} için bu haftaki saha verileri genel merkeze iletildi.</p>

            <div style={{ textAlign: "left", marginTop: 30 }}>
              <div style={{ ...S.eyebrow, textAlign: "left" }}>GÖNDERİLEN RAPOR</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
                {birimler.map((b) => {
                  const a = answers[b];
                  const meta = BIRIMLER.find((x) => x.key === b);
                  const toplamT = a.toplantiLokasyonlar.reduce((s, l) => s + (Number(l.katilim) || 0), 0);
                  const toplamD = a.dersLokasyonlar.reduce((s, l) => s + (Number(l.katilim) || 0), 0);
                  return (
                    <div key={b} style={S.reviewCard}>
                      <div style={S.reviewCardHead}><meta.icon size={16} color="#17A673" /> {meta.label}</div>
                      <div style={S.reviewLine}>
                        <span style={S.reviewLineLabel}>Komisyon toplantısı</span>
                        <span style={S.reviewLineValue}>
                          {a.toplantiYapildi ? `Yapıldı · ${a.toplantiLokasyonlar.length} lok. · ${toplamT} kişi` : "Yapılmadı"}
                        </span>
                      </div>
                      {a.toplantiYapildi && a.toplantiLokasyonlar.length > 0 && (
                        <div style={{ marginTop: 6, paddingLeft: 4, display: "flex", flexDirection: "column", gap: 3 }}>
                          {a.toplantiLokasyonlar.map((l, i) => (
                            <div key={i} style={{ fontSize: 12.5, color: "#5C6B70" }}>
                              · {l.ad}{l.tur ? ` (${l.tur})` : ""} — {l.katilim || 0} kişi
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ ...S.reviewLine, marginTop: 8 }}>
                        <span style={S.reviewLineLabel}>Haftalık ders</span>
                        <span style={S.reviewLineValue}>
                          {a.dersYapildi ? `Yapıldı · ${a.dersLokasyonlar.length} lok. · ${toplamD} kişi` : "Yapılmadı"}
                        </span>
                      </div>
                      {a.dersYapildi && a.dersLokasyonlar.length > 0 && (
                        <div style={{ marginTop: 6, paddingLeft: 4, display: "flex", flexDirection: "column", gap: 3 }}>
                          {a.dersLokasyonlar.map((l, i) => (
                            <div key={i} style={{ fontSize: 12.5, color: "#5C6B70" }}>
                              · {l.ad}{l.tur ? ` (${l.tur})` : ""} — {l.katilim || 0} kişi
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button onClick={() => { setPhase("setup"); setBirimler([]); setAnswers({}); }} style={{ ...S.primaryBtn, margin: "26px auto 0" }}>
              <Sparkles size={16} /> Yeni rapor başlat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function YesNo({ title, hint, value, onChange }) {
  return (
    <div>
      <h2 style={S.h2}>{title} <span style={S.req}>*</span></h2>
      {hint && <p style={S.hint}>{hint}</p>}
      <div style={S.yesNoRow}>
        <button style={{ ...S.yesNoBtn, ...(value === true ? S.yesNoActiveYes : {}) }} onClick={() => onChange(true)}>Yapıldı</button>
        <button style={{ ...S.yesNoBtn, ...(value === false ? S.yesNoActiveNo : {}) }} onClick={() => onChange(false)}>Yapılmadı</button>
      </div>
    </div>
  );
}
function Count({ title, hint, value, onChange, max = 20 }) {
  const n = value || 0;
  const [text, setText] = useState(String(n));

  // Keep the text field in sync when value changes from outside (e.g. +/- buttons, quick-select)
  useEffect(() => { setText(String(n)); }, [n]);

  function commit(raw) {
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) { setText(String(n)); return; } // invalid input -> revert to last valid value
    const clamped = Math.max(0, Math.min(max, parsed));
    onChange(clamped);
    setText(String(clamped));
  }

  return (
    <div>
      <h2 style={S.h2}>{title} <span style={S.req}>*</span></h2>
      {hint && <p style={S.hint}>{hint}</p>}
      <div style={S.counterRow}>
        <button style={S.counterBtn} onClick={() => onChange(Math.max(0, n - 1))}><Minus size={18} /></button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={text}
          onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, ""))}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
          style={{ ...S.counterVal, border: "none", outline: "none", background: "transparent", width: 64, textAlign: "center" }}
        />
        <button style={S.counterBtn} onClick={() => onChange(Math.min(max, n + 1))}><Plus size={18} /></button>
      </div>
      <div style={S.quickRow}>
        {[1, 2, 3, 4, 5].map((v) => (
          <button key={v} onClick={() => onChange(v)} style={{ ...S.quickBtn, ...(n === v ? S.quickBtnActive : {}) }}>{v}</button>
        ))}
      </div>
    </div>
  );
}
function LocDetails({ birim, city, title, locs, setLocValue }) {
  const options = birim === "universite" ? genericUni(city) : [];

  return (
    <div>
      <h2 style={S.h2}>{title} <span style={S.req}>*</span></h2>
      <p style={S.hint}>Her lokasyon için ilgili bilgileri doldur.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
{locs.map((loc, i) => {
  const takenAd = new Set(
    locs
      .filter((_, j) => j !== i)
      .map((l) => l.ad)
      .filter((v) => v && v !== "__diger__")
  );

  const availableUniOptions = options.filter((o) => !takenAd.has(o));

  const takenTur = new Set(
    locs
      .filter((_, j) => j !== i)
      .map((l) => l.tur)
      .filter(Boolean)
  );

  const availableTurOptions = OKUL_TUR.filter((o) => !takenTur.has(o));

  const isDuplicateName =
    !!loc.ad &&
    locs.some(
      (l, j) =>
        j !== i &&
        normName(l.ad) === normName(loc.ad)
    );

  return (
    <div key={i} style={S.locCard}>
      <div style={S.locCardHead}>Lokasyon {i + 1}</div>

      {birim === "universite" ? (
        <>
          <label style={S.miniLabel}>Üniversite</label>

          <SearchableSelect
            options={availableUniOptions}
            value={loc.digerMi ? "__diger__" : loc.ad}
            onChange={(v) => {
              if (v === "__diger__") {
                setLocValue(i, {
                  digerMi: true,
                  ad: "",
                });
              } else {
                setLocValue(i, {
                  digerMi: false,
                  ad: v,
                });
              }
            }}
            placeholder="Üniversite adı yazarak arayın…"
            allowOther
            otherValue="__diger__"
            otherLabel="Diğer (yaz)"
          />

          {loc.digerMi && (
            <input
              style={{
                ...S.select,
                marginTop: 8,
                ...(isDuplicateName
                  ? { borderColor: "#D95B43" }
                  : {}),
              }}
              placeholder="Üniversite adını yazın"
              value={loc.ad}
              onChange={(e) =>
                setLocValue(i, {
                  ad: e.target.value,
                })
              }
            />
          )}
        </>
      ) : (
        <>
          <label style={S.miniLabel}>Okul türü</label>

          <select
            style={S.select}
            value={loc.tur}
            onChange={(e) =>
              setLocValue(i, {
                tur: e.target.value,
              })
            }
          >
            <option value="">Seçiniz…</option>

            {availableTurOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>

          <label style={{ ...S.miniLabel, marginTop: 10 }}>
            Okul adı
          </label>

          <input
            style={{
              ...S.select,
              ...(isDuplicateName
                ? { borderColor: "#D95B43" }
                : {}),
            }}
            placeholder="Örn. Atatürk Fen Lisesi"
            value={loc.ad}
            onChange={(e) =>
              setLocValue(i, {
                ad: e.target.value,
              })
            }
          />
        </>
      )}

      {isDuplicateName && (
        <p
          style={{
            fontSize: 12,
            color: "#D95B43",
            marginTop: 6,
          }}
        >
          Bu isim başka bir lokasyonda zaten kullanıldı.
          Lütfen farklı bir isim girin.
        </p>
      )}

      <label style={{ ...S.miniLabel, marginTop: 10 }}>
        Katılımcı sayısı
      </label>

      <input
        type="number"
        min="0"
        style={S.select}
        placeholder="Örn. 24"
        value={loc.katilim}
        onChange={(e) =>
          setLocValue(i, {
            katilim: e.target.value,
          })
        }
      />
    </div>
  );
})}
      </div>
    </div>
  );
}