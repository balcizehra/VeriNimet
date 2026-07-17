import prisma from "../../../lib/prisma";
import { requireRole } from "../../../lib/auth";
import { guncelHaftaEtiketi } from "../../../lib/hafta";

const BIRIMLER_KEYS = ["universite", "lise", "ortaokul", "cocuk"];
const TREND_HAFTA_SAYISI = 8;

function bosOzet() {
  return { toplantiKatilim: 0, toplantiLokasyon: 0, dersKatilim: 0, dersLokasyon: 0 };
}

export default requireRole(async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { il, hafta } = req.query;
  const haftaEtiketi = hafta || guncelHaftaEtiketi();

  const where = { hafta: haftaEtiketi };
  if (il) where.il = il;

  const raporlar = await prisma.rapor.findMany({ where, include: { lokasyonlar: true } });

  const genel = bosOzet();
  const birimOzet = {};
  BIRIMLER_KEYS.forEach((b) => (birimOzet[b] = bosOzet()));

  for (const r of raporlar) {
    if (!birimOzet[r.birim]) birimOzet[r.birim] = bosOzet();
    for (const l of r.lokasyonlar) {
      const kisi = Number(l.katilim) || 0;
      if (l.tip === "toplanti") {
        genel.toplantiKatilim += kisi;
        genel.toplantiLokasyon += 1;
        birimOzet[r.birim].toplantiKatilim += kisi;
        birimOzet[r.birim].toplantiLokasyon += 1;
      } else if (l.tip === "ders") {
        genel.dersKatilim += kisi;
        genel.dersLokasyon += 1;
        birimOzet[r.birim].dersKatilim += kisi;
        birimOzet[r.birim].dersLokasyon += 1;
      }
    }
  }

  // Son N haftanın trend verisi (bu il için, ya da tüm Türkiye)
  const haftaWhere = il ? { il } : {};
  const haftaKayitlari = await prisma.rapor.findMany({
    where: haftaWhere,
    select: { hafta: true },
    distinct: ["hafta"],
    orderBy: { hafta: "desc" },
    take: TREND_HAFTA_SAYISI,
  });
  const haftaListesi = haftaKayitlari.map((h) => h.hafta).reverse(); // eskiden yeniye

  let trend = [];
  if (haftaListesi.length > 0) {
    const trendRaporlar = await prisma.rapor.findMany({
      where: { hafta: { in: haftaListesi }, ...(il ? { il } : {}) },
      include: { lokasyonlar: true },
    });
    const map = {};
    haftaListesi.forEach((h) => (map[h] = { hafta: h, toplanti: 0, ders: 0 }));
    for (const r of trendRaporlar) {
      for (const l of r.lokasyonlar) {
        const kisi = Number(l.katilim) || 0;
        if (l.tip === "toplanti") map[r.hafta].toplanti += kisi;
        else if (l.tip === "ders") map[r.hafta].ders += kisi;
      }
    }
    trend = haftaListesi.map((h) => map[h]);
  }

  res.status(200).json({
    hafta: haftaEtiketi,
    il: il || null,
    genel,
    birimOzet,
    trend,
    ilSayisi: il ? 1 : new Set(raporlar.map((r) => r.il)).size,
  });
}, "admin");