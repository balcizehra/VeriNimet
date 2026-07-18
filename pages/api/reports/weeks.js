import { requireRole } from "../../../lib/auth";
import { tumHaftalar } from "../../../lib/hafta";

// Admin panelindeki hafta dropdown'u: veri olsun olmasın, 1. haftadan güncel
// haftaya kadar TÜM haftaları listeler (en yeniden en eskiye). Hangi haftalarda
// gerçekten veri olduğu, seçim yapıldıktan sonra /api/reports üzerinden anlaşılır.
export default requireRole(async function handler(req, res) {
  const { il, birim } = req.query;

  const where = {};
  if (il) where.il = il;
  if (birim) where.birim = birim;

  res.status(200).json({ haftalar: tumHaftalar() });
  const kayitlar = await prisma.rapor.findMany({
    where,
    select: { hafta: true },
    distinct: ["hafta"],
    orderBy: { hafta: "desc" },
  });

  res.status(200).json({ haftalar: kayitlar.map((k) => k.hafta) });
}, "admin");