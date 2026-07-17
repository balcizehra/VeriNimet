import prisma from "../../../lib/prisma";
import { getSession } from "../../../lib/auth";
import { guncelHaftaEtiketi } from "../../../lib/hafta";

const GECERLI_BIRIMLER = ["universite", "lise", "ortaokul", "cocuk"];

export default async function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: "Yetkisiz erişim." });

  if (req.method === "POST") {
    if (session.role !== "il") return res.status(403).json({ error: "Sadece il hesapları rapor gönderebilir." });

    const { birim, toplantiYapildi, toplantiLokasyonlar, dersYapildi, dersLokasyonlar } = req.body || {};
    if (!GECERLI_BIRIMLER.includes(birim)) return res.status(400).json({ error: "Geçersiz birim." });

    const hafta = guncelHaftaEtiketi();
    const il = session.il; // güvenlik: il, oturumdan alınır, body'den değil

    const lokasyonlar = [
      ...(toplantiYapildi ? (toplantiLokasyonlar || []).map((l) => ({ ...l, tip: "toplanti" })) : []),
      ...(dersYapildi ? (dersLokasyonlar || []).map((l) => ({ ...l, tip: "ders" })) : []),
    ].map((l) => ({
      tip: l.tip,
      ad: String(l.ad || "").slice(0, 200),
      tur: l.tur ? String(l.tur).slice(0, 100) : null,
      katilim: Math.max(0, parseInt(l.katilim, 10) || 0),
    }));

    const mevcut = await prisma.rapor.findUnique({ where: { il_birim_hafta: { il, birim, hafta } } });

    let rapor;
    if (mevcut) {
      await prisma.lokasyon.deleteMany({ where: { raporId: mevcut.id } });
      rapor = await prisma.rapor.update({
        where: { id: mevcut.id },
        data: {
          toplantiYapildi: !!toplantiYapildi,
          dersYapildi: !!dersYapildi,
          lokasyonlar: { create: lokasyonlar },
        },
        include: { lokasyonlar: true },
      });
    } else {
      rapor = await prisma.rapor.create({
        data: {
          il, birim, hafta,
          toplantiYapildi: !!toplantiYapildi,
          dersYapildi: !!dersYapildi,
          lokasyonlar: { create: lokasyonlar },
        },
        include: { lokasyonlar: true },
      });
    }

    return res.status(200).json({ ok: true, hafta, rapor });
  }

  if (req.method === "GET") {
    const { il, birim, hafta } = req.query;
    if (session.role === "il" && il && il !== session.il) {
      return res.status(403).json({ error: "Sadece kendi ilinizin verisini görebilirsiniz." });
    }
    if (!il || !birim) return res.status(400).json({ error: "il ve birim zorunlu." });

    const haftaEtiketi = hafta || guncelHaftaEtiketi();
    const rapor = await prisma.rapor.findUnique({
      where: { il_birim_hafta: { il, birim, hafta: haftaEtiketi } },
      include: { lokasyonlar: true },
    });

    return res.status(200).json({
      hafta: haftaEtiketi,
      rapor: rapor
        ? {
            toplantiYapildi: rapor.toplantiYapildi,
            dersYapildi: rapor.dersYapildi,
            toplanti: rapor.lokasyonlar.filter((l) => l.tip === "toplanti"),
            ders: rapor.lokasyonlar.filter((l) => l.tip === "ders"),
            guncellenmeTarihi: rapor.guncellenmeTarihi,
          }
        : null,
    });
  }

  return res.status(405).end();
}
