import prisma from "../../../lib/prisma";
import { requireRole } from "../../../lib/auth";

const BIRIMLER_KEYS = ["universite", "lise", "ortaokul", "cocuk"];
const HAFTA_SAYISI = 8;

function parseList(v) {
  if (!v) return [];
  return String(v).split(",").map((s) => s.trim()).filter(Boolean);
}

async function sonHaftalar(where, n) {
  const kayitlar = await prisma.rapor.findMany({
    where, select: { hafta: true }, distinct: ["hafta"], orderBy: { hafta: "desc" },
  });
  return kayitlar
    .map((k) => k.hafta)
    .filter((h) => /^\d{4}-W\d{2}$/.test(h))
    .sort()
    .slice(-n);
}

export default requireRole(async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const modul = req.query.modul === "ders" ? "ders" : req.query.modul === "lokasyon" ? "lokasyon" : "toplanti";
  const illler = parseList(req.query.il);
  const birimler = parseList(req.query.birim);

  const raporWhere = {};
  if (illler.length) raporWhere.il = { in: illler };
  if (birimler.length) raporWhere.birim = { in: birimler };

  const haftalar = await sonHaftalar(raporWhere, HAFTA_SAYISI);

  if (modul === "lokasyon") {
    const raporlar = await prisma.rapor.findMany({
      where: { ...raporWhere, hafta: { in: haftalar } },
      include: { lokasyonlar: true },
    });

    const lokasyonMap = {};
    for (const r of raporlar) {
      for (const l of r.lokasyonlar) {
        const key = `${r.il}|${r.birim}|${l.ad}`;
        if (!lokasyonMap[key]) lokasyonMap[key] = { il: r.il, birim: r.birim, ad: l.ad, tur: l.tur || null, katilim: 0 };
        lokasyonMap[key].katilim += Number(l.katilim) || 0;
      }
    }
    const lokasyonlar = Object.values(lokasyonMap).sort((a, b) => b.katilim - a.katilim);

    const turMap = {};
    for (const l of lokasyonlar) {
      if (!l.tur) continue;
      if (!turMap[l.tur]) turMap[l.tur] = { tur: l.tur, katilim: 0, lokasyonSayisi: 0 };
      turMap[l.tur].katilim += l.katilim;
      turMap[l.tur].lokasyonSayisi += 1;
    }
    const turKarsilastirma = Object.values(turMap)
      .map((t) => ({ ...t, ortalama: Math.round((t.katilim / t.lokasyonSayisi) * 10) / 10 }))
      .sort((a, b) => b.ortalama - a.ortalama);

    const toplamKatilim = lokasyonlar.reduce((s, l) => s + l.katilim, 0);

    return res.status(200).json({
      modul, haftalar,
      toplamLokasyon: lokasyonlar.length,
      toplamKatilim,
      ortalamaKatilimLokasyon: lokasyonlar.length ? Math.round((toplamKatilim / lokasyonlar.length) * 10) / 10 : 0,
      enAktif: lokasyonlar[0] || null,
      lokasyonlar: lokasyonlar.slice(0, 50),
      turKarsilastirma,
    });
  }

  const raporlar = await prisma.rapor.findMany({
    where: { ...raporWhere, hafta: { in: haftalar } },
    include: { lokasyonlar: true },
  });

  let toplamKatilim = 0, toplamLokasyon = 0;
  const ilMap = {}, birimMap = {};
  const haftaIlMap = {}, haftaBirimMap = {};
  haftalar.forEach((h) => { haftaIlMap[h] = {}; haftaBirimMap[h] = {}; });

  for (const r of raporlar) {
    for (const l of r.lokasyonlar) {
      if (l.tip !== modul) continue;
      const kisi = Number(l.katilim) || 0;
      toplamKatilim += kisi;
      toplamLokasyon += 1;

      if (!ilMap[r.il]) ilMap[r.il] = { il: r.il, katilim: 0, lokasyon: 0 };
      ilMap[r.il].katilim += kisi; ilMap[r.il].lokasyon += 1;

      if (!birimMap[r.birim]) birimMap[r.birim] = { birim: r.birim, katilim: 0, lokasyon: 0 };
      birimMap[r.birim].katilim += kisi; birimMap[r.birim].lokasyon += 1;

      haftaIlMap[r.hafta][r.il] = (haftaIlMap[r.hafta][r.il] || 0) + kisi;
      haftaBirimMap[r.hafta][r.birim] = (haftaBirimMap[r.hafta][r.birim] || 0) + kisi;
    }
  }

  const ilKarsilastirma = Object.values(ilMap).sort((a, b) => b.katilim - a.katilim).slice(0, 10);
  const birimKarsilastirma = BIRIMLER_KEYS.map((b) => birimMap[b] || { birim: b, katilim: 0, lokasyon: 0 });

  const trend = haftalar.map((h) => ({ hafta: h, il: haftaIlMap[h], birim: haftaBirimMap[h] }));

  // Fixed Weekly Change Calculation Integration
  const sonIkiHafta = haftalar.slice(-2);
  const oncekiKatilim = sonIkiHafta.length === 2  ? Object.values(haftaIlMap[sonIkiHafta[0]] || {}).reduce((s, v) => s + v, 0) : null;
  const guncelKatilim = sonIkiHafta.length === 2  ? Object.values(haftaIlMap[sonIkiHafta[1]] || {}).reduce((s, v) => s + v, 0) : null;
  
  let degisim = null;
  if (oncekiKatilim !== null && guncelKatilim !== null) {  
    if (oncekiKatilim === 0 && guncelKatilim === 0) {    
      degisim = { tip: "none" };  
    } else if (oncekiKatilim === 0 && guncelKatilim > 0) {    
      degisim = { tip: "yeni", guncel: guncelKatilim };   
    } else if (oncekiKatilim > 0 && guncelKatilim === 0) {    
      degisim = { tip: "yuzde", deger: -100 };  
    } else {    
      degisim = { tip: "yuzde", deger: Math.round(((guncelKatilim - oncekiKatilim) / oncekiKatilim) * 1000) / 10 };  
    }
  }

  res.status(200).json({
    modul, haftalar, toplamKatilim, toplamLokasyon,
    ortalamaKatilimLokasyon: toplamLokasyon ? Math.round((toplamKatilim / toplamLokasyon) * 10) / 10 : 0,
    degisim, ilKarsilastirma, birimKarsilastirma, trend,
  });
}, "admin");